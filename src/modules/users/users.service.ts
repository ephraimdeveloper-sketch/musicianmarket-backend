import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { B2Service } from '../../common/services/b2.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, private b2: B2Service) {}

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
        avatarUpdates: true,
        createdAt: true,
        subscription: { select: { isActive: true, expiresAt: true, planId: true } },
        wallet: { select: { id: true, balance: true, currency: true } },
        _count: { select: { uploadedProducts: true, purchases: true } },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    
    // Sign avatar URL if it exists
    if (user.avatar) {
      user.avatar = await this.b2.getSignedUrl(user.avatar);
    }
    
    return user;
  }

  async updateProfile(id: string, data: { firstName?: string; lastName?: string; country?: string }) {
    return this.prisma.user.update({ where: { id }, data });
  }

  async updateAvatar(id: string, file: any, promoCode?: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, include: { wallet: true } });
    if (!user) throw new NotFoundException('User not found');
    
    let isFree = user.avatarUpdates === 0;

    if (!isFree && promoCode) {
       const promo = await this.prisma.promoCode.findUnique({ where: { code: promoCode } });
       if (!promo || promo.isUsed || promo.type !== 'PROFILE_UPDATE') {
          throw new BadRequestException('Invalid or used promo code.');
       }
       await this.prisma.promoCode.update({ where: { id: promo.id }, data: { isUsed: true } });
       isFree = true; 
    }

    if (!isFree) {
       const price = user.country === 'NG' ? 200 : (user.country === 'GH' ? 5 : (user.country === 'GB' ? 1 : (user.country === 'KE' ? 150 : (user.country === 'ZA' ? 20 : 1)))); 
       
       if (!user.wallet || user.wallet.balance < price) {
          throw new BadRequestException(`Insufficient funds to update profile avatar. Please top up your wallet with ${price} ${user.wallet?.currency || 'USD'} or use a Promo Code.`);
       }
       
       await this.prisma.wallet.update({
          where: { id: user.wallet.id },
          data: { balance: { decrement: price } }
       });
       
       await this.prisma.transaction.create({
          data: {
             walletId: user.wallet.id,
             amount: price,
             type: 'PROFILE_UPDATE',
             status: 'COMPLETED',
          }
       });
    }

    const fileName = `avatar-${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const fileUrl = await this.b2.uploadFile(fileName, file.buffer, file.mimetype);

    const resolvedUrl = await this.b2.getSignedUrl(fileUrl);

    await this.prisma.user.update({
       where: { id },
       data: { avatar: fileUrl, avatarUpdates: { increment: 1 } },
    });

    return { message: 'Avatar updated successfully', avatarUrl: resolvedUrl };
  }

  async getPurchases(userId: string) {
    const purchases = await this.prisma.purchase.findMany({
      where: { buyerId: userId },
      include: { 
        product: {
           include: { previews: true }
        }
      }
    });

    return Promise.all(purchases.map(async pur => {
       const product = pur.product;
       const signedPreviews = await Promise.all(product.previews.map(async prev => ({
          ...prev,
          audioUrl: prev.audioUrl ? await this.b2.getSignedUrl(prev.audioUrl) : null,
          imageUrl: prev.imageUrl ? await this.b2.getSignedUrl(prev.imageUrl) : null
       })));
       return { ...pur, product: { ...product, previews: signedPreviews } };
    }));
  }

  async getNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: {
         OR: [
            { targetUserId: null },
            { targetUserId: userId }
         ]
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}
