"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const b2_service_1 = require("../../common/services/b2.service");
let UsersService = class UsersService {
    prisma;
    b2;
    constructor(prisma, b2) {
        this.prisma = prisma;
        this.b2 = b2;
    }
    async findById(id) {
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
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async updateProfile(id, data) {
        return this.prisma.user.update({ where: { id }, data });
    }
    async updateAvatar(id, file, promoCode) {
        const user = await this.prisma.user.findUnique({ where: { id }, include: { wallet: true } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        let isFree = user.avatarUpdates === 0;
        if (!isFree && promoCode) {
            const promo = await this.prisma.promoCode.findUnique({ where: { code: promoCode } });
            if (!promo || promo.isUsed || promo.type !== 'PROFILE_UPDATE') {
                throw new common_1.BadRequestException('Invalid or used promo code.');
            }
            await this.prisma.promoCode.update({ where: { id: promo.id }, data: { isUsed: true } });
            isFree = true;
        }
        if (!isFree) {
            const price = user.country === 'NG' ? 200 : (user.country === 'GH' ? 5 : (user.country === 'GB' ? 1 : (user.country === 'KE' ? 150 : (user.country === 'ZA' ? 20 : 1))));
            if (!user.wallet || user.wallet.balance < price) {
                throw new common_1.BadRequestException(`Insufficient funds to update profile avatar. Please top up your wallet with ${price} ${user.wallet?.currency || 'USD'} or use a Promo Code.`);
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
        let resolvedUrl = fileUrl;
        try {
            resolvedUrl = await this.b2.getSignedUrl(fileUrl);
        }
        catch (e) { }
        await this.prisma.user.update({
            where: { id },
            data: { avatar: fileUrl, avatarUpdates: { increment: 1 } },
        });
        return { message: 'Avatar updated successfully', avatarUrl: resolvedUrl };
    }
    async getPurchases(userId) {
        return this.prisma.purchase.findMany({
            where: { buyerId: userId },
            include: { product: true }
        });
    }
    async getNotifications(userId) {
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
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, b2_service_1.B2Service])
], UsersService);
//# sourceMappingURL=users.service.js.map