import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

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
}
