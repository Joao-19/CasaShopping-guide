#!/usr/bin/env node
// =============================================================================
//  BACKUP SEGURO — lojas + logos (casashopping-guide)
// =============================================================================
//  Gera um snapshot do que importa pra restaurar logo de loja:
//   - manifest.json / manifest.csv  -> id, nome, slug, logoImage, key relativa
//   - logos/<slug>.<ext>            -> o ARQUIVO de cada logo baixado
//   - banners/<slug>.<ext>          -> idem banner
//
//  É 100% SÓ LEITURA: só faz GET /stores (rota pública) e baixa as imagens.
//  NÃO loga, NÃO escreve nada em prod, NÃO deleta.
//
//  Rodar:  node scripts/backup-lojas-logos.mjs
//  Restaurar depois: a pasta logos/ já sai com nome = slug, então dá pra
//  re-subir direto com  node scripts/update-logos.mjs  (apontando LOGOS_DIR
//  pra essa pasta), ou restaurar logoImage pelo manifest.json (campo logoKey).
// =============================================================================

import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

const CONFIG = {
  // Sobrescrevíveis por env (útil no servidor): BACKUP_API_BASE, BACKUP_DIR.
  API_BASE:
    process.env.BACKUP_API_BASE || "https://guiadecompras.casashopping.com/api",
  OUT_ROOT: process.env.BACKUP_DIR || "./backup-lojas", // subpasta com data/hora
  DOWNLOAD_FILES: process.env.BACKUP_NO_FILES !== "1", // BACKUP_NO_FILES=1 -> só manifesto
  // Bases públicas do storage — usadas só pra derivar a KEY relativa a partir
  // da URL absoluta (pra restaurar o logoImage direto no banco se precisar).
  STORAGE_BASES: ["https://storage.casashopping.com/casashopping"],
};

const log = (...a) => console.log(...a);

function stamp() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}`;
}

function sanitize(s) {
  return (
    (s || "loja")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "loja"
  );
}

function extFromUrl(url) {
  const m = String(url)
    .split("?")[0]
    .match(/\.([a-zA-Z0-9]{2,5})$/);
  return m ? "." + m[1].toLowerCase() : "";
}

// URL absoluta do nosso storage -> key relativa ("stores/<id>/x.jpg")
function toKey(url) {
  if (!url) return null;
  if (!url.startsWith("http")) return url.replace(/^\/+/, "");
  for (const b of CONFIG.STORAGE_BASES) {
    const base = b.replace(/\/$/, "");
    if (url.startsWith(base + "/")) return url.slice(base.length + 1);
  }
  return null; // URL externa (outro host) — não é nossa key
}

async function fetchAllStores() {
  const all = [];
  let page = 1;
  while (true) {
    const res = await fetch(`${CONFIG.API_BASE}/stores?page=${page}&limit=100`);
    if (!res.ok) throw new Error(`GET /stores page ${page} -> ${res.status}`);
    const json = await res.json();
    const batch = json?.data ?? [];
    all.push(...batch);
    const lastPage = json?.meta?.lastPage ?? page;
    if (page >= lastPage || batch.length === 0) break;
    page++;
  }
  return all;
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(dest, buf);
  return buf.length;
}

async function main() {
  const outDir = join(CONFIG.OUT_ROOT, stamp());
  const logosDir = join(outDir, "logos");
  const bannersDir = join(outDir, "banners");
  await mkdir(logosDir, { recursive: true });
  await mkdir(bannersDir, { recursive: true });

  log(`\n  Backup de lojas + logos`);
  log(`  Origem: ${CONFIG.API_BASE}`);
  log(`  Destino: ${outDir}\n`);

  const stores = await fetchAllStores();
  log(`  ${stores.length} loja(s).`);

  const manifest = [];
  const usados = new Set();
  let okLogo = 0,
    semLogo = 0,
    falhaLogo = 0,
    okBanner = 0;

  for (const s of stores) {
    // nome de arquivo estável e único por loja (usa slug; cai pro nome/id)
    const b = sanitize(s.slug || s.name || s.id);
    let fname = b;
    let n = 2;
    while (usados.has(fname)) fname = `${b}-${n++}`;
    usados.add(fname);

    const row = {
      id: s.id,
      name: s.name,
      slug: s.slug ?? null,
      logoImage: s.logoImage ?? null,
      logoKey: toKey(s.logoImage),
      bannerImage: s.bannerImage ?? null,
      bannerKey: toKey(s.bannerImage),
      logoFile: null,
      bannerFile: null,
    };

    if (CONFIG.DOWNLOAD_FILES && s.logoImage) {
      const file = `${fname}${extFromUrl(s.logoImage) || ".img"}`;
      try {
        await download(s.logoImage, join(logosDir, file));
        row.logoFile = `logos/${file}`;
        okLogo++;
      } catch (e) {
        falhaLogo++;
        row.logoFile = `ERRO: ${e.message}`;
        log(`  ! falha logo "${s.name}": ${e.message}`);
      }
    } else if (!s.logoImage) {
      semLogo++;
    }

    if (CONFIG.DOWNLOAD_FILES && s.bannerImage) {
      const file = `${fname}${extFromUrl(s.bannerImage) || ".img"}`;
      try {
        await download(s.bannerImage, join(bannersDir, file));
        row.bannerFile = `banners/${file}`;
        okBanner++;
      } catch (e) {
        row.bannerFile = `ERRO: ${e.message}`;
      }
    }

    manifest.push(row);
  }

  await writeFile(
    join(outDir, "manifest.json"),
    JSON.stringify(manifest, null, 2),
  );

  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = [
    "id,name,slug,logoImage,logoKey,bannerImage,bannerKey,logoFile,bannerFile",
    ...manifest.map((r) =>
      [
        r.id,
        r.name,
        r.slug,
        r.logoImage,
        r.logoKey,
        r.bannerImage,
        r.bannerKey,
        r.logoFile,
        r.bannerFile,
      ]
        .map(esc)
        .join(","),
    ),
  ].join("\n");
  await writeFile(join(outDir, "manifest.csv"), csv);

  log(`\n  ----------------------------------------`);
  log(`  Lojas:         ${stores.length}`);
  log(`  Logos salvos:  ${okLogo}   sem logo: ${semLogo}   falha: ${falhaLogo}`);
  log(`  Banners:       ${okBanner}`);
  log(`  Manifesto:     ${join(outDir, "manifest.json")} (+ .csv)`);
  log(`  Arquivos:      ${logosDir}\n`);
}

main().catch((e) => {
  console.error(`\n  ERRO: ${e.message}\n`);
  process.exit(1);
});
