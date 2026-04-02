import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { B2Service } from '../../common/services/b2.service';
import { Category } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService, private b2: B2Service) {}

  async create(data: { title: string, price: number, category: Category, sellerId: string, file: any }) {
    // 1. Upload to B2
    const fileName = `${Date.now()}-${data.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const fileId = await this.b2.uploadFile(fileName, data.file.buffer, data.file.mimetype);

    // 2. Save to Postgres
    return this.prisma.product.create({
      data: {
        title: data.title,
        price: data.price,
        category: data.category,
        sellerId: data.sellerId,
        fileUrl: fileId, // Store fileId for signed URL generation
      }
    });
  }

  async findAll(category?: Category) {
    return this.prisma.product.findMany({
      where: category ? { category } : {},
      include: { seller: { select: { id: true, email: true } } }
    });
  }

  async findBySeller(sellerId: string) {
    return this.prisma.product.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async getFileDownloadUrl(productId: string) {
    const product = await this.findOne(productId);
    // Return temporary 24h signed URL
    return this.b2.getSignedUrl(product.fileUrl);
  }
}
