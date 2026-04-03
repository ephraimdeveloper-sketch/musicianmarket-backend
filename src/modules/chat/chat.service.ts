import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { B2Service } from '../../common/services/b2.service';

const MESSAGE_LIMIT_FREE = 15;
const RATE_WINDOW_MS = 6 * 60 * 60 * 1000; // 6 hours

@Injectable()
export class ChatService {
  private rateLimitMap = new Map<string, { count: number; windowStart: number }>();

  constructor(private prisma: PrismaService, private b2: B2Service) {}

  private checkRateLimit(userId: string, isPremium: boolean) {
    if (isPremium) return;
    const now = Date.now();
    const record = this.rateLimitMap.get(userId);
    if (!record || now - record.windowStart > RATE_WINDOW_MS) {
      this.rateLimitMap.set(userId, { count: 1, windowStart: now });
      return;
    }
    if (record.count >= MESSAGE_LIMIT_FREE) {
      throw new ForbiddenException(`Free users are limited to ${MESSAGE_LIMIT_FREE} messages per 6 hours. Upgrade to Premium for unlimited chat.`);
    }
    record.count++;
  }

  async sendMessage(senderId: string, content: string, isPremiumGroup = false, replyToId?: string, file?: any, promoCode?: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { userId: senderId },
    });
    const isPremium = !!subscription?.isActive && subscription.expiresAt > new Date();

    if (isPremiumGroup && !isPremium) {
      throw new ForbiddenException('Premium group chat requires an active Premium subscription.');
    }

    this.checkRateLimit(senderId, isPremium);

    let fileUrl = null;
    if (file) {
      if (!isPremium) {
         if (promoCode) {
            const promo = await this.prisma.promoCode.findUnique({ where: { code: promoCode } });
            if (!promo || promo.isUsed || promo.type !== 'PREMIUM_CHAT_IMAGE') {
               throw new ForbiddenException('Invalid, used, or incorrect promo code type.');
            }
            await this.prisma.promoCode.update({ where: { id: promo.id }, data: { isUsed: true } });
         } else {
            throw new ForbiddenException('Image uploads in chat are restricted to Premium users. Subscribe or enter a promo code.');
         }
      }

      const fileName = `${Date.now()}-chat-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      fileUrl = await this.b2.uploadFile(fileName, file.buffer, file.mimetype);
    }

    const msg = await this.prisma.message.create({
      data: { 
        senderId, 
        content, 
        isPremiumGroup, 
        replyToId: replyToId || null, 
        fileUrl 
      },
      include: { 
        sender: { select: { id: true, firstName: true, avatar: true } },
        replyTo: { select: { id: true, content: true, sender: { select: { firstName: true } } } }
      },
    });

    const sender = { ...msg.sender };
    if (sender.avatar) {
       try { sender.avatar = await this.b2.getSignedUrl(sender.avatar); } catch(e) {}
    }

    let fileUrlSigned = null;
    if (msg.fileUrl) {
       try { fileUrlSigned = await this.b2.getSignedUrl(msg.fileUrl); } catch(e) {}
    }

    return { ...msg, sender, fileUrlSigned };
  }

  async reactToMessage(messageId: string, reaction: string, userId: string) {
    const msg = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!msg) throw new NotFoundException('Message not found');

    let reactionsObj: any = {};
    if (msg.reactions) {
      try { reactionsObj = JSON.parse(msg.reactions); } catch (e) {}
    }

    if (!reactionsObj[reaction]) {
      reactionsObj[reaction] = [];
    }
    // Toggle reaction
    const idx = reactionsObj[reaction].indexOf(userId);
    if (idx > -1) {
      reactionsObj[reaction].splice(idx, 1); // remove
    } else {
      reactionsObj[reaction].push(userId); // add
    }

    return this.prisma.message.update({
      where: { id: messageId },
      data: { reactions: JSON.stringify(reactionsObj) }
    });
  }

  async getMessages(isPremiumGroup = false, limit = 50) {
    const msgs = await this.prisma.message.findMany({
      where: { isPremiumGroup },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { 
        sender: { select: { id: true, firstName: true, avatar: true } },
        replyTo: { select: { id: true, content: true, sender: { select: { firstName: true } } } }
      },
    });

    const populatedMsgs = await Promise.all(msgs.map(async m => {
      let resolvedFileUrl = null;
      if (m.fileUrl) {
         try { resolvedFileUrl = await this.b2.getSignedUrl(m.fileUrl); } catch(e) {}
      }
      
      const sender = { ...m.sender };
      if (sender.avatar) {
         try { sender.avatar = await this.b2.getSignedUrl(sender.avatar); } catch(e) {}
      }

      return { ...m, sender, fileUrlSigned: resolvedFileUrl };
    }));

    return populatedMsgs;
  }
}

