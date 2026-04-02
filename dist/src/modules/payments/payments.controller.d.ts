import { WalletService } from '../wallet/wallet.service';
export declare class PaymentsController {
    private readonly walletService;
    constructor(walletService: WalletService);
    buyProduct(productId: string, req: any): Promise<{
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
    withdraw(body: {
        amount: number;
    }, req: any): Promise<{
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
    getWallet(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        balance: number;
        currency: string;
        userId: string;
    }>;
}
