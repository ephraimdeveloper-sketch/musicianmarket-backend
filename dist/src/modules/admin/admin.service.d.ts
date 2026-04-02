import { PrismaService } from '../../database/prisma.service';
export declare class AdminService {
    private prisma;
    constructor(prisma: PrismaService);
    getStats(): Promise<{
        users: number;
        sellers: number;
        activeSubscriptions: number;
        openDisputes: number;
    }>;
    getAllComplaints(): Promise<({
        purchase: {
            product: {
                seller: {
                    id: string;
                    email: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                price: number;
                title: string;
                description: string | null;
                category: import("@prisma/client").$Enums.Category;
                previewUrl: string | null;
                fileUrl: string;
                sellerId: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            price: number;
            buyerId: string;
            productId: string;
        };
        buyer: {
            id: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.ComplaintStatus;
        purchaseId: string;
        buyerId: string;
        description: string;
        reason: import("@prisma/client").$Enums.ComplaintReason;
    })[]>;
    getWithdrawalRequests(): Promise<({
        wallet: {
            user: {
                id: string;
                email: string;
                firstName: string | null;
                lastName: string | null;
                country: string | null;
                phone: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            balance: number;
            currency: string;
            userId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.TransactionType;
        amount: number;
        status: import("@prisma/client").$Enums.TransactionStatus;
        reference: string | null;
        walletId: string;
        purchaseId: string | null;
    })[]>;
    approveWithdrawal(transactionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import("@prisma/client").$Enums.TransactionType;
        amount: number;
        status: import("@prisma/client").$Enums.TransactionStatus;
        reference: string | null;
        walletId: string;
        purchaseId: string | null;
    }>;
    generatePromoCode(type: 'PROFILE_UPDATE' | 'PREMIUM_CHAT_IMAGE'): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        code: string;
        type: import("@prisma/client").$Enums.PromoType;
        isUsed: boolean;
    }>;
    sendBroadcastNotification(title: string, message: string): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        title: string;
        targetUserId: string | null;
    }>;
}
