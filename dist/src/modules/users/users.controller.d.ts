import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getMe(req: any): Promise<{
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        role: import("@prisma/client").$Enums.Role;
        isVerified: boolean;
        country: string | null;
        avatar: string | null;
        createdAt: Date;
        wallet: {
            id: string;
            balance: number;
            currency: string;
        } | null;
        subscription: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            isActive: boolean;
            expiresAt: Date;
            planId: string | null;
        } | null;
        _count: {
            uploadedProducts: number;
            purchases: number;
        };
    }>;
    updateProfile(req: any, body: {
        firstName?: string;
        lastName?: string;
        country?: string;
    }): Promise<{
        id: string;
        email: string;
        password: string;
        firstName: string | null;
        lastName: string | null;
        role: import("@prisma/client").$Enums.Role;
        isVerified: boolean;
        country: string | null;
        avatar: string | null;
        phone: string | null;
        otp: string | null;
        avatarUpdates: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getPurchases(req: any): Promise<({
        product: {
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
    })[]>;
    updateAvatar(req: any, promoCode: string, file: any): Promise<{
        message: string;
        avatarUrl: string;
    }>;
    getNotifications(req: any): Promise<{
        id: string;
        createdAt: Date;
        message: string;
        title: string;
        targetUserId: string | null;
    }[]>;
}
