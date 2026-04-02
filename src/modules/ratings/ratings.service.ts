import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async create(buyerId: string, data: { productId: string; score: number; comment?: string }) {
    if (data.score < 1 || data.score > 5) {
      throw new BadRequestException('Score must be between 1 and 5');
    }

    // Only allow rating after verified purchase
    const purchase = await this.prisma.purchase.findFirst({
      where: { buyerId, productId: data.productId },
      include: { product: true },
    });

    if (!purchase) {
      throw new BadRequestException('You must purchase this product before rating it');
    }

    return this.prisma.rating.create({
      data: {
        score: data.score,
        comment: data.comment,
        productId: data.productId,
        buyerId,
        sellerId: purchase.product.sellerId,
      },
    });
  }

  async getProductRatings(productId: string) {
    const ratings = await this.prisma.rating.findMany({
      where: { productId },
      include: { buyer: { select: { id: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const average = ratings.length
      ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
      : 0;

    return { ratings, average: Math.round(average * 10) / 10, total: ratings.length };
  }
}
