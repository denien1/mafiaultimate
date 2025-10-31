import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { DbModule } from '../../db.module';

@Module({ imports: [DbModule], controllers: [UsersController] })
export class UsersModule {}
