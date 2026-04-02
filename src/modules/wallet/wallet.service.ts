import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TransactionType, TransactionStatus } from '@prisma/client';

@Injectable()
export class WalletService {
  private readonly COMMISSION_RATE = 0.15; // 15% platform fee

  constructor(private prisma: PrismaService) {}

  async getBalance(userId: string) {
    const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
    if (!wallet) throw new BadRequestException('Wallet not found');
    return wallet;
  }

  async processSale(buyerId: string, productId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new BadRequestException('Product not found');

    const totalAmount = product.price;
    const platformFee = totalAmount * this.COMMISSION_RATE;
    const sellerEarnings = totalAmount - platformFee;

    // 1. Check buyer balance
    const buyerWallet = await this.getBalance(buyerId);
    if (buyerWallet.balance < totalAmount) {
      throw new BadRequestException('Insufficient funds in wallet');
    }

    // 2. Transact atomically
    return this.prisma.$transaction(async (tx) => {
      // Re-fetch balance inside transaction with a lock (if possible) 
      // or simply check right before deducting.
      const buyerWalletInTx = await tx.wallet.findUnique({ 
        where: { userId: buyerId } 
      });

      if (!buyerWalletInTx || buyerWalletInTx.balance < totalAmount) {
        throw new BadRequestException('Insufficient funds in wallet');
      }

      // Deduct from buyer
      await tx.wallet.update({
        where: { userId: buyerId },
        data: { balance: { decrement: totalAmount } }
      });

      // Add to seller
      await tx.wallet.update({
        where: { userId: product.sellerId },
        data: { balance: { increment: sellerEarnings } }
      });

      // Log transaction record for buyer
      const purchase = await tx.purchase.create({
        data: { buyerId, productId, price: totalAmount }
      });

      await tx.transaction.create({
        data: {
          amount: totalAmount,
          type: TransactionType.PURCHASE,
          status: TransactionStatus.COMPLETED,
          walletId: buyerWalletInTx.id,
          purchaseId: purchase.id
        }
      });

      return { purchase, platformFee, sellerEarnings };
    });
  }

  async requestWithdrawal(userId: string, amount: number) {
    // 1. Check for active complaints
    const activeComplaints = await this.prisma.complaint.count({
      where: {
        purchase: { product: { sellerId: userId } },
        status: { in: ['OPEN', 'SELLER_RESPONDED'] }
      }
    });

    if (activeComplaints > 0) {
      throw new ForbiddenException('Withdrawal blocked due to active complaints/disputes.');
    }

    // 2. Check balance
    const wallet = await this.getBalance(userId);
    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient funds for withdrawal');
    }

    // 3. Initiate withdrawal log (status: PENDING until Flutterwave/Admin approval)
    return this.prisma.transaction.create({
      data: {
        amount,
        type: TransactionType.WITHDRAWAL,
        status: TransactionStatus.PENDING,
        walletId: wallet.id
      }
    });
  }
}
