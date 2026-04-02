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
exports.PaymentsController = void 0;
const common_1 = require("@nestjs/common");
const wallet_service_1 = require("../wallet/wallet.service");
const payments_service_1 = require("./payments.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const config_1 = require("@nestjs/config");
let PaymentsController = class PaymentsController {
    walletService;
    paymentsService;
    configService;
    constructor(walletService, paymentsService, configService) {
        this.walletService = walletService;
        this.paymentsService = paymentsService;
        this.configService = configService;
    }
    initializePayment(body, req) {
        return this.paymentsService.initializePayment(req.user.id, body.amount, body.type, body.customId);
    }
    async handleWebhook(internalSecret, body) {
        if (internalSecret !== this.configService.get('INTERNAL_WEBHOOK_SECRET')) {
            throw new common_1.UnauthorizedException('Unauthorized');
        }
        const tx = body.data;
        if (!tx || !tx.meta) {
            return { status: 'ignored' };
        }
        await this.paymentsService.handleWebhook(tx);
        return { status: 'success' };
    }
    async paymentCallback(query, res) {
        const { status, tx_ref, transaction_id } = query;
        const clientUrl = this.configService.get('CLIENT_URL') || 'http://localhost:3000';
        const cleanStatus = status === 'successful' || status === 'completed' ? 'successful' : 'cancelled';
        const redirectUrl = `${clientUrl}/payment-status?status=${cleanStatus}&tx_ref=${encodeURIComponent(tx_ref || '')}&transaction_id=${encodeURIComponent(transaction_id || '')}`;
        return res.redirect(redirectUrl);
    }
    buyProduct(productId, req) {
        return this.walletService.processSale(req.user.id, productId);
    }
    withdraw(body, req) {
        return this.walletService.requestWithdrawal(req.user.id, body.amount);
    }
    getWallet(req) {
        return this.walletService.getBalance(req.user.id);
    }
};
exports.PaymentsController = PaymentsController;
__decorate([
    (0, common_1.Post)('init'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "initializePayment", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Headers)('x-internal-secret')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)('callback'),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PaymentsController.prototype, "paymentCallback", null);
__decorate([
    (0, common_1.Post)('buy/:productId'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "buyProduct", null);
__decorate([
    (0, common_1.Post)('withdraw'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "withdraw", null);
__decorate([
    (0, common_1.Get)('wallet'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], PaymentsController.prototype, "getWallet", null);
exports.PaymentsController = PaymentsController = __decorate([
    (0, common_1.Controller)('payments'),
    __metadata("design:paramtypes", [wallet_service_1.WalletService,
        payments_service_1.PaymentsService,
        config_1.ConfigService])
], PaymentsController);
//# sourceMappingURL=payments.controller.js.map