#!/usr/bin/env node
/**
 * Hook PostToolUse para Bash.
 *
 * Apos `git pull`, `git merge`, `git checkout`, `git rebase` ou `git
 * reset` que toquem em `packages/database/prisma/migrations/`, lembra
 * de checar e aplicar migrations pendentes.
 *
 * Por que: o cliente Prisma (`prisma generate`) so gera tipos
 * TypeScript — nao cria tabelas. `tsc --noEmit` continua verde mesmo
 * com tabelas faltando no banco. O erro so aparece em runtime quando
 * o codigo executa a query (`relation "..." does not exist`).
 *
 * Saida JSON com additionalContext aparece como system-reminder para
 * a IA — nao bloqueia.
 */

const { execSync } = require("child_process");

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

  const command = input?.tool_input?.command;
  if (!command || typeof command !== "string") process.exit(0);

  const isSyncOp =
    /(^|[\s;&|])git\s+(pull|merge|checkout|rebase|reset|switch)(\s|$)/.test(
      command,
    );
  if (!isSyncOp) process.exit(0);

  // A pasta de migrations mudou nos ultimos 5 minutos?
  let migrationsTouched = false;
  try {
    const out = execSync(
      "git log --since=5.minutes.ago --name-only --pretty=format: -- packages/database/prisma/migrations/",
      { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] },
    ).trim();
    migrationsTouched = out.length > 0;
  } catch {
    migrationsTouched = true;
  }

  if (!migrationsTouched) process.exit(0);

  const message = [
    "Pasta `packages/database/prisma/migrations/` mudou recentemente apos um",
    "`git " +
      (command.match(/git\s+(\w+)/)?.[1] ?? "sync") +
      "`. Confirme se ha migration pendente no DB local:",
    "",
    "  pnpm --filter @repo/database exec prisma migrate status",
    "",
    'Se aparecer "have not yet been applied":',
    "",
    "  pnpm --filter @repo/database exec prisma migrate deploy",
    "",
    "Por que: `prisma generate` regenera tipos TS, nao cria tabelas no",
    "banco. `tsc --noEmit` fica verde mesmo com schema desatualizado;",
    "o erro so aparece em runtime.",
  ].join("\n");

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PostToolUse",
        additionalContext: message,
      },
    }),
  );
  process.exit(0);
});
