"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const jwt_1 = require("@nestjs/jwt");
const email_service_1 = require("../../common/services/email.service");
const bcrypt = __importStar(require("bcrypt"));
const auth_dto_1 = require("./dto/auth.dto");
let AuthService = AuthService_1 = class AuthService {
    prisma;
    jwtService;
    emailService;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(prisma, jwtService, emailService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }
    async register(data) {
        const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (existing)
            throw new common_1.BadRequestException('Email already in use');
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const countryCode = (data.country || 'US').toUpperCase();
        const currency = auth_dto_1.COUNTRY_CURRENCY_MAP[countryCode] || 'USD';
        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                role: (data.role || 'USER'),
                country: data.country || null,
                firstName: data.firstName || null,
                lastName: data.lastName || null,
                phone: data.phone || null,
                otp: otp,
                wallet: { create: { balance: 0, currency } }
            },
        });
        this.logger.log(`=============================`);
        this.logger.log(`OTP FOR ${user.email}: ${otp}`);
        this.logger.log(`=============================`);
        await this.emailService.sendOtp(user.email, otp).catch(e => this.logger.error('Resend failed', e));
        return { id: user.id, email: user.email, message: 'OTP sent. Check your email or system terminal.' };
    }
    async verifyOtp(email, otp) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user || user.otp !== otp) {
            throw new common_1.BadRequestException('Invalid or expired OTP');
        }
        await this.prisma.user.update({
            where: { email },
            data: { isVerified: true },
        });
        return { message: 'Email verified successfully' };
    }
    async resendOtp(email) {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user)
            throw new common_1.BadRequestException('User not found');
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        await this.prisma.user.update({
            where: { email },
            data: { otp }
        });
        this.logger.log(`=============================`);
        this.logger.log(`RESENT OTP FOR ${email}: ${otp}`);
        this.logger.log(`=============================`);
        await this.emailService.sendOtp(email, otp).catch(e => this.logger.error('Resend failed', e));
        return { message: 'OTP resent successfully.' };
    }
    async login(data) {
        const user = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (!user || !(await bcrypt.compare(data.password, user.password))) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        if (!user.isVerified) {
            throw new common_1.UnauthorizedException('Please verify your email via OTP first');
        }
        const payload = { sub: user.id, role: user.role };
        return {
            accessToken: this.jwtService.sign(payload),
            user: { id: user.id, email: user.email, role: user.role }
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map