#!/usr/bin/env node
/**
 * Hook PreToolUse para Bash.
 *
 * Bloqueia 'git push' e execucoes de deploy*.sh quando o diff vs
 * upstream contem mudancas em paths sensiveis a chunking nos apps Next
 * (web/admin) E madge detecta dependencia circular de **valor**
 * (TDZ-prone).
 *
 * Por que: TDZ ('Cannot access X before initialization') e erro de
 * runtime que so aparece em build standalone (Docker/Linux). Build
 * local pode compilar feliz e subir imagem quebrada.
 *
 * Saida JSON com permissionDecision=deny aborta o tool call.
 */

const { execSync } = require("child_process");

const SENSITIVE_PATTERNS = [
  /^apps\/(web|admin)\/.*\/[A-Z][A-Za-z0-9]*Provider\.tsx?$/,
  /^apps\/(web|admin)\/.*\/[A-Z][A-Za-z0-9]*Context\.tsx?$/,
  /^apps\/(web|admin)\/.*\/providers\.tsx?$/,
  /^apps\/(web|admin)\/app\/.*layout\.tsx?$/,
  /^packages\/[^/]+\/src\/index\.(ts|tsx)$/,
  /^apps\/(web|admin)\/next\.config\.(js|ts|mjs)$/,
];

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

  const isPush = /(^|[\s;&|])git\s+push(\s|$)/.test(command);
  const isDeploy = /deploy(NoCache)?\.sh/.test(command);
  if (!isPush && !isDeploy) process.exit(0);

  // Quais arquivos mudaram vs upstream?
  let changed = [];
  try {
    const upstream = execSync(
      "git rev-parse --abbrev-ref --symbolic-full-name @{u}",
      { encoding: "utf8" },
    ).trim();
    const out = execSync(`git diff --name-only ${upstream}...HEAD`, {
      encoding: "utf8",
    });
    changed = out
      .split("\n")
      .map((s) => s.trim().replace(/\\/g, "/"))
      .filter(Boolean);
  } catch {
    process.exit(0); // sem upstream — nao bloqueia
  }

  const sensitive = changed.filter((p) =>
    SENSITIVE_PATTERNS.some((re) => re.test(p)),
  );
  if (sensitive.length === 0) process.exit(0);

  // Quais apps Next foram tocados? Roda madge so neles.
  const apps = [];
  if (sensitive.some((p) => p.startsWith("apps/web/")) ||
      changed.some((p) => p.startsWith("packages/")))
    apps.push("web");
  if (sensitive.some((p) => p.startsWith("apps/admin/")) ||
      changed.some((p) => p.startsWith("packages/")))
    apps.push("admin");
  if (apps.length === 0) apps.push("web");

  const providerCycles = [];
  for (const app of apps) {
    let madgeOut = "";
    try {
      madgeOut = execSync(
        `npx --yes madge --circular --extensions ts,tsx apps/${app}`,
        { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
      );
    } catch (err) {
      madgeOut = (err.stdout || "").toString() + (err.stderr || "").toString();
    }
    madgeOut
      .split("\n")
      .filter((l) => /^\d+\)/.test(l) && /Provider\.tsx?/.test(l))
      .forEach((l) => providerCycles.push(`[${app}] ${l.trim()}`));
  }

  if (providerCycles.length === 0) process.exit(0);

  const reason = [
    "Push/deploy bloqueado: validacao anti-TDZ encontrou ciclo de Provider.",
    "",
    "Arquivos sensiveis modificados:",
    ...sensitive.map((p) => `  - ${p}`),
    "",
    "Ciclos detectados (padrao P1):",
    ...providerCycles.map((l) => `  - ${l}`),
    "",
    "Aplique o fix deterministico em AI_CONTEXT/regras-tecnicas/",
    "tdz-patterns.md (P1 = extrair Context+hooks para *Context.ts",
    "separado). Valide com build standalone do app antes de tentar",
    "push/deploy de novo. TDZ e runtime — dev local nao detecta.",
  ].join("\n");

  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    }),
  );
});
