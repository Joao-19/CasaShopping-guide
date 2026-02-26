import { Injectable, HttpException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { firstValueFrom } from "rxjs";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class StorageGatewayService {
  private readonly storageServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.storageServiceUrl = this.configService.getOrThrow<string>(
      "STORAGE_SERVICE_URL",
    );
  }

  async getUploadUrl(
    storeId: string | undefined,
    filename: string,
    contentType: string,
    contentLength: number,
    token: string,
    folder?: string,
  ): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.storageServiceUrl}/storage/upload-url`,
          { storeId, filename, contentType, contentLength, folder },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || "Internal Server Error",
        error.response?.status || 500,
      );
    }
  }

  async deleteFile(key: string, token: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.storageServiceUrl}/storage/delete`,
          { key },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        ),
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || "Internal Server Error",
        error.response?.status || 500,
      );
    }
  }
}
