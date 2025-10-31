import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { sdk } from './telemetry';

async function bootstrap() {
  try { await sdk.start(); } catch (e) { console.warn('OTel start failed', e); }
  const app = await NestFactory.create(AppModule, { cors: true });
  // Raw body for Stripe webhook
  app.use('/stripe/webhook', (req: any, _res, next) => { let data=''; req.setEncoding('utf8'); req.on('data', (c)=> data+=c); req.on('end', ()=>{ req.rawBody=data; next();});});
  const port = process.env.PORT || 4000;
  app.use(pinoHttp({ logger } as any));
  await app.listen(port as number);
  console.log(`[API] Listening on ${port}`);
}
bootstrap();


import * as Sentry from '@sentry/node';
import pino from 'pino';
import pinoHttp from 'pino-http';

if (process.env.SENTRY_DSN) {
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: Number(process.env.SENTRY_TRACES) || 0.1 });
}

const logger = pino({ level: process.env.LOG_LEVEL || 'info' } as any);
// Attach logger
