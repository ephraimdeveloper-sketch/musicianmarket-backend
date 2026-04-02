import { PrismaService } from '../../database/prisma.service';
import { ComplaintReason } from '@prisma/client';
export declare class ComplaintsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(buyerId: string, data: {
        purchaseId: string;
        reason: ComplaintReason;
        description: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buyerId: string;
        description: string;
        status: import("@prisma/client").$Enums.ComplaintStatus;
        purchaseId: string;
        reason: import("@prisma/client").$Enums.ComplaintReason;
    }>;
    resolve(adminId: string, complaintId: string, resolution: 'REFUND' | 'RELEASE'): Promise<{
        message: string;
    }>;
}
