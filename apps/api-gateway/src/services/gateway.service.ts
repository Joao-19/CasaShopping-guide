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
    try {
      const usersServiceUrl =
        this.configService.get<string>("USERS_SERVICE_URL") ||
        "http://localhost:3004";
      const response = await this.httpService.axiosRef.post(
        `${usersServiceUrl}/user/register`,
        data
      );
      return response.data;
    } catch (error: any) {
      if (error.response) {
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
