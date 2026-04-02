import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const B2 = require('backblaze-b2');

@Injectable()
export class B2Service {
  private b2: any;
  private readonly logger = new Logger(B2Service.name);
  private cachedBucketId: string | null = null;

  constructor(private configService: ConfigService) {
    this.b2 = new B2({
      applicationKeyId: this.configService.get<string>('B2_APPLICATION_KEY_ID') || '',
      applicationKey: this.configService.get<string>('B2_APPLICATION_KEY') || '',
    });
  }

  private get bucketName(): string {
    return this.configService.get<string>('B2_BUCKET') || '';
  }

  private get endpoint(): string {
    return this.configService.get<string>('B2_ENDPOINT') || 's3.us-east-005.backblazeb2.com';
  }

  private async init(): Promise<void> {
    await this.b2.authorize();

    if (!this.cachedBucketId) {
      // ✅ Prefer explicit B2_BUCKET_ID from .env (avoids listBuckets permission requirement)
      const explicitId = this.configService.get<string>('B2_BUCKET_ID');
      if (explicitId) {
        this.cachedBucketId = explicitId;
        this.logger.log(`Using explicit B2_BUCKET_ID: ${explicitId}`);
        return;
      }

      // Fallback: resolve by listing (requires broader key permissions)
      try {
        const res = await this.b2.listBuckets();
        const buckets: any[] = res.data?.buckets || [];
        const match = buckets.find((b: any) => b.bucketName === this.bucketName);
        if (match) {
          this.cachedBucketId = match.bucketId;
          this.logger.log(`Resolved B2 bucketId for "${this.bucketName}": ${this.cachedBucketId}`);
          return;
        }
        this.logger.error(`Bucket "${this.bucketName}" not found. Available: ${buckets.map((b: any) => b.bucketName).join(', ')}`);
      } catch (e) {
        this.logger.error('listBuckets failed (restricted key). Add B2_BUCKET_ID to .env', e);
      }

      throw new Error(
        `Cannot resolve B2 bucket ID. ` +
        `Add B2_BUCKET_ID=<your-bucket-id> to your .env file. ` +
        `Find it in Backblaze console → Buckets → ${this.bucketName}`
      );
    }
  }

  async uploadFile(fileName: string, buffer: Buffer, contentType: string): Promise<string> {
    try {
      await this.init();

      const uploadUrlRes = await this.b2.getUploadUrl({ bucketId: this.cachedBucketId });
      await this.b2.uploadFile({
        uploadUrl: uploadUrlRes.data.uploadUrl,
        uploadAuthToken: uploadUrlRes.data.authorizationToken,
        fileName,
        data: buffer,
        contentType,
      });

      const fileUrl = `https://${this.endpoint}/file/${this.bucketName}/${fileName}`;
      this.logger.log(`File uploaded: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      this.logger.error('B2 Upload Failed', error);
      throw error;
    }
  }

  async getSignedUrl(fileName: string): Promise<string> {
    try {
      await this.init();

      const authRes = await this.b2.getDownloadAuthorization({
        bucketId: this.cachedBucketId,
        fileNamePrefix: fileName,
        validDurationInSeconds: 3600,
      });

      const authToken = authRes.data.authorizationToken;
      return `https://${this.endpoint}/file/${this.bucketName}/${fileName}?Authorization=${authToken}`;
    } catch (error) {
      this.logger.error('B2 GetSignedUrl Failed', error);
      throw error;
    }
  }
}
