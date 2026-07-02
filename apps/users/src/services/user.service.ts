import { Injectable, ConflictException } from "@nestjs/common";
import { prisma } from "@repo/database";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UserService {
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

  async findAll(page: number = 1, search?: string) {
    const take = 15;
    const skip = (page - 1) * take;

    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        take,
        skip,
        orderBy: {
          name: "asc",
        },
        where,
      }),
      prisma.user.count({ where }),
    ]);

    const sanitizedUsers = users.map((user) => {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      };
    });

    return {
      data: sanitizedUsers,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / take),
        limit: take,
      },
    };
  }

  async delete(id: string) {
    await prisma.user.delete({
      where: { id },
    });
    return { message: "User deleted successfully" };
  }

  async getById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;

    const { password, refreshToken, ...result } = user;
    return result;
  }

  async updateProfileImage(id: string, profileImage: string) {
    const user = await prisma.user.update({
      where: { id },
      data: { profileImage },
    });
    const { password, refreshToken, ...result } = user;
    return result;
  }

  // Consentimento LGPD do usuário já cadastrado (gate no login). Grava a
  // data/hora real do aceite. Idempotente: não sobrescreve um aceite
  // anterior, para preservar o timestamp original do consentimento.
  async acceptPrivacy(id: string) {
    const current = await prisma.user.findUnique({ where: { id } });
    if (!current) return null;

    const user = current.privacyAcceptedAt
      ? current
      : await prisma.user.update({
          where: { id },
          data: { privacyAcceptedAt: new Date() },
        });

    const { password, refreshToken, ...result } = user;
    return result;
  }

  async *exportUsers() {
    const batchSize = 1000;
    let skip = 0;

    // Header row
    yield "nome;email;telefone\n";

    while (true) {
      const users = await prisma.user.findMany({
        take: batchSize,
        skip: skip,
        orderBy: { name: "asc" },
        select: {
          name: true,
          email: true,
          phone: true,
        },
      });

      if (users.length === 0) break;

      for (const user of users) {
        const line = `${user.name};${user.email};${user.phone || ""}\n`;
        yield line;
      }

      skip += batchSize;
    }
  }
}
