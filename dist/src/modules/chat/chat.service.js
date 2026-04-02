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
const b2_service_1 = require("../../common/services/b2.service");
const MESSAGE_LIMIT_FREE = 15;
const RATE_WINDOW_MS = 6 * 60 * 60 * 1000;
let ChatService = class ChatService {
    prisma;
    b2;
    rateLimitMap = new Map();
    constructor(prisma, b2) {
        this.prisma = prisma;
        this.b2 = b2;
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
    async sendMessage(senderId, content, isPremiumGroup = false, replyToId, file, promoCode) {
        const subscription = await this.prisma.subscription.findUnique({
            where: { userId: senderId },
        });
        const isPremium = !!subscription?.isActive && subscription.expiresAt > new Date();
        if (isPremiumGroup && !isPremium) {
            throw new common_1.ForbiddenException('Premium group chat requires an active Premium subscription.');
        }
        this.checkRateLimit(senderId, isPremium);
        let fileUrl = null;
        if (file) {
            if (!isPremium) {
                if (promoCode) {
                    const promo = await this.prisma.promoCode.findUnique({ where: { code: promoCode } });
                    if (!promo || promo.isUsed || promo.type !== 'PREMIUM_CHAT_IMAGE') {
                        throw new common_1.ForbiddenException('Invalid, used, or incorrect promo code type.');
                    }
                    await this.prisma.promoCode.update({ where: { id: promo.id }, data: { isUsed: true } });
                }
                else {
                    throw new common_1.ForbiddenException('Image uploads in chat are restricted to Premium users. Subscribe or enter a promo code.');
                }
            }
            const fileName = `${Date.now()}-chat-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            fileUrl = await this.b2.uploadFile(fileName, file.buffer, file.mimetype);
        }
        return this.prisma.message.create({
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
    }
    async reactToMessage(messageId, reaction, userId) {
        const msg = await this.prisma.message.findUnique({ where: { id: messageId } });
        if (!msg)
            throw new common_1.NotFoundException('Message not found');
        let reactionsObj = {};
        if (msg.reactions) {
            try {
                reactionsObj = JSON.parse(msg.reactions);
            }
            catch (e) { }
        }
        if (!reactionsObj[reaction]) {
            reactionsObj[reaction] = [];
        }
        const idx = reactionsObj[reaction].indexOf(userId);
        if (idx > -1) {
            reactionsObj[reaction].splice(idx, 1);
        }
        else {
            reactionsObj[reaction].push(userId);
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
        const populatedMsgs = await Promise.all(msgs.map(async (m) => {
            let resolvedFileUrl = null;
            if (m.fileUrl) {
                try {
                    resolvedFileUrl = await this.b2.getSignedUrl(m.fileUrl);
                }
                catch (e) { }
            }
            return { ...m, fileUrlSigned: resolvedFileUrl };
        }));
        return populatedMsgs;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, b2_service_1.B2Service])
], ChatService);
//# sourceMappingURL=chat.service.js.map