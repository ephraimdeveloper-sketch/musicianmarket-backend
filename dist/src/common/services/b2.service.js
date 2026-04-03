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
var B2Service_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.B2Service = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const B2 = require('backblaze-b2');
let B2Service = B2Service_1 = class B2Service {
    configService;
    b2;
    logger = new common_1.Logger(B2Service_1.name);
    cachedBucketId = null;
    constructor(configService) {
        this.configService = configService;
        this.b2 = new B2({
            applicationKeyId: this.configService.get('B2_APPLICATION_KEY_ID') || '',
            applicationKey: this.configService.get('B2_APPLICATION_KEY') || '',
        });
    }
    get bucketName() {
        return this.configService.get('B2_BUCKET') || '';
    }
    get endpoint() {
        return this.configService.get('B2_ENDPOINT') || 's3.us-east-005.backblazeb2.com';
    }
    async init() {
        await this.b2.authorize();
        if (!this.cachedBucketId) {
            const explicitId = this.configService.get('B2_BUCKET_ID');
            if (explicitId) {
                this.cachedBucketId = explicitId;
                this.logger.log(`Using explicit B2_BUCKET_ID: ${explicitId}`);
                return;
            }
            try {
                const res = await this.b2.listBuckets();
                const buckets = res.data?.buckets || [];
                const match = buckets.find((b) => b.bucketName === this.bucketName);
                if (match) {
                    this.cachedBucketId = match.bucketId;
                    this.logger.log(`Resolved B2 bucketId for "${this.bucketName}": ${this.cachedBucketId}`);
                    return;
                }
                this.logger.error(`Bucket "${this.bucketName}" not found. Available: ${buckets.map((b) => b.bucketName).join(', ')}`);
            }
            catch (e) {
                this.logger.error('listBuckets failed (restricted key). Add B2_BUCKET_ID to .env', e);
            }
            throw new Error(`Cannot resolve B2 bucket ID. ` +
                `Add B2_BUCKET_ID=<your-bucket-id> to your .env file. ` +
                `Find it in Backblaze console → Buckets → ${this.bucketName}`);
        }
    }
    async uploadFile(fileName, buffer, contentType) {
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
            const fileUrl = fileName;
            this.logger.log(`File registered: ${fileUrl}`);
            return fileUrl;
        }
        catch (error) {
            this.logger.error('B2 Upload Failed', error);
            throw error;
        }
    }
    async getSignedUrl(fileName) {
        try {
            await this.init();
            const authRes = await this.b2.getDownloadAuthorization({
                bucketId: this.cachedBucketId,
                fileNamePrefix: fileName.includes('backblazeb2.com/file/') ? fileName.split('/file/')[1].split('/').slice(1).join('/') : fileName,
                validDurationInSeconds: 3600,
            });
            const authToken = authRes.data.authorizationToken;
            const cleanFileName = fileName.includes('backblazeb2.com/file/') ? fileName.split('/file/')[1].split('/').slice(1).join('/') : fileName;
            return `https://${this.endpoint}/file/${this.bucketName}/${cleanFileName}?Authorization=${authToken}`;
        }
        catch (error) {
            this.logger.error('B2 GetSignedUrl Failed', error);
            throw error;
        }
    }
    async deleteFile(fileName) {
        try {
            await this.init();
            const res = await this.b2.listFileVersions({
                bucketId: this.cachedBucketId,
                startFileName: fileName,
                maxFileCount: 1,
            });
            const file = res.data.files.find((f) => f.fileName === fileName);
            if (file) {
                await this.b2.deleteFileVersion({
                    fileName: file.fileName,
                    fileId: file.fileId,
                });
                this.logger.log(`File deleted from B2: ${fileName}`);
            }
        }
        catch (error) {
            this.logger.error('B2 Delete Failed', error);
        }
    }
};
exports.B2Service = B2Service;
exports.B2Service = B2Service = B2Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], B2Service);
//# sourceMappingURL=b2.service.js.map