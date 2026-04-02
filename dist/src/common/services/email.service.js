"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var EmailService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const resend_1 = require("resend");
let EmailService = EmailService_1 = class EmailService {
    configService;
    resend;
    logger = new common_1.Logger(EmailService_1.name);
    constructor(configService) {
        this.configService = configService;
        this.resend = new resend_1.Resend(this.configService.get('RESEND_API_KEY'));
    }
    async sendOtp(email, otp) {
        try {
            const from = this.configService.get('EMAIL_FROM') || 'onboarding@resend.dev';
            const name = this.configService.get('EMAIL_FROM_NAME') || 'MusicianMarket';
            const { data, error } = await this.resend.emails.send({
                from: `${name} <${from}>`,
                to: email,
                subject: 'Your MusicianMarket OTP',
                html: `<div style="background: #f1f5f9; padding: 40px 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 520px; margin: auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #3b82f6, #6366f1); padding: 30px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px;">
        🎵 MusicianMarket
      </h1>
      <p style="color: #e0e7ff; margin-top: 8px; font-size: 14px;">
        Producers and Musicians Gadgets or Digital Assets
      </p>
    </div>

    <!-- Body -->
    <div style="padding: 35px;">
      <h2 style="color: #0f172a; font-size: 20px; margin-bottom: 10px;">
        Verify Your Account
      </h2>
      
      <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 25px;">
        Use the verification code below to securely access your MusicianMarket account.
      </p>

      <!-- OTP Box -->
      <div style="
        background: linear-gradient(135deg, #f8fafc, #eef2ff);
        border: 1px dashed #c7d2fe;
        border-radius: 14px;
        padding: 22px;
        text-align: center;
        margin: 30px 0;
      ">
        <span style="
          display: inline-block;
          font-size: 34px;
          font-weight: 800;
          letter-spacing: 6px;
          color: #1e293b;
        ">
          ${otp}
        </span>
      </div>

      <p style="color: #64748b; font-size: 14px; line-height: 1.5;">
        This code will expire in <strong>5 minutes</strong>. Do not share it with anyone.
      </p>

      <!-- Divider -->
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 30px 0;" />

      <!-- Footer -->
      <p style="color: #94a3b8; font-size: 12px; text-align: center; line-height: 1.5;">
        If you didn’t request this, you can safely ignore this email.<br/>
        © 2026 MusicianMarket. All rights reserved.
      </p>
    </div>
  </div>
</div>`,
            });
            if (error) {
                this.logger.error('Resend returned an error', error);
                throw new Error(error.message);
            }
            this.logger.log(`OTP sent successfully to ${email}`);
        }
        catch (error) {
            this.logger.error('Failed to send OTP email', error);
            throw error;
        }
    }
};
exports.EmailService = EmailService;
exports.EmailService = EmailService = EmailService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailService);
//# sourceMappingURL=email.service.js.map