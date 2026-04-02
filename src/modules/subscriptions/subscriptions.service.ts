import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async getStatus(userId: string) {
    const sub = await this.prisma.subscription.findUnique({ where: { userId } });
    if (!sub || !sub.isActive || sub.expiresAt < new Date()) {
      return { isActive: false, plan: 'free' };
    }
    return { isActive: true, plan: sub.planId, expiresAt: sub.expiresAt };
  }

  async activate(userId: string, planId: string, durationDays: number) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + durationDays);

    return this.prisma.subscription.upsert({
      where: { userId },
      update: { isActive: true, planId, expiresAt },
      create: { userId, isActive: true, planId, expiresAt },
    });
  }

  async cancel(userId: string) {
    return this.prisma.subscription.update({
      where: { userId },
      data: { isActive: false },
    });
  }
}
