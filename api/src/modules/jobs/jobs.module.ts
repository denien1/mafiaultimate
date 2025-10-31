import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { DbModule } from '../../db.module';

@Module({ imports:[DbModule], controllers:[JobsController] })
export class JobsModule {}
