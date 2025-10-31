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

@Controller('properties')
export class PropertiesController {
  constructor(private db: DbService) {}

  @Get()
  async list() {
    const { rows } = await this.db.query('SELECT * FROM properties ORDER BY id');
    return { properties: rows };
  }

  @Post(':id/claim')
  async claim(@Param('id') id: string, @Headers('authorization') auth?: string) {
    const userId = uid(auth);
    if (!userId) return { error: 'unauthorized' };
    const own = (await this.db.query('SELECT qty, last_claimed_at FROM property_ownership WHERE user_id=$1 AND property_id=$2',[userId,id])).rows[0];
    if (!own || own.qty <= 0) return { error: 'not-owned' };
    const prop = (await this.db.query('SELECT * FROM properties WHERE id=$1',[id])).rows[0];
    const last = own.last_claimed_at ? new Date(own.last_claimed_at) : new Date(0);
    const mins = Math.max(0, Math.floor((Date.now()-last.getTime())/60000));
    const income = mins * prop.base_income * own.qty; // simple accrual
    await this.db.query('UPDATE property_ownership SET last_claimed_at=now() WHERE user_id=$1 AND property_id=$2',[userId,id]);
    await this.db.query('UPDATE profiles SET cash=cash+$1 WHERE user_id=$2',[income, userId]);
    return { ok: true, income, minutes: mins };
  }
}
