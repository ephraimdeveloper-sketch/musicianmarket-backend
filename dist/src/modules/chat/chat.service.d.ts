import { PrismaService } from '../../database/prisma.service';
export declare class ChatService {
    private prisma;
    private rateLimitMap;
    constructor(prisma: PrismaService);
    private checkRateLimit;
    sendMessage(senderId: string, content: string, isPremiumGroup?: boolean): Promise<{
        sender: {
            id: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fileUrl: string | null;
        content: string | null;
        reactions: string | null;
        isPremiumGroup: boolean;
        senderId: string;
    }>;
    getMessages(isPremiumGroup?: boolean, limit?: number): Promise<({
        sender: {
            id: string;
            email: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fileUrl: string | null;
        content: string | null;
        reactions: string | null;
        isPremiumGroup: boolean;
        senderId: string;
    })[]>;
}
