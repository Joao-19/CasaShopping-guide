import {
  Injectable,
  ConflictException,
  OnModuleInit,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { prisma } from "@repo/database"; // Nosso banco compartilhado
import * as bcrypt from "bcryptjs";
import { log } from "console";
import * as jwt from "jsonwebtoken";

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(private configService: ConfigService) {}

  async register(data: any) {
    console.log(
      `[AuthService] Registering user: ${data.email}, Name: ${data.name}`,
    );
    const email = data.email.toLowerCase();

    const userExists = await prisma.user.findUnique({
      where: { email },
    });

    console.log(
      `[AuthService] Check if user exists (${email}):`,
      userExists ? "FOUND" : "NOT FOUND",
    );

    if (userExists) {
      console.warn(
        `[AuthService] Conflict: User already exists with ID: ${userExists.id}`,
      );
      throw new ConflictException("Este e-mail já está cadastrado.");
    }

    const passwordHash = await bcrypt.hash(data.password, 6);

    // `privacyAccepted` é flag de contrato, não coluna. O consentimento é
    // registrado como timestamp gravado no servidor (fonte da verdade LGPD).
    const { privacyAccepted, ...rest } = data;

    try {
      console.log(`[AuthService] Attempting to create user in DB...`);
      const newUser = await prisma.user.create({
        data: {
          ...rest,
          email,
          password: passwordHash,
          privacyAcceptedAt: privacyAccepted ? new Date() : null,
        },
      });
      console.log(`[AuthService] User created successfully: ${newUser.id}`);

      const { password, ...result } = newUser;
      return result;
    } catch (error: any) {
      console.error(`[AuthService] Creation Error:`, error);
      if (error.code === "P2002") {
        const field = error.meta?.target?.[0];
        console.warn(
          `[AuthService] Unique Constraint Violation on field: ${field}`,
        );
        if (field === "email") {
          throw new ConflictException("Este e-mail já está cadastrado.");
        }
        throw new ConflictException(`O ${field} informado já está em uso.`);
      }
      throw error;
    }
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
      30000,
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
          error instanceof Error ? error.message : error,
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
          "15m",
        ) as jwt.SignOptions["expiresIn"],
      },
    );

    const refreshToken = jwt.sign(
      payload,
      this.configService.getOrThrow<string>("REFRESH_TOKEN_SECRET"),
      {
        expiresIn: this.configService.get<string>(
          "REFRESH_TOKEN_EXPIRES_IN",
          "7d",
        ) as jwt.SignOptions["expiresIn"],
      },
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
          "15m",
        ) as jwt.SignOptions["expiresIn"],
      },
    );

    const refreshToken = jwt.sign(
      payload,
      this.configService.getOrThrow<string>("REFRESH_TOKEN_SECRET"),
      {
        expiresIn: this.configService.get<string>(
          "REFRESH_TOKEN_EXPIRES_IN",
          "7d",
        ) as jwt.SignOptions["expiresIn"],
      },
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
  async refreshToken(token: string) {
    try {
      const payload = jwt.verify(
        token,
        this.configService.getOrThrow<string>("REFRESH_TOKEN_SECRET"),
      ) as any;

      if (payload.role === "admin") {
        const admin = await prisma.admin.findUnique({
          where: { id: payload.sub },
        });

        if (!admin || !admin.refreshToken) {
          throw new UnauthorizedException("Acesso negado");
        }

        const isRefreshTokenValid = await bcrypt.compare(
          token,
          admin.refreshToken,
        );

        if (!isRefreshTokenValid) {
          throw new UnauthorizedException("Refresh token inválido");
        }

        return this.loginAdmin(admin);
      } else {
        const user = await prisma.user.findUnique({
          where: { id: payload.sub },
        });

        if (!user || !user.refreshToken) {
          throw new UnauthorizedException("Acesso negado");
        }

        const isRefreshTokenValid = await bcrypt.compare(
          token,
          user.refreshToken,
        );

        if (!isRefreshTokenValid) {
          throw new UnauthorizedException("Refresh token inválido");
        }

        return this.login(user);
      }
    } catch (e) {
      throw new UnauthorizedException("Refresh token inválido ou expirado");
    }
  }
}
