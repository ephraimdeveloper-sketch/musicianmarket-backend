import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isVerified: true,
        country: true,
        avatar: true,
        createdAt: true,
        subscription: true,
        wallet: { select: { id: true, balance: true, currency: true } },
        _count: { select: { uploadedProducts: true, purchases: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(id: string, data: { firstName?: string; lastName?: string; country?: string }) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async getPurchases(userId: string) {
    return this.prisma.purchase.findMany({
      where: { buyerId: userId },
      include: { product: true }
    });
  }
}
