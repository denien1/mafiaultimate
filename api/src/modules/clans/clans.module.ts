import { Module } from '@nestjs/common';
import { ClansController } from './clans.controller';
import { DbModule } from '../../db.module';

@Module({ imports:[DbModule], controllers:[ClansController] })
export class ClansModule {}
