import { HttpService } from "@nestjs/axios";
import { Injectable, ConflictException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GatewayService {
  private AUTH_SERVICE_URL: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.AUTH_SERVICE_URL =
      this.configService?.get<string>("AUTH_SERVICE_URL") ||
      "http://localhost:3002";
  }

  async register(data: any) {
    console.log("[Gateway] Register called");
    console.log(
      "[Gateway] AUTH_SERVICE_URL env:",
      this.configService.get<string>("AUTH_SERVICE_URL")
    );
    console.log(
      "[Gateway] Class property AUTH_SERVICE_URL:",
      this.AUTH_SERVICE_URL
    );

    const targetUrl = `${this.AUTH_SERVICE_URL}/auth/register`;
    console.log(`[Gateway] Sending POST request to: ${targetUrl}`);

    try {
      const response = await this.httpService.axiosRef.post(targetUrl, data);
      return response.data;
    } catch (error: any) {
      console.error("[Gateway] Error in register proxy:", error.message);
      if (error.response) {
        console.error("[Gateway] Upstream status:", error.response.status);
        console.error("[Gateway] Upstream data:", error.response.data);
        throw new ConflictException(
          error.response.data.message || "Erro no registro"
        );
      }
      throw error;
    }
  }
  async login(data: any) {
    try {
      const response = await this.httpService.axiosRef.post(
        `${this.AUTH_SERVICE_URL}/auth/login`,
        data
      );
      return response.data;
    } catch (error: any) {
      console.log(error);

      if (error.response) {
        throw new ConflictException(
          error.response.data.message || "Erro no login"
        );
      }
      throw error;
    }
  }

  async adminLogin(data: any) {
    try {
      const response = await this.httpService.axiosRef.post(
        `${this.AUTH_SERVICE_URL}/auth/admin/login`,
        data
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new ConflictException(
          error.response.data.message || "Erro no login de administrador"
        );
      }
      throw error;
    }
  }
  async refreshToken(refreshToken: string) {
    try {
      const response = await this.httpService.axiosRef.post(
        `${this.AUTH_SERVICE_URL}/auth/refresh`,
        { refreshToken }
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new ConflictException(
          error.response.data.message || "Erro ao atualizar token"
        );
      }
      throw error;
    }
  }
}
