import { Controller, Get, Post } from '@nestjs/common';
import { LiveOpsService } from './liveops.service';

@Controller('admin/liveops')
export class LiveOpsController {
  constructor(private svc: LiveOpsService) {}

  @Get('events')
  events() { return { events: this.svc.all() }; }

  @Get('active')
  active() { return { events: this.svc.active() }; }

  @Post('reload')
  reload() { this.svc.reload(); return { ok: true, count: this.svc.all().length }; }
}
