import { Controller, Get, Post, Body, Param, Query, UseInterceptors, UploadedFile, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Category } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@Controller('products')
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly prisma: PrismaService
  ) {}

  @Get()
  findAll(@Query('category') category?: Category) {
    return this.productsService.findAll(category);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  findMyProducts(@Req() req: any) {
    return this.productsService.findBySeller(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: any, @Body() body: any, @Req() req: any) {
    return this.productsService.create({
       ...body,
       price: parseFloat(body.price),
       file,
       sellerId: req.user.id
    });
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  async download(@Param('id') id: string, @Req() req: any) {
    const userId = req.user.id;
    const product = await this.productsService.findOne(id);
    
    // Check if seller
    if (product.sellerId === userId) {
      return this.productsService.getFileDownloadUrl(id);
    }

    // Check if purchased
    const purchase = await this.prisma.purchase.findFirst({
      where: { productId: id, buyerId: userId }
    });

    if (!purchase) {
      throw new ForbiddenException('Purchase required to access this production asset');
    }

    return this.productsService.getFileDownloadUrl(id);
  }
}
