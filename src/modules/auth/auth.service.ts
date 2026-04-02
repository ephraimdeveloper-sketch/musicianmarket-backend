import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { EmailService } from '../../common/services/email.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto, COUNTRY_CURRENCY_MAP } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(data: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new BadRequestException('Email already in use');

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Derive wallet currency from country, default USD
    const countryCode = (data.country || 'US').toUpperCase();
    const currency = COUNTRY_CURRENCY_MAP[countryCode] || 'USD';

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: (data.role || 'USER') as any,
        country: data.country || null,
        firstName: data.firstName || null,
        lastName: data.lastName || null,
        phone: data.phone || null,
        otp: otp,
        wallet: { create: { balance: 0, currency } }
      } as any,
    });

    this.logger.log(`=============================`);
    this.logger.log(`OTP FOR ${user.email}: ${otp}`);
    this.logger.log(`=============================`);

    await this.emailService.sendOtp(user.email, otp).catch(e => this.logger.error('Resend failed', e));
    return { id: user.id, email: user.email, message: 'OTP sent. Check your email or system terminal.' };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await (this.prisma.user as any).findUnique({ where: { email } });
    if (!user || user.otp !== otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }
    
    await this.prisma.user.update({
      where: { email },
      data: { isVerified: true },
    });
    return { message: 'Email verified successfully' };
  }

  async resendOtp(email: string) {
    const user = await (this.prisma.user as any).findUnique({ where: { email } });
    if (!user) throw new BadRequestException('User not found');
    
    // Regenerate
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await (this.prisma.user as any).update({
      where: { email },
      data: { otp }
    });

    this.logger.log(`=============================`);
    this.logger.log(`RESENT OTP FOR ${email}: ${otp}`);
    this.logger.log(`=============================`);

    await this.emailService.sendOtp(email, otp).catch(e => this.logger.error('Resend failed', e));
    return { message: 'OTP resent successfully.' };
  }

  async login(data: LoginDto) {
    const user = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email via OTP first');
    }

    const payload = { sub: user.id, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload),
      user: { id: user.id, email: user.email, role: user.role }
    };
  }
}
