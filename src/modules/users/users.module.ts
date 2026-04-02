import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { B2Service } from '../../common/services/b2.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, B2Service]
})
export class UsersModule {}
