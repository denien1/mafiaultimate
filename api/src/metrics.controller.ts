import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { metricsHandler } from './metrics';

@Controller()
export class MetricsController {
  @Get('/metrics')
  metrics(@Res() res: Response) {
    return metricsHandler(res);
  }
}
