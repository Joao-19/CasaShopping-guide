import { Injectable, ConflictException } from "@nestjs/common";
import { prisma } from "@repo/database"; // Nosso banco compartilhado
import * as bcrypt from "bcryptjs";
import * as jwt from "jsonwebtoken";

@Injectable()
export class AuthService {
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
      process.env.JWT_SECRET || "access-secret",
      {
        expiresIn: (process.env.JWT_EXPIRES_IN ||
          "15m") as jwt.SignOptions["expiresIn"],
      }
    );

    const refreshToken = jwt.sign(
      payload,
      process.env.REFRESH_TOKEN_SECRET || "refresh-secret",
      {
        expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN ||
          "7d") as jwt.SignOptions["expiresIn"],
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
