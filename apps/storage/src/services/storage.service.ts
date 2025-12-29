import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as http from "http";
import * as https from "https";
import * as crypto from "crypto";

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

    this.logger.log(`Using MinIO Public Endpoint: ${publicEndpoint}`);

    // In a real scenario, we might need a separate client for internal operations.
    // For now, we assume the signing acts for the public.
    this.s3Client = this.createS3Client(publicEndpoint);
  }

  private async ensureBucket() {
    try {
      this.logger.log(`Checking if bucket '${this.bucketName}' exists...`);

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
            // Ignore
          }
        } else {
          // Bucket likely missing
        }

        try {
          await internalClient.send(
            new CreateBucketCommand({ Bucket: this.bucketName })
          );
          this.logger.log(`Bucket '${this.bucketName}' created/verified.`);
        } catch (e) {
          // Ignore if exists
        }
      }

      // Configure CORS MANUAL HTTP REQUEST to avoid SDK Checksum issues
      this.logger.log(
        `Configuring CORS for bucket '${this.bucketName}' via raw HTTP...`
      );
      try {
        await this.configureCorsManual(internalEndpoint);
        this.logger.log(`CORS configured successfully.`);
      } catch (corsError) {
        this.logger.warn(
          `Failed to configure CORS manually: ${(corsError as Error).message}`
        );
      }

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
      this.logger.error(
        `Failed to ensure bucket/cors: ${(error as Error).message}`
      );
    }
  }

  // Manual CORS implementation to bypass SDK v3 checksum issues with MinIO
  private async configureCorsManual(endpointUrl: string) {
    const url = new URL(endpointUrl);
    const host = url.hostname;
    const isHttps = url.protocol === "https:";
    const port = parseInt(url.port) || (isHttps ? 443 : 80);
    const accessKey = this.configService.getOrThrow<string>("MINIO_ROOT_USER");
    const secretKey = this.configService.getOrThrow<string>(
      "MINIO_ROOT_PASSWORD"
    );

    const corsConfig = `
<CORSConfiguration>
  <CORSRule>
    <AllowedHeader>*</AllowedHeader>
    <AllowedMethod>GET</AllowedMethod>
    <AllowedMethod>PUT</AllowedMethod>
    <AllowedMethod>POST</AllowedMethod>
    <AllowedMethod>DELETE</AllowedMethod>
    <AllowedOrigin>*</AllowedOrigin>
    <ExposeHeader>ETag</ExposeHeader>
  </CORSRule>
</CORSConfiguration>`.trim();

    const method = "PUT";
    const service = "s3";
    const region = "us-east-1";

    // Crypto helpers
    const sha256 = (str: string) =>
      crypto.createHash("sha256").update(str).digest("hex");
    const hmac = (key: string | Buffer, str: string) =>
      crypto.createHmac("sha256", key).update(str).digest();
    const hmacHex = (key: string | Buffer, str: string) =>
      crypto.createHmac("sha256", key).update(str).digest("hex");

    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
    const dateStamp = amzDate.substr(0, 8);

    const canonicalUri = `/${this.bucketName}`;
    const canonicalQuery = "cors=";
    const payloadHash = "UNSIGNED-PAYLOAD"; // Fix for MinIO 501 Error

    const canonicalHeaders = `host:${host}:${port}\nx-amz-content-sha256:${payloadHash}\nx-amz-date:${amzDate}\n`;
    const signedHeaders = "host;x-amz-content-sha256;x-amz-date";

    const canonicalRequest = [
      method,
      canonicalUri,
      canonicalQuery,
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join("\n");

    const algorithm = "AWS4-HMAC-SHA256";
    const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
    const stringToSign = [
      algorithm,
      amzDate,
      credentialScope,
      sha256(canonicalRequest),
    ].join("\n");

    const kDate = hmac(`AWS4${secretKey}`, dateStamp);
    const kRegion = hmac(kDate, region);
    const kService = hmac(kRegion, service);
    const kSigning = hmac(kService, "aws4_request");
    const signature = hmacHex(kSigning, stringToSign);

    const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const requestModule = isHttps ? https : http;

    return new Promise<void>((resolve, reject) => {
      const req = requestModule.request(
        {
          hostname: host,
          port: port,
          path: `/${this.bucketName}?cors`,
          method: method,
          headers: {
            Host: `${host}:${port}`,
            "x-amz-date": amzDate,
            "x-amz-content-sha256": payloadHash,
            Authorization: authorizationHeader,
            "Content-Type": "application/xml",
            "Content-Length": Buffer.byteLength(corsConfig),
          },
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => {
            if (
              res.statusCode &&
              res.statusCode >= 200 &&
              res.statusCode < 300
            ) {
              resolve();
            } else {
              reject(
                new Error(
                  `MinIO CORS failed with status ${res.statusCode}: ${body}`
                )
              );
            }
          });
        }
      );

      req.on("error", reject);
      req.write(corsConfig);
      req.end();
    });
  }

  async getUploadUrl(
    storeId: string,
    filename: string,
    contentType: string,
    contentLength: number
  ) {
    // Validate file size based on content type
    const isVideo = contentType.startsWith("video/");

    const maxImageSizeMb = this.configService.get<number>(
      "MAX_IMAGE_SIZE_MB",
      5
    ); // Default 5MB for images

    const maxVideoSizeMb = this.configService.get<number>(
      "MAX_VIDEO_SIZE_MB",
      50
    ); // Default 50MB for videos

    const maxSizeMb = isVideo ? maxVideoSizeMb : maxImageSizeMb;
    const maxSizeBytes = maxSizeMb * 1024 * 1024;

    if (contentLength > maxSizeBytes) {
      const fileType = isVideo ? "Vídeo" : "Imagem";
      throw new Error(`${fileType} excede o limite de ${maxSizeMb}MB`);
    }

    // FORCE PATH STRUCTURE: stores/{storeId}/{filename}
    const key = `stores/${storeId}/${filename}`;

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      ContentType: contentType,
      ContentLength: contentLength, // Enforce length in signature
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
