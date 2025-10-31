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

@Controller('jobs')
export class JobsController {
  constructor(private db: DbService) {}

  @Get()
  async list() {
    const { rows } = await this.db.query('SELECT * FROM jobs ORDER BY id');
    return { jobs: rows };
  }

  @Post(':id/run')
  async run(@Param('id') id: string, @Headers('authorization') auth?: string) {
    const userId = uid(auth);
    if (!userId) return { error: 'unauthorized' };
    const job = (await this.db.query('SELECT * FROM jobs WHERE id=$1',[id])).rows[0];
    if (!job) return { error: 'no-such-job' };
    const sres = await this.db.query('SELECT energy FROM stats WHERE user_id=$1',[userId]);
    const energy = sres.rows[0]?.energy ?? 0;
    if (energy < job.energy_cost) return { error: 'not-enough-energy' };
    await this.db.query('UPDATE stats SET energy=energy-$1 WHERE user_id=$2',[job.energy_cost,userId]);
    await this.db.query('UPDATE profiles SET xp=xp+$1, cash=cash+$2 WHERE user_id=$3',[job.reward_xp, job.reward_cash, userId]);
    const rewards = { xp: job.reward_xp, cash: job.reward_cash };
    await this.db.query('INSERT INTO job_runs (user_id, job_id, result, rewards) VALUES ($1,$2,$3,$4)',[userId, job.id, 'success', rewards]);
    return { ok: true, rewards };
  }
}
