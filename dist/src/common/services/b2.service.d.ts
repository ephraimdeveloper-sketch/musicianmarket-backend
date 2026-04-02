import { ConfigService } from '@nestjs/config';
export declare class B2Service {
    private configService;
    private b2;
    private readonly logger;
    private cachedBucketId;
    constructor(configService: ConfigService);
    private get bucketName();
    private get endpoint();
    private init;
    uploadFile(fileName: string, buffer: Buffer, contentType: string): Promise<string>;
    getSignedUrl(fileName: string): Promise<string>;
}
