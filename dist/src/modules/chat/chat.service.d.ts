import { PrismaService } from '../../database/prisma.service';
import { B2Service } from '../../common/services/b2.service';
export declare class ChatService {
    private prisma;
    private b2;
    private rateLimitMap;
    constructor(prisma: PrismaService, b2: B2Service);
    private checkRateLimit;
    sendMessage(senderId: string, content: string, isPremiumGroup?: boolean, replyToId?: string, file?: any, promoCode?: string): Promise<{
        replyTo: {
            id: string;
            content: string | null;
            sender: {
                firstName: string | null;
            };
        } | null;
        sender: {
            id: string;
            firstName: string | null;
            avatar: string | null;
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
        replyToId: string | null;
    }>;
    reactToMessage(messageId: string, reaction: string, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fileUrl: string | null;
        content: string | null;
        reactions: string | null;
        isPremiumGroup: boolean;
        senderId: string;
        replyToId: string | null;
    }>;
    getMessages(isPremiumGroup?: boolean, limit?: number): Promise<{
        fileUrlSigned: string | null;
        replyTo: {
            id: string;
            content: string | null;
            sender: {
                firstName: string | null;
            };
        } | null;
        sender: {
            id: string;
            firstName: string | null;
            avatar: string | null;
        };
        id: string;
        createdAt: Date;
        updatedAt: Date;
        fileUrl: string | null;
        content: string | null;
        reactions: string | null;
        isPremiumGroup: boolean;
        senderId: string;
        replyToId: string | null;
    }[]>;
}
