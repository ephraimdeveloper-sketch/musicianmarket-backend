import { Controller, Get, Patch, Param, UseGuards, Post, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return { data: await this.adminService.getStats() };
  }

  @Get('complaints')
  async getComplaints() {
    return { data: await this.adminService.getAllComplaints() };
  }

  @Get('withdrawals')
  async getWithdrawals() {
    return { data: await this.adminService.getWithdrawalRequests() };
  }

  @Patch('withdrawals/:id/approve')
  async approveWithdrawal(@Param('id') id: string) {
    return { data: await this.adminService.approveWithdrawal(id) };
  }

  @Post('promo-codes')
  async createPromoCode(@Body('type') type: 'PROFILE_UPDATE' | 'PREMIUM_CHAT_IMAGE') {
    return { data: await this.adminService.generatePromoCode(type) };
  }

  @Post('notifications')
  async sendNotification(@Body() body: { title: string; message: string }) {
    return { data: await this.adminService.sendBroadcastNotification(body.title, body.message) };
  }
}
