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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const b2_service_1 = require("../../common/services/b2.service");
let ProductsService = class ProductsService {
    prisma;
    b2;
    constructor(prisma, b2) {
        this.prisma = prisma;
        this.b2 = b2;
    }
    async create(data) {
        const fileName = `${Date.now()}-${data.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const fileId = await this.b2.uploadFile(fileName, data.file.buffer, data.file.mimetype);
        return this.prisma.product.create({
            data: {
                title: data.title,
                price: data.price,
                category: data.category,
                sellerId: data.sellerId,
                fileUrl: fileId,
            }
        });
    }
    async findAll(category) {
        return this.prisma.product.findMany({
            where: category ? { category } : {},
            include: { seller: { select: { id: true, email: true } } }
        });
    }
    async findBySeller(sellerId) {
        return this.prisma.product.findMany({
            where: { sellerId },
            orderBy: { createdAt: 'desc' }
        });
    }
    async findOne(id) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        return product;
    }
    async getFileDownloadUrl(productId) {
        const product = await this.findOne(productId);
        return this.b2.getSignedUrl(product.fileUrl);
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, b2_service_1.B2Service])
], ProductsService);
//# sourceMappingURL=products.service.js.map