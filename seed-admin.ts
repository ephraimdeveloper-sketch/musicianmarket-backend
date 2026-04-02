import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('SecureAdminPassword2026!', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@musicianmarket.com' },
    update: { role: 'ADMIN', password: hashedPassword },
    create: {
      email: 'admin@musicianmarket.com',
      password: hashedPassword,
      role: 'ADMIN',
      otp: '000000',
      isVerified: true
    },
  });

  console.log('Admin account established:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
