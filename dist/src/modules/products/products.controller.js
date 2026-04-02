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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductsController = void 0;
const common_1 = require("@nestjs/common");
const products_service_1 = require("./products.service");
const platform_express_1 = require("@nestjs/platform-express");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../database/prisma.service");
let ProductsController = class ProductsController {
    productsService;
    prisma;
    constructor(productsService, prisma) {
        this.productsService = productsService;
        this.prisma = prisma;
    }
    findAll(category) {
        return this.productsService.findAll(category);
    }
    findMyProducts(req) {
        return this.productsService.findBySeller(req.user.id);
    }
    findOne(id) {
        return this.productsService.findOne(id);
    }
    upload(files, body, req) {
        const mainFile = files.find(f => f.fieldname === 'file');
        const previews = [];
        for (let i = 0; i < 10; i++) {
            const audio = files.find(f => f.fieldname === `previewAudio_${i}`);
            const image = files.find(f => f.fieldname === `previewImage_${i}`);
            if (audio) {
                previews.push({ audio, image });
            }
        }
        return this.productsService.create({
            ...body,
            price: parseFloat(body.price),
            mainFile,
            previews,
            sellerId: req.user.id
        });
    }
    async download(id, req) {
        const userId = req.user.id;
        const product = await this.productsService.findOne(id);
        if (product.sellerId === userId) {
            return this.productsService.getFileDownloadUrl(id);
        }
        const purchase = await this.prisma.purchase.findFirst({
            where: { productId: id, buyerId: userId }
        });
        if (!purchase) {
            throw new common_1.ForbiddenException('Purchase required to access this production asset');
        }
        return this.productsService.getFileDownloadUrl(id);
    }
};
exports.ProductsController = ProductsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('category')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('me'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findMyProducts", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.AnyFilesInterceptor)()),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array, Object, Object]),
    __metadata("design:returntype", void 0)
], ProductsController.prototype, "upload", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProductsController.prototype, "download", null);
exports.ProductsController = ProductsController = __decorate([
    (0, common_1.Controller)('products'),
    __metadata("design:paramtypes", [products_service_1.ProductsService,
        prisma_service_1.PrismaService])
], ProductsController);
//# sourceMappingURL=products.controller.js.map