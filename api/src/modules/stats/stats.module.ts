import { Module } from '@nestjs/common';
import { StatsController } from './stats.controller';
import { DbModule } from '../../db.module';

@Module({ imports:[DbModule], controllers:[StatsController] })
export class StatsModule {}
