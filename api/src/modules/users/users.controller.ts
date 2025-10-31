import { Controller, Get, Headers } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { DbService } from '../../db.service';

function authUser(authorization?: string): string | null {
  if (!authorization) return null;
  const token = authorization.replace(/^Bearer\s+/i,'').trim();
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev') as any;
    return payload.sub as string;
  } catch (e) { return null; }
}

@Controller()
export class UsersController {
  constructor(private db: DbService) {}

  @Get('/me')
  async me(@Headers('authorization') authorization?: string) {
    const uid = authUser(authorization);
    if (!uid) return { error: 'unauthorized' };
    const user = await this.db.query('SELECT id,email,display_name,created_at FROM users WHERE id=$1',[uid]);
    const profile = await this.db.query('SELECT * FROM profiles WHERE user_id=$1',[uid]);
    return { user: user.rows[0], profile: profile.rows[0] };
  }
}
