import { PrismaService } from '../../database/prisma.service';
export declare class SubscriptionsService {
    private prisma;
    constructor(prisma: PrismaService);
    getStatus(userId: string): Promise<{
        isActive: boolean;
        plan: string;
        expiresAt?: undefined;
    } | {
        isActive: boolean;
        plan: string | null;
        expiresAt: Date;
    }>;
    activate(userId: string, planId: string, durationDays: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        isActive: boolean;
        expiresAt: Date;
        planId: string | null;
    }>;
    cancel(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        isActive: boolean;
        expiresAt: Date;
        planId: string | null;
    }>;
}
