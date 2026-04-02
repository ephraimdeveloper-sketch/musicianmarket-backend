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
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
let WalletService = class WalletService {
    prisma;
    COMMISSION_RATE = 0.15;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getBalance(userId) {
        const wallet = await this.prisma.wallet.findUnique({ where: { userId } });
        if (!wallet)
            throw new common_1.BadRequestException('Wallet not found');
        return wallet;
    }
    async processSale(buyerId, productId) {
        const product = await this.prisma.product.findUnique({ where: { id: productId } });
        if (!product)
            throw new common_1.BadRequestException('Product not found');
        const totalAmount = product.price;
        const platformFee = totalAmount * this.COMMISSION_RATE;
        const sellerEarnings = totalAmount - platformFee;
        const buyerWallet = await this.getBalance(buyerId);
        if (buyerWallet.balance < totalAmount) {
            throw new common_1.BadRequestException('Insufficient funds in wallet');
        }
        return this.prisma.$transaction(async (tx) => {
            const buyerWalletInTx = await tx.wallet.findUnique({
                where: { userId: buyerId }
            });
            if (!buyerWalletInTx || buyerWalletInTx.balance < totalAmount) {
                throw new common_1.BadRequestException('Insufficient funds in wallet');
            }
            await tx.wallet.update({
                where: { userId: buyerId },
                data: { balance: { decrement: totalAmount } }
            });
            await tx.wallet.update({
                where: { userId: product.sellerId },
                data: { balance: { increment: sellerEarnings } }
            });
            const purchase = await tx.purchase.create({
                data: { buyerId, productId, price: totalAmount }
            });
            await tx.transaction.create({
                data: {
                    amount: totalAmount,
                    type: client_1.TransactionType.PURCHASE,
                    status: client_1.TransactionStatus.COMPLETED,
                    walletId: buyerWalletInTx.id,
                    purchaseId: purchase.id
                }
            });
            return { purchase, platformFee, sellerEarnings };
        });
    }
    async requestWithdrawal(userId, amount) {
        const activeComplaints = await this.prisma.complaint.count({
            where: {
                purchase: { product: { sellerId: userId } },
                status: { in: ['OPEN', 'SELLER_RESPONDED'] }
            }
        });
        if (activeComplaints > 0) {
            throw new common_1.ForbiddenException('Withdrawal blocked due to active complaints/disputes.');
        }
        const wallet = await this.getBalance(userId);
        if (wallet.balance < amount) {
            throw new common_1.BadRequestException('Insufficient funds for withdrawal');
        }
        return this.prisma.transaction.create({
            data: {
                amount,
                type: client_1.TransactionType.WITHDRAWAL,
                status: client_1.TransactionStatus.PENDING,
                walletId: wallet.id
            }
        });
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map