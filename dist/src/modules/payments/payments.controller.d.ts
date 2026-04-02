import { WalletService } from '../wallet/wallet.service';
import { PaymentsService } from './payments.service';
import { ConfigService } from '@nestjs/config';
export declare class PaymentsController {
    private readonly walletService;
    private readonly paymentsService;
    private readonly configService;
    constructor(walletService: WalletService, paymentsService: PaymentsService, configService: ConfigService);
    initializePayment(body: {
        amount: number;
        type: string;
        customId: string;
    }, req: any): Promise<{
        paymentLink: any;
        reference: string;
    }>;
    handleWebhook(internalSecret: string, body: any): Promise<{
        status: string;
    }>;
    paymentCallback(query: any, res: any): Promise<any>;
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
        type: import("@prisma/client").$Enums.TransactionType;
        amount: number;
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
