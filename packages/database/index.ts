// packages/database/index.ts
import { PrismaClient } from "./generated/client";

// Cria a instância da conexão com o banco
export const prisma = new PrismaClient();

// Exporta também os tipos (User, Admin, etc) para usar no código
export * from "./generated/client";
