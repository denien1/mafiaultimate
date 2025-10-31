import { Injectable, NestMiddleware } from '@nestjs/common';
import { createClient } from 'redis';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
  private ready = false;
  constructor() {
    this.client.on('error', (e) => console.warn('Redis error', e));
    this.client.connect().then(()=> this.ready = true).catch(()=>{});
  }
  async use(req: Request, res: Response, next: NextFunction) {
    if (!this.ready) return next();
    const key = `rl:${req.ip}:${req.path}`;
    const limit = Number(process.env.RATE_LIMIT || 60); // requests
    const windowSec = Number(process.env.RATE_LIMIT_WINDOW || 60);
    const n = await this.client.incr(key);
    if (n === 1) await this.client.expire(key, windowSec);
    if (n > limit) {
      res.status(429).json({ error: 'rate-limited' });
    } else next();
  }
}
