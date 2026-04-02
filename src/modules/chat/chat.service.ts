import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

const MESSAGE_LIMIT_FREE = 15;
const RATE_WINDOW_MS = 6 * 60 * 60 * 1000; // 6 hours

@Injectable()
export class ChatService {
  // In-memory rate store
  private rateLimitMap = new Map<string, { count: number; windowStart: number }>();

  constructor(private prisma: PrismaService) {}

  private checkRateLimit(userId: string, isPremium: boolean) {
    if (isPremium) return; // Premium users: unlimited
    const now = Date.now();
    const record = this.rateLimitMap.get(userId);
    if (!record || now - record.windowStart > RATE_WINDOW_MS) {
      this.rateLimitMap.set(userId, { count: 1, windowStart: now });
      return;
    }
    if (record.count >= MESSAGE_LIMIT_FREE) {
      throw new ForbiddenException(
        `Free users are limited to ${MESSAGE_LIMIT_FREE} messages per 6 hours. Upgrade to Premium for unlimited chat.`,
      );
    }
    record.count++;
  }

  async sendMessage(senderId: string, content: string, isPremiumGroup = false) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId: senderId },
    });
    const isPremium = !!subscription?.isActive && subscription.expiresAt > new Date();

    if (isPremiumGroup && !isPremium) {
      throw new ForbiddenException('Premium group chat requires an active Premium subscription.');
    }

    this.checkRateLimit(senderId, isPremium);

    return this.prisma.message.create({
      data: { senderId, content, isPremiumGroup },
      include: { sender: { select: { id: true, email: true } } },
    });
  }

  async getMessages(isPremiumGroup = false, limit = 50) {
    return this.prisma.message.findMany({
      where: { isPremiumGroup },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { sender: { select: { id: true, email: true } } },
    });
  }
}
