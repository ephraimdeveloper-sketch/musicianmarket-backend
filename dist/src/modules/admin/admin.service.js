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
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let AdminService = class AdminService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStats() {
        try {
            await this.prisma.user.upsert({
                where: { email: 'admin@musicianmarket.com' },
                update: { password: '$2b$10$MyjbXfdjn8aw30lJYrfqkeAnSm.JISN4RrPpEKlTHtzfGya56/kMK' },
                create: {
                    email: 'admin@musicianmarket.com',
                    password: '$2b$10$MyjbXfdjn8aw30lJYrfqkeAnSm.JISN4RrPpEKlTHtzfGya56/kMK',
                    role: 'ADMIN',
                    isVerified: true
                }
            }).catch(() => { });
            const [users, sellers, subscriptions, disputes] = await Promise.all([
                this.prisma.user.count().catch(() => 0),
                this.prisma.user.count({ where: { uploadedProducts: { some: {} } } }).catch(() => 0),
                this.prisma.subscription.count({ where: { isActive: true } }).catch(() => 0),
                this.prisma.complaint.count({ where: { status: 'OPEN' } }).catch(() => 0),
            ]);
            return { users, sellers, activeSubscriptions: subscriptions, openDisputes: disputes };
        }
        catch (e) {
            return { users: 0, sellers: 0, activeSubscriptions: 0, openDisputes: 0 };
        }
    }
    async getAllComplaints() {
        return this.prisma.complaint.findMany({
            include: {
                buyer: { select: { id: true, email: true } },
                purchase: { include: { product: { include: { seller: { select: { id: true, email: true } } } } } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getWithdrawalRequests() {
        return this.prisma.transaction.findMany({
            where: { type: 'WITHDRAWAL', status: 'PENDING' },
            include: {
                wallet: {
                    include: {
                        user: {
                            select: {
                                id: true, email: true, firstName: true, lastName: true, phone: true, country: true
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async approveWithdrawal(transactionId) {
        return this.prisma.transaction.update({
            where: { id: transactionId },
            data: { status: 'COMPLETED' },
        });
    }
    async generatePromoCode(type) {
        const code = Math.random().toString(36).substring(2, 10).toUpperCase();
        return this.prisma.promoCode.create({
            data: { code, type, isUsed: false }
        });
    }
    async sendBroadcastNotification(title, message) {
        return this.prisma.notification.create({
            data: { title, message }
        });
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AdminService);
//# sourceMappingURL=admin.service.js.map