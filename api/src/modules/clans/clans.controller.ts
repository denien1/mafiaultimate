import { Controller, Get, Post, Param, Headers } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { DbService } from '../../db.service';

function uid(auth?: string): string | null {
  if (!auth) return null;
  try {
    const token = auth.replace(/^Bearer\s+/i,'').trim();
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev') as any;
    return payload.sub as string;
  } catch { return null; }
}

@Controller('clans')
export class ClansController {
  constructor(private db: DbService) {}

  @Get()
  async list() {
    const { rows } = await this.db.query('SELECT id,name,tag FROM clans ORDER BY id');
    return { clans: rows };
  }

  @Post(':id/join')
  async join(@Param('id') id: string, @Headers('authorization') auth?: string) {
    const userId = uid(auth);
    if (!userId) return { error: 'unauthorized' };
    await this.db.query('INSERT INTO clan_members (clan_id,user_id) VALUES ($1,$2) ON CONFLICT (clan_id,user_id) DO NOTHING',[id,userId]);
    return { ok: true };
  }
}
