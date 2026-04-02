import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
    getStats(): Promise<{
        data: {
            users: number;
            sellers: number;
            activeSubscriptions: number;
            openDisputes: number;
        };
    }>;
    getComplaints(): Promise<{
        data: ({
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
            buyerId: string;
            description: string;
            status: import("@prisma/client").$Enums.ComplaintStatus;
            purchaseId: string;
            reason: import("@prisma/client").$Enums.ComplaintReason;
        })[];
    }>;
    getWithdrawals(): Promise<{
        data: ({
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
            amount: number;
            type: import("@prisma/client").$Enums.TransactionType;
            status: import("@prisma/client").$Enums.TransactionStatus;
            reference: string | null;
            walletId: string;
            purchaseId: string | null;
        })[];
    }>;
    approveWithdrawal(id: string): Promise<{
        data: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            amount: number;
            type: import("@prisma/client").$Enums.TransactionType;
            status: import("@prisma/client").$Enums.TransactionStatus;
            reference: string | null;
            walletId: string;
            purchaseId: string | null;
        };
    }>;
}
