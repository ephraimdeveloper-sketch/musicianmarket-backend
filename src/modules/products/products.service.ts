import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { B2Service } from '../../common/services/b2.service';
import { Category } from '@prisma/client';

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
    const previewRecords = [];
    for (const preview of data.previews) {
      if (!preview.audio) continue;
      
      const pAudioName = `${Date.now()}-pa-${preview.audio.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const pAudioId = await this.b2.uploadFile(pAudioName, preview.audio.buffer, preview.audio.mimetype);
      
      let pImageId = null;
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
    return this.prisma.product.findMany({
      where: category ? { category } : {},
      include: { 
        seller: { select: { id: true, email: true } },
        previews: true
      }
    });
  }

  async findBySeller(sellerId: string) {
    return this.prisma.product.findMany({
      where: { sellerId },
      orderBy: { createdAt: 'desc' },
      include: { previews: true }
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({ 
      where: { id },
      include: { previews: true, seller: { select: { id: true, firstName: true, lastName: true } } }
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async getFileDownloadUrl(productId: string) {
    const product = await this.findOne(productId);
    return this.b2.getSignedUrl(product.fileUrl);
  }
}

