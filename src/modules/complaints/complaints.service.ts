import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ComplaintReason, ComplaintStatus, TransactionStatus } from '@prisma/client';

@Injectable()
export class ComplaintsService {
  constructor(private prisma: PrismaService) {}

  async create(buyerId: string, data: { purchaseId: string, reason: ComplaintReason, description: string }) {
    // 1. Verify purchase belongs to buyer
    const purchase = await this.prisma.purchase.findFirst({
       where: { id: data.purchaseId, buyerId },
       include: { product: true }
    });

    if (!purchase) throw new NotFoundException('Purchase not found');

    // 2. Transact: Create complaint and lock transaction
    return this.prisma.$transaction(async (tx) => {
      const complaint = await tx.complaint.create({
        data: {
          purchaseId: data.purchaseId,
          buyerId,
          reason: data.reason,
          description: data.description,
          status: ComplaintStatus.OPEN
        }
      });

      // Transaction is flagged as DISPUTED to block clearing/withdrawal
      await tx.transaction.updateMany({
        where: { purchaseId: data.purchaseId },
        data: { status: TransactionStatus.DISPUTED }
      });

      return complaint;
    });
  }

  async resolve(adminId: string, complaintId: string, resolution: 'REFUND' | 'RELEASE') {
    const complaint = await this.prisma.complaint.findUnique({
      where: { id: complaintId },
      include: { purchase: { include: { product: true } } }
    });

    if (!complaint) throw new NotFoundException('Complaint not found');

    return this.prisma.$transaction(async (tx) => {
      if (resolution === 'REFUND') {
        const totalAmount = complaint.purchase.price;
        // Refund Buyer Wallet
        await tx.wallet.update({
          where: { userId: complaint.buyerId },
          data: { balance: { increment: totalAmount } }
        });

        // Deduct from Seller Wallet (the 85% they received - simplifying here to full price for brevity)
        const sellerEarnings = totalAmount * 0.85;
        await tx.wallet.update({
          where: { userId: complaint.purchase.product.sellerId },
          data: { balance: { decrement: sellerEarnings } }
        });

        await tx.complaint.update({
          where: { id: complaintId },
          data: { status: ComplaintStatus.RESOLVED_REFUNDED }
        });

        await tx.transaction.updateMany({
          where: { purchaseId: complaint.purchaseId },
          data: { status: TransactionStatus.REFUNDED }
        });

      } else {
        // Release funds to seller
        await tx.complaint.update({
          where: { id: complaintId },
          data: { status: ComplaintStatus.RESOLVED_FUNDS_RELEASED }
        });

        await tx.transaction.updateMany({
          where: { purchaseId: complaint.purchaseId },
          data: { status: TransactionStatus.COMPLETED }
        });
      }

      return { message: `Complaint resolved with: ${resolution}` };
    });
  }
}
