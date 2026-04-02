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
exports.ComplaintsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
let ComplaintsService = class ComplaintsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(buyerId, data) {
        const purchase = await this.prisma.purchase.findFirst({
            where: { id: data.purchaseId, buyerId },
            include: { product: true }
        });
        if (!purchase)
            throw new common_1.NotFoundException('Purchase not found');
        return this.prisma.$transaction(async (tx) => {
            const complaint = await tx.complaint.create({
                data: {
                    purchaseId: data.purchaseId,
                    buyerId,
                    reason: data.reason,
                    description: data.description,
                    status: client_1.ComplaintStatus.OPEN
                }
            });
            await tx.transaction.updateMany({
                where: { purchaseId: data.purchaseId },
                data: { status: client_1.TransactionStatus.DISPUTED }
            });
            return complaint;
        });
    }
    async resolve(adminId, complaintId, resolution) {
        const complaint = await this.prisma.complaint.findUnique({
            where: { id: complaintId },
            include: { purchase: { include: { product: true } } }
        });
        if (!complaint)
            throw new common_1.NotFoundException('Complaint not found');
        return this.prisma.$transaction(async (tx) => {
            if (resolution === 'REFUND') {
                const totalAmount = complaint.purchase.price;
                await tx.wallet.update({
                    where: { userId: complaint.buyerId },
                    data: { balance: { increment: totalAmount } }
                });
                const sellerEarnings = totalAmount * 0.85;
                await tx.wallet.update({
                    where: { userId: complaint.purchase.product.sellerId },
                    data: { balance: { decrement: sellerEarnings } }
                });
                await tx.complaint.update({
                    where: { id: complaintId },
                    data: { status: client_1.ComplaintStatus.RESOLVED_REFUNDED }
                });
                await tx.transaction.updateMany({
                    where: { purchaseId: complaint.purchaseId },
                    data: { status: client_1.TransactionStatus.REFUNDED }
                });
            }
            else {
                await tx.complaint.update({
                    where: { id: complaintId },
                    data: { status: client_1.ComplaintStatus.RESOLVED_FUNDS_RELEASED }
                });
                await tx.transaction.updateMany({
                    where: { purchaseId: complaint.purchaseId },
                    data: { status: client_1.TransactionStatus.COMPLETED }
                });
            }
            return { message: `Complaint resolved with: ${resolution}` };
        });
    }
};
exports.ComplaintsService = ComplaintsService;
exports.ComplaintsService = ComplaintsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ComplaintsService);
//# sourceMappingURL=complaints.service.js.map