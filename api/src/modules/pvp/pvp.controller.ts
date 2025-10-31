import { Controller, Post, Param, Headers } from '@nestjs/common';
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

@Controller('pvp')
export class PvPController {
  constructor(private db: DbService) {}

  @Post('fight/:opponentId')
  async fight(@Param('opponentId') opponentId: string, @Headers('authorization') auth?: string) {
    const userId = uid(auth);
    if (!userId) return { error: 'unauthorized' };
    if (opponentId === userId) return { error: 'no-self-fight' };
    const me = (await this.db.query('SELECT s.attack,s.defense,p.cash FROM stats s JOIN profiles p ON p.user_id=s.user_id WHERE s.user_id=$1',[userId])).rows[0];
    const them = (await this.db.query('SELECT s.attack,s.defense,p.cash FROM stats s JOIN profiles p ON p.user_id=s.user_id WHERE s.user_id=$1',[opponentId])).rows[0];
    if (!them) return { error: 'opponent-not-found' };
    const myScore = me.attack + Math.random()*3;
    const theirScore = them.defense + Math.random()*3;
    const win = myScore >= theirScore;
    const delta = Math.min(50, Math.max(5, Math.floor(Math.random()*40)));
    if (win) {
      await this.db.query('UPDATE profiles SET cash=cash+$1 WHERE user_id=$2',[delta, userId]);
      await this.db.query('UPDATE profiles SET cash=GREATEST(0,cash-$1) WHERE user_id=$2',[delta, opponentId]);
    } else {
      await this.db.query('UPDATE profiles SET cash=GREATEST(0,cash-$1) WHERE user_id=$2',[delta, userId]);
      await this.db.query('UPDATE profiles SET cash=cash+$1 WHERE user_id=$2',[delta, opponentId]);
    }
    await this.db.query('INSERT INTO pvp_fights (attacker_id, defender_id, result, delta_cash) VALUES ($1,$2,$3,$4)',
      [userId, opponentId, win ? 'win':'loss', win ? delta : -delta]);
    return { ok: true, result: win ? 'win' : 'loss', delta_cash: win ? delta : -delta };
  }
}
