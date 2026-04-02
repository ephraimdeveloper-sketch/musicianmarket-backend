import { PrismaService } from '../../database/prisma.service';
import { B2Service } from '../../common/services/b2.service';
import { Category } from '@prisma/client';
export declare class ProductsService {
    private prisma;
    private b2;
    constructor(prisma: PrismaService, b2: B2Service);
    private validateCategoryFileFormat;
    create(data: {
        title: string;
        price: number;
        category: Category;
        sellerId: string;
        mainFile: any;
        previews: {
            audio: any;
            image: any;
        }[];
    }): Promise<{
        previews: {
            id: string;
            createdAt: Date;
            productId: string;
            audioUrl: string;
            imageUrl: string | null;
        }[];
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
    }>;
    findAll(category?: Category): Promise<({
        seller: {
            id: string;
            email: string;
        };
        previews: {
            id: string;
            createdAt: Date;
            productId: string;
            audioUrl: string;
            imageUrl: string | null;
        }[];
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
    findBySeller(sellerId: string): Promise<({
        previews: {
            id: string;
            createdAt: Date;
            productId: string;
            audioUrl: string;
            imageUrl: string | null;
        }[];
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
    findOne(id: string): Promise<{
        seller: {
            id: string;
            firstName: string | null;
            lastName: string | null;
        };
        previews: {
            id: string;
            createdAt: Date;
            productId: string;
            audioUrl: string;
            imageUrl: string | null;
        }[];
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
    }>;
    getFileDownloadUrl(productId: string): Promise<string>;
}
