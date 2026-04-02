import { PrismaService } from '../../database/prisma.service';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findById(id: string): Promise<{
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
    updateProfile(id: string, data: {
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    getPurchases(userId: string): Promise<({
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
}
