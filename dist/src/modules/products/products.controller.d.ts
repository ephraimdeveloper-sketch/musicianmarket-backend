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
        title: string;
        description: string | null;
        price: number;
        category: import("@prisma/client").$Enums.Category;
        previewUrl: string | null;
        fileUrl: string;
        sellerId: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findMyProducts(req: any): Promise<{
        id: string;
        title: string;
        description: string | null;
        price: number;
        category: import("@prisma/client").$Enums.Category;
        previewUrl: string | null;
        fileUrl: string;
        sellerId: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        title: string;
        description: string | null;
        price: number;
        category: import("@prisma/client").$Enums.Category;
        previewUrl: string | null;
        fileUrl: string;
        sellerId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    upload(file: any, body: any, req: any): Promise<{
        id: string;
        title: string;
        description: string | null;
        price: number;
        category: import("@prisma/client").$Enums.Category;
        previewUrl: string | null;
        fileUrl: string;
        sellerId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    download(id: string, req: any): Promise<string>;
}
