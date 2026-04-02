import { ComplaintsService } from './complaints.service';
import { ComplaintReason } from '@prisma/client';
export declare class ComplaintsController {
    private readonly complaintsService;
    constructor(complaintsService: ComplaintsService);
    create(body: {
        purchaseId: string;
        reason: ComplaintReason;
        description: string;
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ComplaintStatus;
        purchaseId: string;
        buyerId: string;
        description: string;
        reason: import("@prisma/client").$Enums.ComplaintReason;
    }>;
    resolve(id: string, body: {
        resolution: 'REFUND' | 'RELEASE';
    }, req: any): Promise<{
        message: string;
    }>;
}
