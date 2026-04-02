import { Controller, Get, Post, Body, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getMyWallet(@Request() req: any) {
    return this.walletService.getBalance(req.user.id);
  }

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  async checkout(@Request() req: any, @Body() body: { productId: string }) {
    if (!body.productId) throw new BadRequestException('Product ID is required');
    return this.walletService.processSale(req.user.id, body.productId);
  }
}
