import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  getMessages(@Query('premium') premium: string) {
    return this.chatService.getMessages(premium === 'true');
  }

  @Post()
  sendMessage(
    @Body() body: { content: string; isPremiumGroup?: boolean },
    @Request() req: any,
  ) {
    return this.chatService.sendMessage(req.user.id, body.content, body.isPremiumGroup ?? false);
  }
}
