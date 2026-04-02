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
exports.RatingsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let RatingsService = class RatingsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(buyerId, data) {
        if (data.score < 1 || data.score > 5) {
            throw new common_1.BadRequestException('Score must be between 1 and 5');
        }
        const purchase = await this.prisma.purchase.findFirst({
            where: { buyerId, productId: data.productId },
            include: { product: true },
        });
        if (!purchase) {
            throw new common_1.BadRequestException('You must purchase this product before rating it');
        }
        return this.prisma.rating.create({
            data: {
                score: data.score,
                comment: data.comment,
                productId: data.productId,
                buyerId,
                sellerId: purchase.product.sellerId,
            },
        });
    }
    async getProductRatings(productId) {
        const ratings = await this.prisma.rating.findMany({
            where: { productId },
            include: { buyer: { select: { id: true, email: true } } },
            orderBy: { createdAt: 'desc' },
        });
        const average = ratings.length
            ? ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length
            : 0;
        return { ratings, average: Math.round(average * 10) / 10, total: ratings.length };
    }
};
exports.RatingsService = RatingsService;
exports.RatingsService = RatingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RatingsService);
//# sourceMappingURL=ratings.service.js.map