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
    validateCategoryFileFormat(category, mimetype, filename) {
        const isZip = mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('7z') || mimetype.includes('compressed') || filename.endsWith('.rar') || filename.endsWith('.zip');
        const isAudio = mimetype.includes('audio') || filename.endsWith('.mp3') || filename.endsWith('.wav');
        switch (category) {
            case 'STEMS':
            case 'VST':
            case 'INSTRUMENT':
                if (!isZip)
                    throw new common_1.BadRequestException(`${category} only supports compressed zip/rar formats.`);
                break;
            case 'LOOPS':
            case 'DRONEPAD':
                if (!isZip && !isAudio)
                    throw new common_1.BadRequestException(`${category} supports audio or zip formats only.`);
                break;
            default:
                throw new common_1.BadRequestException('Unknown category');
        }
    }
    async create(data) {
        if (!data.mainFile)
            throw new common_1.BadRequestException('Main product file is required');
        this.validateCategoryFileFormat(data.category, data.mainFile.mimetype, data.mainFile.originalname);
        if (data.previews.length > 10) {
            throw new common_1.BadRequestException('Maximum of 10 previews allowed.');
        }
        const mainFileName = `${Date.now()}-main-${data.mainFile.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        const mainFileId = await this.b2.uploadFile(mainFileName, data.mainFile.buffer, data.mainFile.mimetype);
        const previewRecords = [];
        for (const preview of data.previews) {
            if (!preview.audio)
                continue;
            const pAudioName = `${Date.now()}-pa-${preview.audio.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const pAudioId = await this.b2.uploadFile(pAudioName, preview.audio.buffer, preview.audio.mimetype);
            let pImageId = null;
            if (preview.image) {
                const pImageName = `${Date.now()}-pi-${preview.image.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
                pImageId = await this.b2.uploadFile(pImageName, preview.image.buffer, preview.image.mimetype);
            }
            previewRecords.push({
                audioUrl: pAudioId,
                imageUrl: pImageId
            });
        }
        return this.prisma.product.create({
            data: {
                title: data.title,
                price: data.price,
                category: data.category,
                sellerId: data.sellerId,
                fileUrl: mainFileId,
                previews: {
                    create: previewRecords
                }
            },
            include: {
                previews: true
            }
        });
    }
    async findAll(category) {
        const products = await this.prisma.product.findMany({
            where: category ? { category } : {},
            include: {
                seller: { select: { id: true, email: true } },
                previews: true
            }
        });
        return Promise.all(products.map(async (p) => {
            const signedPreviews = await Promise.all(p.previews.map(async (prev) => ({
                ...prev,
                audioUrl: prev.audioUrl ? await this.b2.getSignedUrl(prev.audioUrl) : null,
                imageUrl: prev.imageUrl ? await this.b2.getSignedUrl(prev.imageUrl) : null
            })));
            return { ...p, previews: signedPreviews };
        }));
    }
    async findBySeller(sellerId) {
        const products = await this.prisma.product.findMany({
            where: { sellerId },
            orderBy: { createdAt: 'desc' },
            include: { previews: true }
        });
        return Promise.all(products.map(async (p) => {
            const signedPreviews = await Promise.all(p.previews.map(async (prev) => ({
                ...prev,
                audioUrl: prev.audioUrl ? await this.b2.getSignedUrl(prev.audioUrl) : null,
                imageUrl: prev.imageUrl ? await this.b2.getSignedUrl(prev.imageUrl) : null
            })));
            return { ...p, previews: signedPreviews };
        }));
    }
    async findOne(id) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { previews: true, seller: { select: { id: true, firstName: true, lastName: true } } }
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        const signedPreviews = await Promise.all(product.previews.map(async (prev) => ({
            ...prev,
            audioUrl: prev.audioUrl ? await this.b2.getSignedUrl(prev.audioUrl) : null,
            imageUrl: prev.imageUrl ? await this.b2.getSignedUrl(prev.imageUrl) : null
        })));
        return { ...product, previews: signedPreviews };
    }
    async getFileDownloadUrl(productId) {
        const product = await this.findOne(productId);
        return this.b2.getSignedUrl(product.fileUrl);
    }
    async delete(id, sellerId) {
        const product = await this.prisma.product.findUnique({
            where: { id },
            include: { previews: true }
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if (product.sellerId !== sellerId)
            throw new common_1.ForbiddenException('You can only delete your own products');
        try {
            await this.b2.deleteFile(product.fileUrl);
            for (const preview of product.previews) {
                if (preview.audioUrl)
                    await this.b2.deleteFile(preview.audioUrl);
                if (preview.imageUrl)
                    await this.b2.deleteFile(preview.imageUrl);
            }
        }
        catch (e) {
            console.error('B2 cleanup failed during product deletion', e);
        }
        return this.prisma.product.delete({ where: { id } });
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService, b2_service_1.B2Service])
], ProductsService);
//# sourceMappingURL=products.service.js.map