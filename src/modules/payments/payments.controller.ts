import { Controller, Post, Body, UseGuards, Request, Get, Param, Res, Headers, UnauthorizedException, Query } from '@nestjs/common';
import { WalletService } from '../wallet/wallet.service';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly walletService: WalletService,
    private readonly paymentsService: PaymentsService,
    private readonly configService: ConfigService
  ) {}

  @Post('init')
  @UseGuards(JwtAuthGuard)
  initializePayment(@Body() body: { amount: number, type: string, customId: string }, @Request() req: any) {
    return this.paymentsService.initializePayment(req.user.id, body.amount, body.type, body.customId);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('x-internal-secret') internalSecret: string,
    @Body() body: any
  ) {
    if (internalSecret !== this.configService.get('INTERNAL_WEBHOOK_SECRET')) {
      throw new UnauthorizedException('Unauthorized');
    }

    const tx = body.data;
    if (!tx || !tx.meta) {
      return { status: 'ignored' };
    }

    await this.paymentsService.handleWebhook(tx);
    return { status: 'success' };
  }

  @Get('callback')
  async paymentCallback(@Query() query: any, @Res() res: any) {
    const { status, tx_ref, transaction_id } = query;
    const clientUrl = this.configService.get('CLIENT_URL') || 'http://localhost:3000';
    
    const cleanStatus = status === 'successful' || status === 'completed' ? 'successful' : 'cancelled';
    const redirectUrl = `${clientUrl}/payment-status?status=${cleanStatus}&tx_ref=${encodeURIComponent(tx_ref || '')}&transaction_id=${encodeURIComponent(transaction_id || '')}`;
    
    return res.redirect(redirectUrl);
  }

  @Post('buy/:productId')
  @UseGuards(JwtAuthGuard)
  buyProduct(@Param('productId') productId: string, @Request() req: any) {
    return this.walletService.processSale(req.user.id, productId);
  }

  @Post('withdraw')
  @UseGuards(JwtAuthGuard)
  withdraw(@Body() body: { amount: number }, @Request() req: any) {
    return this.walletService.requestWithdrawal(req.user.id, body.amount);
  }

  @Get('wallet')
  @UseGuards(JwtAuthGuard)
  getWallet(@Request() req: any) {
    return this.walletService.getBalance(req.user.id);
  }
}
