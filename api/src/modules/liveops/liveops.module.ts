import { Module } from '@nestjs/common';
import { LiveOpsService } from './liveops.service';
import { LiveOpsController } from './liveops.controller';

@Module({
  providers: [LiveOpsService],
  controllers: [LiveOpsController],
  exports: [LiveOpsService]
})
export class LiveOpsModule {}
