import { Module } from '@nestjs/common';
import { StoreController } from './store.controller';
import { DbModule } from '../../db.module';

@Module({ imports:[DbModule], controllers:[StoreController] })
export class StoreModule {}
