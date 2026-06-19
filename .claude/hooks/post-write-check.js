#!/usr/bin/env node
/**
 * Hook PostToolUse para Edit/Write/MultiEdit.
 *
 * Lembretes informativos (nao bloqueantes) baseados nas regras canonicas
 * em AI_CONTEXT/. Generico — a IA julga em cada contexto.
 *
 * Regras cobertas:
 *  1. Tamanho de componente em apps/web/** e apps/admin/** — two-tier:
 *       300-600L: aviso suave (decompor quando puder)
 *       >600L:   aviso forte (decompor antes de continuar)
 *     (regras-tecnicas §3 + §6, boas-praticas §6)
 *  2. Reuso primeiro: ao criar/editar .tsx nos apps, lembrar de buscar
 *     equivalente em packages/ui/ (regras-tecnicas §3.1, regras §7)
 *  3. Idempotencia em migrations Prisma:
 *     ALTER TYPE ADD VALUE sem IF NOT EXISTS
 *  4. Edicao em path sensivel a chunking (provider/context/layout/barrel/
 *     next.config) → instrui rodar madge antes de declarar pronto.
 *     Padroes TDZ conhecidos em AI_CONTEXT/regras-tecnicas/tdz-patterns.md.
 */

const SOFT_LIMIT = 300;
const HARD_LIMIT = 600;

const fs = require("fs");
const path = require("path");

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  raw += chunk;
});
process.stdin.on("end", () => {
  let input;
  try {
    input = JSON.parse(raw);
  } catch {
    process.exit(0);
  }

  const filePath = input?.tool_input?.file_path;
  if (!filePath || typeof filePath !== "string") {
    process.exit(0);
  }

  const cwd = process.cwd();
  const rel = path.relative(cwd, filePath).replace(/\\/g, "/");

  const isFrontendApp =
    rel.startsWith("apps/web/") || rel.startsWith("apps/admin/");

  const reminders = [];

  // 1. Tamanho nos apps Next — two-tier
  if (isFrontendApp && /\.(tsx|ts)$/.test(rel) && fs.existsSync(filePath)) {
    const lines = fs.readFileSync(filePath, "utf8").split("\n").length;
    if (lines > HARD_LIMIT) {
      reminders.push(
        `${rel} tem ${lines} linhas (acima do limite forte de ${HARD_LIMIT}). AI_CONTEXT/regras-tecnicas/README.md §3 e §6: decompor em subcomponentes, hooks ou utilitarios ANTES de continuar com novas mudancas neste arquivo.`,
      );
    } else if (lines > SOFT_LIMIT) {
      reminders.push(
        `${rel} tem ${lines} linhas (alvo ${SOFT_LIMIT}, teto ${HARD_LIMIT}). Considere decompor quando puder. Nao bloqueia mudancas pequenas / cirurgicas.`,
      );
    }
  }

  // 2. Reuso primeiro
  if (isFrontendApp && rel.endsWith(".tsx")) {
    reminders.push(
      `Antes de criar ou expandir componente nos apps, verifique se ha equivalente em packages/ui/src/. AI_CONTEXT/regras-tecnicas/README.md §3.1 e regras/README.md §7.`,
    );
  }

  // 3. Migration idempotente
  if (
    rel.startsWith("packages/database/prisma/migrations/") &&
    rel.endsWith(".sql") &&
    fs.existsSync(filePath)
  ) {
    const content = fs.readFileSync(filePath, "utf8");
    const offending = content
      .split("\n")
      .filter(
        (l) => /ALTER TYPE.*ADD VALUE\s+'/.test(l) && !/IF NOT EXISTS/.test(l),
      );
    if (offending.length > 0) {
      reminders.push(
        `${rel} contem ${offending.length} ALTER TYPE ADD VALUE sem IF NOT EXISTS. Migrations devem ser idempotentes — re-runs em ambientes com estado parcial vao falhar.`,
      );
    }
  }

  // 4. Path sensivel a chunking → instrucao de validacao standalone.
  const isSensitiveToChunking =
    /^apps\/(web|admin)\/.*\/[A-Z][A-Za-z0-9]*Provider\.tsx?$/.test(rel) ||
    /^apps\/(web|admin)\/.*\/[A-Z][A-Za-z0-9]*Context\.tsx?$/.test(rel) ||
    /^apps\/(web|admin)\/.*\/providers\.tsx?$/.test(rel) ||
    /^apps\/(web|admin)\/app\/.*layout\.tsx?$/.test(rel) ||
    /^packages\/[^/]+\/src\/index\.(ts|tsx)$/.test(rel) ||
    /^apps\/(web|admin)\/next\.config\.(js|ts|mjs)$/.test(rel);

  if (isSensitiveToChunking) {
    const app = rel.startsWith("apps/admin/") ? "admin" : "web";
    reminders.push(
      `${rel} esta em path sensivel a chunking (TDZ-prone). ANTES de declarar turno pronto: rodar 'npx madge --circular --extensions ts,tsx apps/${app}'. Se aparecer ciclo de valor envolvendo Provider, aplicar o fix deterministico de AI_CONTEXT/regras-tecnicas/tdz-patterns.md (padrao P1) sem perguntar. TDZ e runtime — build local nao detecta sempre.`,
    );
  }

  if (reminders.length === 0) {
    process.exit(0);
  }

  const out = {
    hookSpecificOutput: {
      hookEventName: "PostToolUse",
      additionalContext: reminders.map((r, i) => `[#${i + 1}] ${r}`).join(" "),
    },
  };
  process.stdout.write(JSON.stringify(out));
});
