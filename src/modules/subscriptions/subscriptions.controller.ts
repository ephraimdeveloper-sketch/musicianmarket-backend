import { Controller, Get, Post, Delete, Body, UseGuards, Request } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('status')
  getStatus(@Request() req: any) {
    return this.subscriptionsService.getStatus(req.user.id);
  }

  @Post('activate')
  activate(@Request() req: any, @Body() body: { planId: string; durationDays: number }) {
    return this.subscriptionsService.activate(req.user.id, body.planId, body.durationDays);
  }

  @Delete('cancel')
  cancel(@Request() req: any) {
    return this.subscriptionsService.cancel(req.user.id);
  }
}
