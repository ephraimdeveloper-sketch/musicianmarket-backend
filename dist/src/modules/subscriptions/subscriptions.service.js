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
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let SubscriptionsService = class SubscriptionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getStatus(userId) {
        const sub = await this.prisma.subscription.findUnique({ where: { userId } });
        if (!sub || !sub.isActive || sub.expiresAt < new Date()) {
            return { isActive: false, plan: 'free' };
        }
        return { isActive: true, plan: sub.planId, expiresAt: sub.expiresAt };
    }
    async activate(userId, planId, durationDays) {
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + durationDays);
        return this.prisma.subscription.upsert({
            where: { userId },
            update: { isActive: true, planId, expiresAt },
            create: { userId, isActive: true, planId, expiresAt },
        });
    }
    async cancel(userId) {
        return this.prisma.subscription.update({
            where: { userId },
            data: { isActive: false },
        });
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map