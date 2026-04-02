import { PrismaService } from '../../database/prisma.service';
import { B2Service } from '../../common/services/b2.service';
import { Category } from '@prisma/client';
export declare class ProductsService {
    private prisma;
    private b2;
    constructor(prisma: PrismaService, b2: B2Service);
    create(data: {
        title: string;
        price: number;
        category: Category;
        sellerId: string;
        file: any;
    }): Promise<{
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
    }>;
    findAll(category?: Category): Promise<({
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
    })[]>;
    findBySeller(sellerId: string): Promise<{
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
    }[]>;
    findOne(id: string): Promise<{
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
    }>;
    getFileDownloadUrl(productId: string): Promise<string>;
}
