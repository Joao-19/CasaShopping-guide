import { HttpService } from "@nestjs/axios";
import { Injectable, ConflictException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { prisma } from "@repo/database";
import * as bcrypt from "bcryptjs";

@Injectable()
export class GatewayService {
  private AUTH_SERVICE_URL: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    console.log(
      "GatewayService initialized. ConfigService:",
      configService,
      "HttpService:",
      httpService
    );
    this.AUTH_SERVICE_URL =
      this.configService?.get<string>("AUTH_SERVICE_URL") ||
      "http://localhost:3002";
  }

  async register(data: any) {
    const userExists = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (userExists) {
      throw new ConflictException("Email já cadastrado");
    }

    const passwordHash = await bcrypt.hash(data.password, 6);

    const newUser = await prisma.user.create({
      data: { ...data, password: passwordHash },
    });

    const { password, ...result } = newUser;
    return result;
  }
}
