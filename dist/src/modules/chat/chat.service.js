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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const MESSAGE_LIMIT_FREE = 15;
const RATE_WINDOW_MS = 6 * 60 * 60 * 1000;
let ChatService = class ChatService {
    prisma;
    rateLimitMap = new Map();
    constructor(prisma) {
        this.prisma = prisma;
    }
    checkRateLimit(userId, isPremium) {
        if (isPremium)
            return;
        const now = Date.now();
        const record = this.rateLimitMap.get(userId);
        if (!record || now - record.windowStart > RATE_WINDOW_MS) {
            this.rateLimitMap.set(userId, { count: 1, windowStart: now });
            return;
        }
        if (record.count >= MESSAGE_LIMIT_FREE) {
            throw new common_1.ForbiddenException(`Free users are limited to ${MESSAGE_LIMIT_FREE} messages per 6 hours. Upgrade to Premium for unlimited chat.`);
        }
        record.count++;
    }
    async sendMessage(senderId, content, isPremiumGroup = false) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId: senderId },
        });
        const isPremium = !!subscription?.isActive && subscription.expiresAt > new Date();
        if (isPremiumGroup && !isPremium) {
            throw new common_1.ForbiddenException('Premium group chat requires an active Premium subscription.');
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
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map