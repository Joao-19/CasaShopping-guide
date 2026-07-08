#!/usr/bin/env python3
# =============================================================================
#  RESTORE DE IMAGENS — lojas + produtos — casashopping-guide
#  python3 STDLIB apenas (sem pip, sem apt, sem jq/curl)
# =============================================================================
#  Reenvia CADA arquivo salvo pelo backup-images.py de volta pra sua key
#  EXATA no storage. O caminho relativo a objects/ JÁ É a key -> não há
#  remontagem de nome, não há adivinhação.
#
#  SEGURANÇA:
#    - SÓ FAZ PUT (upload). NUNCA deleta, nunca mexe no banco.
#    - Idempotente: reenviar os mesmos bytes pra mesma key é inócuo.
#    - Confere que o presign devolveu EXATAMENTE a key esperada; se vier
#      diferente, ABORTA aquele arquivo em vez de gravar no lugar errado.
#    - DRY-RUN por padrão: mostra o que faria. Só grava com CONFIRM=1.
#
#  Requisito:  python3  (nativo no Ubuntu; nada mais)
#  Uso:
#    # 1) ver o que seria restaurado (não grava nada):
#    ADMIN_TOKEN=xxx python3 scripts/restore-images.py
#    # 2) restaurar só o que sumiu (mais seguro):
#    ADMIN_TOKEN=xxx ONLY_MISSING=1 CONFIRM=1 python3 scripts/restore-images.py
#    # 3) restaurar tudo:
#    ADMIN_TOKEN=xxx CONFIRM=1 python3 scripts/restore-images.py
#
#  ADMIN_TOKEN: access_token de um admin logado (DevTools > Application >
#               Cookies, ou o valor do cookie access_token).
#
#  Env opcionais:
#    SNAPSHOT=/caminho/2026-..._....  qual snapshot usar (default: + recente)
#    BACKUP_DIR=/caminho              onde estão os snapshots (default ./backup-imagens)
#    RESTORE_API_BASE=...             API (default prod pública)
#    RESTORE_STORAGE_BASE=...         base pública storage (p/ ONLY_MISSING)
#    ONLY_MISSING=1                   só restaura keys que estão 404 agora
# =============================================================================
import os, sys, json, glob, urllib.request, urllib.error

API_BASE = os.environ.get("RESTORE_API_BASE", "https://guiadecompras.casashopping.com/api").rstrip("/")
STORAGE_BASE = os.environ.get("RESTORE_STORAGE_BASE", "https://storage.casashopping.com/casashopping").rstrip("/")
ROOT = os.environ.get("BACKUP_DIR", "./backup-imagens")
CONFIRM = os.environ.get("CONFIRM", "0") == "1"
ONLY_MISSING = os.environ.get("ONLY_MISSING", "0") == "1"
TOKEN = os.environ.get("ADMIN_TOKEN", "")
TIMEOUT = 30

CTYPES = {
    ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg", ".gif": "image/gif", ".mp4": "video/mp4",
    ".webm": "video/webm",
}


def ctype_of(key):
    return CTYPES.get(os.path.splitext(key)[1].lower(), "application/octet-stream")


# Descobre o snapshot (o mais recente, se não informado)
snap = os.environ.get("SNAPSHOT", "")
if not snap:
    dirs = sorted(d for d in glob.glob(os.path.join(ROOT, "*")) if os.path.isdir(d))
    snap = dirs[-1] if dirs else ""
objroot = os.path.join(snap, "objects")
if not snap or not os.path.isdir(objroot):
    sys.exit("ERRO: snapshot inválido. Rode o backup antes, ou informe SNAPSHOT=...")

print(f"  Snapshot -> {snap}")
print(f"  API      -> {API_BASE}")
print("  MODO     -> " + ("GRAVANDO (CONFIRM=1)" if CONFIRM else "DRY-RUN (não grava; use CONFIRM=1 pra valer)"))
if ONLY_MISSING:
    print("  FILTRO   -> só keys ausentes no storage agora")
if CONFIRM and not TOKEN:
    sys.exit("ERRO: CONFIRM=1 exige ADMIN_TOKEN (token de admin logado).")


def storage_has(key):
    try:
        req = urllib.request.Request(f"{STORAGE_BASE}/{key}", method="HEAD")
        with urllib.request.urlopen(req, timeout=TIMEOUT):
            return True
    except Exception:
        return False


def presign(folder, filename, ctype, clen):
    body = json.dumps({
        "folder": folder, "filename": filename,
        "contentType": ctype, "contentLength": clen,
    }).encode("utf-8")
    req = urllib.request.Request(
        f"{API_BASE}/storage/upload-url", data=body, method="POST",
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {TOKEN}"},
    )
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return json.loads(r.read().decode("utf-8"))


def put_bytes(url, data, ctype):
    req = urllib.request.Request(url, data=data, method="PUT", headers={"Content-Type": ctype})
    with urllib.request.urlopen(req, timeout=max(TIMEOUT, 60)):
        return True


# Coleta todos os arquivos; key = caminho relativo a objects/ (sempre com "/")
files = []
for dirpath, _, names in os.walk(objroot):
    for n in names:
        full = os.path.join(dirpath, n)
        key = os.path.relpath(full, objroot).replace(os.sep, "/")
        files.append((full, key))
files.sort(key=lambda x: x[1])

total = len(files)
done_ok = skipped = failed = 0

for full, key in files:
    ctype = ctype_of(key)
    with open(full, "rb") as fh:
        data = fh.read()
    clen = len(data)

    if ONLY_MISSING and storage_has(key):
        skipped += 1
        continue

    if not CONFIRM:
        print(f"  [dry] {key}  ({clen}B, {ctype})")
        continue

    folder = os.path.dirname(key)
    filename = os.path.basename(key)
    try:
        res = presign(folder, filename, ctype, clen)
    except Exception as e:
        print(f"  ! presign falhou: {key}  ({e})"); failed += 1; continue

    url, gotkey = res.get("url"), res.get("key")
    if not url:
        print(f"  ! sem url no presign: {key}"); failed += 1; continue
    if gotkey != key:
        print(f"  ! key divergente (esperado '{key}', veio '{gotkey}') — PULANDO por segurança")
        failed += 1; continue

    try:
        put_bytes(url, data, ctype)
        print(f"  ok  {key}"); done_ok += 1
    except Exception as e:
        print(f"  ! upload falhou: {key}  ({e})"); failed += 1

print("  ----------------------------------------")
if not CONFIRM:
    print(f"  DRY-RUN: {total} arquivo(s) seriam restaurados. Rode com CONFIRM=1 pra gravar.")
else:
    print(f"  Restaurados: {done_ok} | pulados: {skipped} | falha: {failed}  (de {total})")
    if failed:
        print(f"  ATENCAO: {failed} falha(s) — ver linhas '!' acima.", file=sys.stderr)
