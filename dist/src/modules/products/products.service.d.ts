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
        title: string;
        description: string | null;
        price: number;
        category: import("@prisma/client").$Enums.Category;
        previewUrl: string | null;
        fileUrl: string;
        createdAt: Date;
        updatedAt: Date;
        sellerId: string;
    }>;
    findAll(category?: Category): Promise<({
        seller: {
            id: string;
            email: string;
        };
    } & {
        id: string;
        title: string;
        description: string | null;
        price: number;
        category: import("@prisma/client").$Enums.Category;
        previewUrl: string | null;
        fileUrl: string;
        createdAt: Date;
        updatedAt: Date;
        sellerId: string;
    })[]>;
    findBySeller(sellerId: string): Promise<{
        id: string;
        title: string;
        description: string | null;
        price: number;
        category: import("@prisma/client").$Enums.Category;
        previewUrl: string | null;
        fileUrl: string;
        createdAt: Date;
        updatedAt: Date;
        sellerId: string;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        title: string;
        description: string | null;
        price: number;
        category: import("@prisma/client").$Enums.Category;
        previewUrl: string | null;
        fileUrl: string;
        createdAt: Date;
        updatedAt: Date;
        sellerId: string;
    }>;
    getFileDownloadUrl(productId: string): Promise<string>;
}
