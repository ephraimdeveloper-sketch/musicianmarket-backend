import { Controller, Post, Body, UseGuards, Request, Param, Patch } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ComplaintReason } from '@prisma/client';

@Controller('complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() body: { purchaseId: string, reason: ComplaintReason, description: string }, @Request() req: any) {
    return this.complaintsService.create(req.user.id, body);
  }

  // Admin route to resolve disputes
  @Patch(':id/resolve')
  @UseGuards(JwtAuthGuard)
  resolve(@Param('id') id: string, @Body() body: { resolution: 'REFUND' | 'RELEASE' }, @Request() req: any) {
    // In production, check if req.user.role === 'ADMIN'
    return this.complaintsService.resolve(req.user.id, id, body.resolution);
  }
}
