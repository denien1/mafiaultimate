
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { DbService } from './db.service';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private db: DbService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const authHeader = (req.headers['authorization'] || '').toString();
    const token = authHeader.replace(/^Bearer\s+/i,'');
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev') as any;
      const uid = payload.sub;
      const res = await this.db.query('SELECT 1 FROM user_roles ur JOIN roles r ON r.id=ur.role_id WHERE ur.user_id=$1 AND r.name=$2',[uid,'admin']);
      return !!res.rows.length;
    } catch { return false; }
  }
}
