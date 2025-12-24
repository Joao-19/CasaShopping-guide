import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  PutBucketCorsCommand,
  PutBucketPolicyCommand,
  HeadBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client;
  private internalClient!: S3Client;
  private bucketName: string;

  private createS3Client(endpoint: string): S3Client {
    return new S3Client({
      region: "us-east-1",
      endpoint: endpoint,
      forcePathStyle: true,
      maxAttempts: 3,
      requestChecksumCalculation: "WHEN_REQUIRED",
      responseChecksumValidation: "WHEN_REQUIRED",
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>("MINIO_ROOT_USER"),
        secretAccessKey: this.configService.getOrThrow<string>(
          "MINIO_ROOT_PASSWORD"
        ),
      },
    });
  }

  async onModuleInit() {
    await this.ensureBucket();
  }

  constructor(private configService: ConfigService) {
    const accessKeyId =
      this.configService.getOrThrow<string>("MINIO_ROOT_USER");
    const secretAccessKey = this.configService.getOrThrow<string>(
      "MINIO_ROOT_PASSWORD"
    );
    this.bucketName = this.configService.getOrThrow<string>(
      "MINIO_BUCKET_NAME",
      "casashopping"
    );

    // Endpoint for generating URLs (must be accessible by browser)
    const publicEndpoint = this.configService.getOrThrow<string>(
      "MINIO_PUBLIC_ENDPOINT",
      "http://localhost:9000"
    );

    // In a real scenario, we might need a separate client for internal operations.
    // For now, we assume the signing acts for the public.
    this.s3Client = this.createS3Client(publicEndpoint);
  }

  private async ensureBucket() {
    try {
      this.logger.log(`Checking if bucket '${this.bucketName}' exists...`);
      // We need to use an internal endpoint client here probably, but let's try the configured one.
      // If configured one is public (localhost), and we are in docker, it breaks on init.
      // So we should instantiate an INTERNAL client for init operations if running in docker.

      const internalEndpoint = this.configService.get<string>(
        "MINIO_INTERNAL_ENDPOINT",
        "http://storage:9000"
      );

      let internalClient = this.createS3Client(internalEndpoint);
      this.internalClient = internalClient;

      try {
        await internalClient.send(
          new HeadBucketCommand({ Bucket: this.bucketName })
        );
      } catch (error: any) {
        // Retry with localhost if network error
        if (
          error.code === "ENOTFOUND" ||
          error.name === "TimeoutError" ||
          (error.message && error.message.includes("getaddrinfo"))
        ) {
          const fallbackEndpoint = this.configService.get<string>(
            "MINIO_PUBLIC_ENDPOINT",
            "http://localhost:9000"
          );

          this.logger.warn(
            `Could not connect to internal endpoint '${internalEndpoint}'. Retrying with fallback (public) endpoint '${fallbackEndpoint}'...`
          );
          internalClient = this.createS3Client(fallbackEndpoint);
          this.internalClient = internalClient;

          try {
            await internalClient.send(
              new HeadBucketCommand({ Bucket: this.bucketName })
            );
          } catch (retryError) {
            this.logger.log(
              `Bucket might not exist or localhost also failed. Proceeding to creation...`
            );
          }
        } else {
          this.logger.log(`Bucket '${this.bucketName}' not found. Creating...`);
        }

        // Attempt creation using the (potentially updated) client
        await internalClient.send(
          new CreateBucketCommand({ Bucket: this.bucketName })
        );
        this.logger.log(`Bucket '${this.bucketName}' created/verified.`);
      }

      // Configure CORS
      this.logger.log(`Configuring CORS for bucket '${this.bucketName}'...`);
      try {
        await internalClient.send(
          new PutBucketCorsCommand({
            Bucket: this.bucketName,
            CORSConfiguration: {
              CORSRules: [
                {
                  AllowedHeaders: ["*"],
                  AllowedMethods: ["PUT", "POST", "DELETE", "GET"],
                  AllowedOrigins: ["*"],
                  ExposeHeaders: ["ETag"],
                  MaxAgeSeconds: 3000,
                },
              ],
            },
          })
        );
      } catch (corsError) {
        this.logger.warn(
          `Failed to configure CORS: ${(corsError as Error).message}`
        );
        // Continue - do not block service start
      }
      this.logger.log(`CORS configured.`);
      this.logger.log(`CORS configured.`);

      // Configure Bucket Policy (Public Read)
      this.logger.log(
        `Configuring public read policy for bucket '${this.bucketName}'...`
      );
      const policy = {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PublicReadGetObject",
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
          },
        ],
      };

      try {
        await internalClient.send(
          new PutBucketPolicyCommand({
            Bucket: this.bucketName,
            Policy: JSON.stringify(policy),
          })
        );
        this.logger.log(`Public read policy configured.`);
      } catch (policyError) {
        this.logger.warn(
          `Failed to configure bucket policy: ${(policyError as Error).message}`
        );
      }
    } catch (error) {
      // Special handling for NotImplemented (AWS SDK v3 vs MinIO checksum issue)
      if (
        (error as any).name === "NotImplemented" ||
        (error as any).Code === "NotImplemented"
      ) {
        this.logger.warn(
          `CORS Configuration failed with NotImplemented. This is likely due to MinIO/SDK checksum mismatch. Continuing anyway (Manual CORS config might be needed).`
        );
      } else {
        this.logger.error(
          `Failed to ensure bucket/cors: ${(error as Error).message}`
        );
        // We decided to NOT throw, so the service starts.
      }
    }
  }

  async getUploadUrl(storeId: string, filename: string, contentType: string) {
    // FORCE PATH STRUCTURE: stores/{storeId}/{filename}
    const key = `stores/${storeId}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
    });

    try {
      // Expiration: 15 minutes
      const url = await getSignedUrl(this.s3Client, command, {
        expiresIn: 900,
      });
      return {
        url,
        key,
        bucket: this.bucketName,
      };
    } catch (error) {
      console.log(error);

      this.logger.error(
        `Error generating presigned URL for key ${key}: ${(error as Error).message}`
      );
      throw error;
    }
  }

  async deleteFile(key: string) {
    // For internal deletion, we might need to use the docker service name if inside docker
    // But since this service is running inside docker,
    // we need to be careful if 'localhost' is used in the client constructor.
    // We might need a second client or just assume deletion happens via management console for now to avoid complexity,
    // OR allow the deletion call to fail if network is not set up perfectly for internal calls yet.

    // Let's try to use the same client. If MINIO_PUBLIC_ENDPOINT is reachable from inside (e.g. DNS spoofing or external IP), it works.
    // Ideally we should use internal Docker DNS for this action.

    const internalEndpoint = this.configService.get<string>(
      "MINIO_INTERNAL_ENDPOINT",
      "http://casashopping-storage:9000"
    );

    // Use the client established during init (or default to internal if not set)
    if (!this.internalClient) {
      // Fallback creation
      const internalEndpoint = this.configService.get<string>(
        "MINIO_INTERNAL_ENDPOINT",
        "http://storage:9000"
      );
      this.internalClient = this.createS3Client(internalEndpoint);
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });

    await this.internalClient.send(command);
    return { success: true };
  }
}
