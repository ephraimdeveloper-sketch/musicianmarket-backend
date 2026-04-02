import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async initializePayment(userId: string, amount: number, type: string, customId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    const FLW_BASE = 'https://api.flutterwave.com/v3';
    const txRef = `MM-${type.toUpperCase()}-${customId}-${Date.now()}`;
    const callbackUrl = `${this.configService.get('API_URL') || 'http://localhost:3001/api'}/payments/callback`;

    const payload = {
      tx_ref: txRef,
      amount: Number(amount),
      currency: 'NGN',
      redirect_url: callbackUrl,
      customer: {
        email: user.email,
        name: user.firstName || 'MusicianMarket User'
      },
      meta: {
        source: 'musicianmarket',
        type,
        customId,
        userId: user.id
      }
    };

    const response = await fetch(`${FLW_BASE}/payments`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.configService.get('FLUTTERWAVE_SECRET_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      console.error('Flutterwave init error:', data);
      throw new BadRequestException('Failed to initialize payment');
    }

    return { paymentLink: data.data.link, reference: txRef };
  }

  async verifyTransaction(transactionId: string) {
    const FLW_BASE = 'https://api.flutterwave.com/v3';
    const response = await fetch(`${FLW_BASE}/transactions/${transactionId}/verify`, {
      headers: {
        Authorization: `Bearer ${this.configService.get('FLUTTERWAVE_SECRET_KEY')}`
      }
    });

    const data = await response.json();
    if (!response.ok || data.status !== 'success' || data.data.status !== 'successful') {
      return null;
    }
    return data.data;
  }

  async handleWebhook(tx: any) {
    const { type, customId, userId, source } = tx.meta || {};
    
    if (source !== 'musicianmarket') return;

    // Optional verification via Flutterwave as requested
    const verifiedTx = await this.verifyTransaction(tx.id);
    if (!verifiedTx) {
      console.warn('[MusicianMarket WEBHOOK] Verification failed for TX ID:', tx.id);
      return;
    }

    console.log('[MusicianMarket WEBHOOK] Successfully verified transaction:', verifiedTx.id);
    
    // Process based on tx.meta.type
    if (type === 'deposit') {
      // Handle deposit
    } else if (type === 'order') {
      // Handle order
    } else if (type === 'booking') {
      // Handle booking
    }
  }
}
