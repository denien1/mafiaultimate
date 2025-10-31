import { Controller, Get, Headers } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { DbService } from '../../db.service';

function uidFromAuth(auth?: string): string | null {
  if (!auth) return null;
  try {
    const token = auth.replace(/^Bearer\s+/i,'').trim();
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev') as any;
    return payload.sub as string;
  } catch { return null; }
}

@Controller('me')
export class StatsController {
  constructor(private db: DbService) {}

  @Get('stats')
  async stats(@Headers('authorization') auth?: string) {
    const uid = uidFromAuth(auth);
    if (!uid) return { error: 'unauthorized' };
    // regen +1 energy/stamina per 5 minutes (demo math on read)
    const now = new Date();
    const res = await this.db.query('SELECT * FROM stats WHERE user_id=$1',[uid]);
    if (!res.rows.length) return { error: 'no-stats' };
    const s = res.rows[0];
    const last = new Date(s.last_regen_at);
    const mins = Math.floor((now.getTime()-last.getTime())/60000);
    const ticks = Math.floor(mins/5);
    if (ticks > 0) {
      const newEnergy = Math.min(100, s.energy + ticks);
      const newStamina = Math.min(100, s.stamina + ticks);
      await this.db.query('UPDATE stats SET energy=$1, stamina=$2, last_regen_at=now() WHERE user_id=$3',[newEnergy,newStamina,uid]);
      s.energy = newEnergy; s.stamina = newStamina; s.last_regen_at = now;
    }
    return { stats: s };
  }
}
