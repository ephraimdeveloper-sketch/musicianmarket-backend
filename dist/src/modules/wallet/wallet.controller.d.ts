import { WalletService } from './wallet.service';
export declare class WalletController {
    private readonly walletService;
    constructor(walletService: WalletService);
    getMyWallet(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        balance: number;
        currency: string;
        userId: string;
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
