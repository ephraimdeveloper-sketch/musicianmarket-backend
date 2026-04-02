import { PrismaService } from '../../database/prisma.service';
export declare class WalletService {
    private prisma;
    private readonly COMMISSION_RATE;
    constructor(prisma: PrismaService);
    getBalance(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        balance: number;
        currency: string;
        userId: string;
    }>;
    processSale(buyerId: string, productId: string): Promise<{
        purchase: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            price: number;
            buyerId: string;
            productId: string;
        };
        platformFee: number;
        sellerEarnings: number;
    }>;
    requestWithdrawal(userId: string, amount: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        amount: number;
        type: import("@prisma/client").$Enums.TransactionType;
        status: import("@prisma/client").$Enums.TransactionStatus;
        reference: string | null;
        walletId: string;
        purchaseId: string | null;
    }>;
}
