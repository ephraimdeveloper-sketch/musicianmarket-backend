import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    let retries = 5;
    while (retries > 0) {
      try {
        await this.$connect();
        break;
      } catch (err) {
        retries--;
        console.error(`Database connection failed. Retrying... (${retries} left)`);
        if (retries === 0) throw err;
        await new Promise(res => setTimeout(res, 3000));
      }
    }
  }
}
