import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getMessages(premium: string): Promise<{
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
    sendMessage(body: {
        content: string;
        isPremiumGroup?: string | boolean;
        replyToId?: string;
        promoCode?: string;
    }, req: any, file: any): Promise<{
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
    reactToMessage(id: string, reaction: string, req: any): Promise<{
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
}
