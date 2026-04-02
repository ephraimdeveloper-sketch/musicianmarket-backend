import { SubscriptionsService } from './subscriptions.service';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    getStatus(req: any): Promise<{
        isActive: boolean;
        plan: string;
        expiresAt?: undefined;
    } | {
        isActive: boolean;
        plan: string | null;
        expiresAt: Date;
    }>;
    activate(req: any, body: {
        planId: string;
        durationDays: number;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        isActive: boolean;
        expiresAt: Date;
        planId: string | null;
    }>;
    cancel(req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        isActive: boolean;
        expiresAt: Date;
        planId: string | null;
    }>;
}
