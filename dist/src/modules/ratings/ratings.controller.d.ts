import { RatingsService } from './ratings.service';
export declare class RatingsController {
    private readonly ratingsService;
    constructor(ratingsService: RatingsService);
    create(body: {
        productId: string;
        score: number;
        comment?: string;
    }, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        buyerId: string;
        productId: string;
        sellerId: string;
        score: number;
        comment: string | null;
    }>;
    getProductRatings(id: string): Promise<{
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
