import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getMessages(premium: string): Promise<({
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
    sendMessage(body: {
        content: string;
        isPremiumGroup?: boolean;
    }, req: any): Promise<{
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
}
