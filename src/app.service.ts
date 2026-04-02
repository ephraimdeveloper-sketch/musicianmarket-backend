import { Injectable } from '@nestjs/common';
import { PrismaService } from './database/prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}
  getHello(): string {
    return 'MusicianMarket Backend - Production Ready!';
  }

  async setupAdmin() {
    await (this.prisma.user as any).upsert({
      where: { email: 'admin@musicianmarket.com' },
      update: { password: '$2b$10$MyjbXfdjn8aw30lJYrfqkeAnSm.JISN4RrPpEKlTHtzfGya56/kMK' },
      create: {
        email: 'admin@musicianmarket.com',
        password: '$2b$10$MyjbXfdjn8aw30lJYrfqkeAnSm.JISN4RrPpEKlTHtzfGya56/kMK',
        role: 'ADMIN',
        isVerified: true
      }
    });
    return { 
       message: 'Admin credentials established perfectly. Use: admin@musicianmarket.com / SecureAdminPassword2026!',
    };
  }
}
