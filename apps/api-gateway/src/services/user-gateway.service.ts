import {
  Injectable,
  HttpException,
  UnauthorizedException,
} from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { CreateUserDto, PaginatedResult } from "@repo/dtos";
import { firstValueFrom } from "rxjs";
import { ConfigService } from "@nestjs/config";
import * as jwt from "jsonwebtoken";

@Injectable()
export class UserGatewayService {
  private readonly usersServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.usersServiceUrl =
      this.configService.getOrThrow<string>("USERS_SERVICE_URL");
  }

  async create(createUserDto: any, token: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<any>(
          `${this.usersServiceUrl}/user/register`,
          createUserDto,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || "Internal Server Error",
        error.response?.status || 500
      );
    }
  }

  async findAll(
    page: number,
    token: string,
    search?: string
  ): Promise<PaginatedResult<any>> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<PaginatedResult<any>>(
          `${this.usersServiceUrl}/user`,
          {
            params: { page, search },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      );
      return response.data;
    } catch (error: any) {
      console.log(error);

      throw new HttpException(
        error.response?.data || "Internal Server Error",
        error.response?.status || 500
      );
    }
  }

  async getMe(token: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<any>(`${this.usersServiceUrl}/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || "Internal Server Error",
        error.response?.status || 500
      );
    }
  }

  async updateProfileImage(profileImage: string, token: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.patch<any>(
          `${this.usersServiceUrl}/user/me/profile-image`,
          { profileImage },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || "Internal Server Error",
        error.response?.status || 500
      );
    }
  }

  async acceptPrivacy(token: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.patch<any>(
          `${this.usersServiceUrl}/user/me/privacy`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || "Internal Server Error",
        error.response?.status || 500
      );
    }
  }

  async deleteMe(token: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.delete<any>(`${this.usersServiceUrl}/user/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || "Internal Server Error",
        error.response?.status || 500
      );
    }
  }

  async delete(id: string, token: string): Promise<any> {
    try {
      const response = await firstValueFrom(
        this.httpService.delete<any>(`${this.usersServiceUrl}/user/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || "Internal Server Error",
        error.response?.status || 500
      );
    }
  }

  async export(token: string): Promise<any> {
    try {
      const response = await this.httpService.axiosRef.get(
        `${this.usersServiceUrl}/user/export`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "stream",
        }
      );
      return response.data;
    } catch (error: any) {
      throw new HttpException(
        error.response?.data || "Internal Server Error",
        error.response?.status || 500
      );
    }
  }
}
