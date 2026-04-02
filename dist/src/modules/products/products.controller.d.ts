import { ProductsService } from './products.service';
import { Category } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
export declare class ProductsController {
    private readonly productsService;
    private readonly prisma;
    constructor(productsService: ProductsService, prisma: PrismaService);
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
    findMyProducts(req: any): Promise<{
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
    upload(file: any, body: any, req: any): Promise<{
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
    download(id: string, req: any): Promise<string>;
}
