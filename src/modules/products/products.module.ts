import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { B2Service } from '../../common/services/b2.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [ProductsController],
  providers: [ProductsService, B2Service],
  exports: [ProductsService],
})
export class ProductsModule {}
