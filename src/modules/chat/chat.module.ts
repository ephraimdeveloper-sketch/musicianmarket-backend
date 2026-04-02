import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { B2Service } from '../../common/services/b2.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, B2Service]
})
export class ChatModule {}
