import { Controller, Get, Post, Body, Query, UseGuards, Request, UseInterceptors, UploadedFile, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get()
  getMessages(@Query('premium') premium: string) {
    return this.chatService.getMessages(premium === 'true');
  }

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  sendMessage(
    @Body() body: { content: string; isPremiumGroup?: string | boolean; replyToId?: string; promoCode?: string },
    @Request() req: any,
    @UploadedFile() file: any
  ) {
    const isPremium = typeof body.isPremiumGroup === 'string' ? body.isPremiumGroup === 'true' : !!body.isPremiumGroup;
    return this.chatService.sendMessage(req.user.id, body.content || '', isPremium, body.replyToId, file, body.promoCode);
  }

  @Post(':id/react')
  reactToMessage(
    @Param('id') id: string,
    @Body('reaction') reaction: string,
    @Request() req: any
  ) {
    return this.chatService.reactToMessage(id, reaction, req.user.id);
  }
}
