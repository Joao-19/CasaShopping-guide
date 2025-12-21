import { Injectable, ConflictException, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { prisma } from "@repo/database"; // Nosso banco compartilhado
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

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

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async onModuleInit() {
    const retryInterval = this.configService.get<number>(
      "DB_RETRY_INTERVAL",
      30000
    );

    while (true) {
      try {
        await this.createAdminIfNotExists();
        break; // Sucesso, sai do loop
      } catch (error) {
        console.error(
          `❌ Erro ao conectar ao banco. Tentando novamente em ${
            retryInterval / 1000
          }s...`,
          error instanceof Error ? error.message : error
        );
        await new Promise((resolve) => setTimeout(resolve, retryInterval));
      }
    }
  }

  async createAdminIfNotExists() {
    const email = this.configService.getOrThrow<string>("ADMIN_EMAIL");
    const password = this.configService.getOrThrow<string>("ADMIN_PASSWORD");
    const name = this.configService.getOrThrow<string>("ADMIN_NAME");

    const adminExists = await prisma.admin.findUnique({
      where: { email },
    });

    if (!adminExists) {
      const passwordHash = await bcrypt.hash(password, 6);

      await prisma.admin.create({
        data: {
          email,
          name,
          password: passwordHash,
          role: "SUPER_ADMIN",
        },
      });
      console.log(`✅ Admin user created: ${email}`);
    } else {
      console.log(`ℹ️ Admin user already exists: ${email}`);
    }
  }

  async validateAdmin(email: string, pass: string): Promise<any> {
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (admin && (await bcrypt.compare(pass, admin.password))) {
      const { password, ...result } = admin;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id };

    const accessToken = jwt.sign(
      payload,
      this.configService.getOrThrow<string>("JWT_SECRET"),
      {
        expiresIn: this.configService.get<string>(
          "JWT_EXPIRES_IN",
          "15m"
        ) as jwt.SignOptions["expiresIn"],
      }
    );

    const refreshToken = jwt.sign(
      payload,
      this.configService.getOrThrow<string>("REFRESH_TOKEN_SECRET"),
      {
        expiresIn: this.configService.get<string>(
          "REFRESH_TOKEN_EXPIRES_IN",
          "7d"
        ) as jwt.SignOptions["expiresIn"],
      }
    );

    const refreshHash = await bcrypt.hash(refreshToken, 6);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: refreshHash },
    });

    return {
      accessToken,
      refreshToken,
      user,
    };
  }

  async loginAdmin(admin: any) {
    const payload = { email: admin.email, sub: admin.id, role: "admin" };

    const accessToken = jwt.sign(
      payload,
      this.configService.getOrThrow<string>("JWT_SECRET"),
      {
        expiresIn: this.configService.get<string>(
          "JWT_EXPIRES_IN",
          "15m"
        ) as jwt.SignOptions["expiresIn"],
      }
    );

    const refreshToken = jwt.sign(
      payload,
      this.configService.getOrThrow<string>("REFRESH_TOKEN_SECRET"),
      {
        expiresIn: this.configService.get<string>(
          "REFRESH_TOKEN_EXPIRES_IN",
          "7d"
        ) as jwt.SignOptions["expiresIn"],
      }
    );

    const refreshHash = await bcrypt.hash(refreshToken, 6);

    await prisma.admin.update({
      where: { id: admin.id },
      data: { refreshToken: refreshHash },
    });

    return {
      accessToken,
      refreshToken,
      user: admin,
    };
  }
}
