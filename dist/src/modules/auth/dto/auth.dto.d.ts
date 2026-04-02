export declare enum Role {
    USER = "USER",
    ADMIN = "ADMIN",
    BUYER = "BUYER",
    SELLER = "SELLER"
}
export declare const COUNTRY_CURRENCY_MAP: Record<string, string>;
export declare class RegisterDto {
    email: string;
    password: string;
    role?: Role;
    phone?: string;
    country?: string;
    firstName?: string;
    lastName?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
export declare class VerifyOtpDto {
    email: string;
    otp: string;
}
