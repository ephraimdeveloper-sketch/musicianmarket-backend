import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @Body() body: { productId: string; score: number; comment?: string },
    @Request() req: any,
  ) {
    return this.ratingsService.create(req.user.id, body);
  }

  @Get('product/:id')
  getProductRatings(@Param('id') id: string) {
    return this.ratingsService.getProductRatings(id);
  }
}
