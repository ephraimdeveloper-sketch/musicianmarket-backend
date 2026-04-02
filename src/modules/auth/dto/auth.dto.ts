import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
  BUYER = 'BUYER',
  SELLER = 'SELLER'
}

/** Maps country codes to their local currency */
export const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  NG: 'NGN', US: 'USD', GB: 'GBP', GH: 'GHS', KE: 'KES',
  ZA: 'ZAR', UG: 'UGX', TZ: 'TZS', EG: 'EGP', ET: 'ETB',
  CM: 'XAF', SN: 'XOF', CI: 'XOF', RW: 'RWF', ZM: 'ZMW',
  DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', NL: 'EUR',
  CA: 'CAD', AU: 'AUD', IN: 'INR', BR: 'BRL', MX: 'MXN',
  JP: 'JPY', CN: 'CNY', SG: 'SGD', AE: 'AED',
};

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;
}

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class VerifyOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
