import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
export declare class PaymentsService {
    private configService;
    private prisma;
    constructor(configService: ConfigService, prisma: PrismaService);
    initializePayment(userId: string, amount: number, type: string, customId: string): Promise<{
        paymentLink: any;
        reference: string;
    }>;
    verifyTransaction(transactionId: string): Promise<any>;
    handleWebhook(tx: any): Promise<void>;
}
