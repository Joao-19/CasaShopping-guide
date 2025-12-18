import { Injectable, ConflictException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { prisma } from "@repo/database"; // Nosso banco compartilhado
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

@Injectable()
export class AuthService {
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
}
