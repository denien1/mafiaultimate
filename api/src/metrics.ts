import client from 'prom-client';
import { Response } from 'express';

export const register = new client.Registry();
client.collectDefaultMetrics({ register });

export function metricsHandler(res: Response) {
  res.set('Content-Type', register.contentType);
  register.metrics().then(m => res.send(m));
}
