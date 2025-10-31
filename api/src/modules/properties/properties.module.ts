import { Module } from '@nestjs/common';
import { PropertiesController } from './properties.controller';
import { DbModule } from '../../db.module';

@Module({ imports:[DbModule], controllers:[PropertiesController] })
export class PropertiesModule {}
