import { Module } from '@nestjs/common';
import { PvPController } from './pvp.controller';
import { DbModule } from '../../db.module';

@Module({ imports:[DbModule], controllers:[PvPController] })
export class PvPModule {}
