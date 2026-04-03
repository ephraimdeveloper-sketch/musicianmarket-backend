import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { B2Service } from '../../common/services/b2.service';
import { Category, Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService, private b2: B2Service) {}

  private validateCategoryFileFormat(category: Category, mimetype: string, filename: string) {
    const isZip = mimetype.includes('zip') || mimetype.includes('rar') || mimetype.includes('7z') || mimetype.includes('compressed') || filename.endsWith('.rar') || filename.endsWith('.zip');
    const isAudio = mimetype.includes('audio') || filename.endsWith('.mp3') || filename.endsWith('.wav');

    switch (category) {
      case 'STEMS':
      case 'VST':
      case 'INSTRUMENT':
        if (!isZip) throw new BadRequestException(`${category} only supports compressed zip/rar formats.`);
        break;
      case 'LOOPS':
      case 'DRONEPAD':
        if (!isZip && !isAudio) throw new BadRequestException(`${category} supports audio or zip formats only.`);
        break;
      default:
        throw new BadRequestException('Unknown category');
    }
  }

  async create(data: { title: string, price: number, category: Category, sellerId: string, mainFile: any, previews: { audio: any, image: any }[] }) {
    if (!data.mainFile) throw new BadRequestException('Main product file is required');

    // Validate main file constraints
    this.validateCategoryFileFormat(data.category, data.mainFile.mimetype, data.mainFile.originalname);

    if (data.previews.length > 10) {
      throw new BadRequestException('Maximum of 10 previews allowed.');
    }

    // 1. Upload Main File to B2
    const mainFileName = `${Date.now()}-main-${data.mainFile.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const mainFileId = await this.b2.uploadFile(mainFileName, data.mainFile.buffer, data.mainFile.mimetype);

    // 2. Upload Previews
    const previewRecords: any[] = [];
    for (const preview of data.previews) {
      if (!preview.audio && !preview.image) continue;
      
      let pAudioId: string | null = null;
      if (preview.audio) {
        const pAudioName = `${Date.now()}-pa-${preview.audio.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        pAudioId = await this.b2.uploadFile(pAudioName, preview.audio.buffer, preview.audio.mimetype);
      }
      
      let pImageId: string | null = null;
      if (preview.image) {
        const pImageName = `${Date.now()}-pi-${preview.image.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        pImageId = await this.b2.uploadFile(pImageName, preview.image.buffer, preview.image.mimetype);
      }

      previewRecords.push({
        audioUrl: pAudioId,
        imageUrl: pImageId
      });
    }

    // 3. Save to Postgres
    return this.prisma.product.create({
      data: {
        title: data.title,
        price: data.price,
        category: data.category,
        sellerId: data.sellerId,
        fileUrl: mainFileId,
        previews: {
          create: previewRecords
        }
      },
      include: {
        previews: true
      }
    });
  }

  async findAll(category?: Category) {
    const products = await this.prisma.product.findMany({
      where: category ? { category } : {},
      include: { 
        seller: { select: { id: true, email: true } },
        previews: true
      }
    });

    return Promise.all(products.map(async p => {
      const signedPreviews = await Promise.all(p.previews.map(async prev => ({
        ...prev,
        audioUrl: prev.audioUrl ? await this.b2.getSignedUrl(prev.audioUrl) : null,
        imageUrl: prev.imageUrl ? await this.b2.getSignedUrl(prev.imageUrl) : null
      })));
      return { ...p, previews: signedPreviews };
    }));
  }

  async findBySeller(sellerId: string) {
    const products = await this.prisma.product.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
      include: { previews: true }
    });

    return Promise.all(products.map(async p => {
      const signedPreviews = await Promise.all(p.previews.map(async prev => ({
        ...prev,
        audioUrl: prev.audioUrl ? await this.b2.getSignedUrl(prev.audioUrl) : null,
        imageUrl: prev.imageUrl ? await this.b2.getSignedUrl(prev.imageUrl) : null
      })));
      return { ...p, previews: signedPreviews };
    }));
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ 
      where: { id },
      include: { previews: true, seller: { select: { id: true, firstName: true, lastName: true } } }
    });
    if (!product) throw new NotFoundException('Product not found');
    
    const signedPreviews = await Promise.all(product.previews.map(async prev => ({
      ...prev,
      audioUrl: prev.audioUrl ? await this.b2.getSignedUrl(prev.audioUrl) : null,
      imageUrl: prev.imageUrl ? await this.b2.getSignedUrl(prev.imageUrl) : null
    })));

    const signedLegacyPreview = product.previewUrl ? await this.b2.getSignedUrl(product.previewUrl) : null;

    return { ...product, previews: signedPreviews, previewUrl: signedLegacyPreview };
  }

  async getFileDownloadUrl(productId: string) {
    const product = await this.findOne(productId);
    return this.b2.getSignedUrl(product.fileUrl);
  }

  async delete(id: string, sellerId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { previews: true }
    });

    if (!product) throw new NotFoundException('Product not found');
    if (product.sellerId !== sellerId) throw new ForbiddenException('You can only delete your own products');

    // 1. Delete associated files from B2
    try {
      await this.b2.deleteFile(product.fileUrl);
      for (const preview of product.previews) {
        if (preview.audioUrl) await this.b2.deleteFile(preview.audioUrl);
        if (preview.imageUrl) await this.b2.deleteFile(preview.imageUrl);
      }
    } catch (e) {
      // Log error but continue with DB deletion
      console.error('B2 cleanup failed during product deletion', e);
    }

    // 2. Delete from DB
    return this.prisma.product.delete({ where: { id } });
  }
}

