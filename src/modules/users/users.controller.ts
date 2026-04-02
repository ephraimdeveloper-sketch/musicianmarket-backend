import { Controller, Get, Patch, Body, UseGuards, Request, Post, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getMe(@Request() req: any) {
    return this.usersService.findById(req.user.id);
  }

  @Patch('me')
  updateProfile(
    @Request() req: any,
    @Body() body: { firstName?: string; lastName?: string; country?: string },
  ) {
    return this.usersService.updateProfile(req.user.id, body);
  }

  @Get('purchases')
  getPurchases(@Request() req: any) {
    return this.usersService.getPurchases(req.user.id);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async updateAvatar(
    @Request() req: any,
    @Body('promoCode') promoCode: string,
    @UploadedFile() file: any
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return this.usersService.updateAvatar(req.user.id, file, promoCode);
  }

  @Get('notifications')
  getNotifications(@Request() req: any) {
    return this.usersService.getNotifications(req.user.id);
  }
}
