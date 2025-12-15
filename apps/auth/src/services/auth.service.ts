import { Injectable, ConflictException } from "@nestjs/common";
import { prisma } from "@repo/database"; // Nosso banco compartilhado
import * as bcrypt from "bcryptjs";

@Injectable() // Avisa ao Nest que isso pode ser injetado
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
}
