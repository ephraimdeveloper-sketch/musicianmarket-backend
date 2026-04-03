import { ProductsService } from './products.service';
import { Category } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
export declare class ProductsController {
    private readonly productsService;
    private readonly prisma;
    constructor(productsService: ProductsService, prisma: PrismaService);
    findAll(category?: Category): Promise<{
        previews: {
            audioUrl: string | null;
            imageUrl: string | null;
            id: string;
            createdAt: Date;
            productId: string;
        }[];
        seller: {
            id: string;
            email: string;
        };
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
    findMyProducts(req: any): Promise<{
        data: {
            previews: {
                audioUrl: string | null;
                imageUrl: string | null;
                id: string;
                createdAt: Date;
                productId: string;
            }[];
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
        }[];
    }>;
    findOne(id: string): Promise<{
        previews: {
            audioUrl: string | null;
            imageUrl: string | null;
            id: string;
            createdAt: Date;
            productId: string;
        }[];
        seller: {
            id: string;
            firstName: string | null;
            lastName: string | null;
        };
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
    upload(files: Array<Express.Multer.File>, body: any, req: any): Promise<{
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
    download(id: string, req: any): Promise<string>;
    delete(id: string, req: any): Promise<{
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
}
