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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../database/prisma.service");
let PaymentsService = class PaymentsService {
    configService;
    prisma;
    constructor(configService, prisma) {
        this.configService = configService;
        this.prisma = prisma;
    }
    async initializePayment(userId, amount, type, customId) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
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
            throw new common_1.BadRequestException('Failed to initialize payment');
        }
        return { paymentLink: data.data.link, reference: txRef };
    }
    async verifyTransaction(transactionId) {
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
    async handleWebhook(tx) {
        const { type, customId, userId, source } = tx.meta || {};
        if (source !== 'musicianmarket')
            return;
        const verifiedTx = await this.verifyTransaction(tx.id);
        if (!verifiedTx) {
            console.warn('[MusicianMarket WEBHOOK] Verification failed for TX ID:', tx.id);
            return;
        }
        console.log('[MusicianMarket WEBHOOK] Successfully verified transaction:', verifiedTx.id);
        if (type === 'deposit') {
            const wallet = await this.prisma.wallet.upsert({
                where: { userId },
                create: { userId, balance: verifiedTx.amount },
                update: { balance: { increment: verifiedTx.amount } }
            });
            await this.prisma.transaction.create({
                data: { amount: verifiedTx.amount, type: 'DEPOSIT', status: 'COMPLETED', reference: verifiedTx.id.toString(), walletId: wallet.id }
            });
        }
        else if (type === 'order') {
            const product = await this.prisma.product.findUnique({ where: { id: customId } });
            if (product) {
                const purchase = await this.prisma.purchase.create({
                    data: { buyerId: userId, productId: product.id, price: verifiedTx.amount }
                });
                const fee = verifiedTx.amount * 0.15;
                const earnings = verifiedTx.amount - fee;
                const sellerWallet = await this.prisma.wallet.upsert({
                    where: { userId: product.sellerId },
                    create: { userId: product.sellerId, balance: earnings },
                    update: { balance: { increment: earnings } }
                });
                await this.prisma.transaction.create({
                    data: { amount: earnings, type: 'SALE_EARNING', status: 'COMPLETED', reference: verifiedTx.id.toString(), walletId: sellerWallet.id, purchaseId: purchase.id }
                });
            }
        }
        else if (type === 'subscription') {
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 30);
            await this.prisma.subscription.upsert({
                where: { userId },
                create: { userId, isActive: true, planId: customId, expiresAt },
                update: { isActive: true, planId: customId, expiresAt }
            });
        }
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map