import { PrismaService } from '../../database/prisma.service';
export declare class RatingsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(buyerId: string, data: {
        productId: string;
        score: number;
        comment?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buyerId: string;
        productId: string;
        sellerId: string;
        score: number;
        comment: string | null;
    }>;
    getProductRatings(productId: string): Promise<{
        ratings: ({
            buyer: {
                id: string;
                email: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            buyerId: string;
            productId: string;
            sellerId: string;
            score: number;
            comment: string | null;
        })[];
        average: number;
        total: number;
    }>;
}
