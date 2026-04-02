import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyOtpDto } from './dto/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(body: RegisterDto): Promise<{
        id: string;
        email: string;
        message: string;
    }>;
    verifyOtp(body: VerifyOtpDto): Promise<{
        message: string;
    }>;
    resend(email: string): Promise<{
        message: string;
    }>;
    login(body: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
}
