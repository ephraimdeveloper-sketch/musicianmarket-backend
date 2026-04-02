import { WalletService } from './wallet.service';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    getMyWallet(req: any): Promise<{
        id: string;
        userId: string;
        balance: number;
        currency: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    checkout(req: any, body: {
        productId: string;
    }): Promise<{
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
}
