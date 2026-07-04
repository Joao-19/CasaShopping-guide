#!/usr/bin/env python3
# =============================================================================
#  BACKUP COMPLETO DE IMAGENS — lojas (logo + banner) + produtos
#  casashopping-guide — python3 STDLIB apenas (sem pip, sem apt, sem jq/curl)
# =============================================================================
#  Snapshot de TUDO que é preciso pra restaurar imagem de loja e de produto:
#
#    objects/<key>          -> os BYTES de cada imagem, no MESMO caminho da key
#                              do storage (ex.: objects/stores/<id>/logo.webp).
#                              O caminho relativo A objects/ É a key -> restore
#                              exato, sem remontar nome.
#    manifest-stores.json   -> id, nome, slug, logoImage, bannerImage + keys
#    manifest-products.json -> id, nome, storeId + [keys das imagens]
#    manifest.json          -> resumo (contagens, origem, data)
#
#  100% SÓ LEITURA: só faz GET nas rotas públicas (/stores, /products) e
#  baixa as imagens por URL pública. NÃO loga, NÃO escreve em prod, NÃO
#  deleta, NÃO usa credencial de storage.
#
#  Requisito:  python3  (nativo no Ubuntu; nada mais)
#  Rodar:      python3 scripts/backup-images.py
#
#  Env opcionais:
#    BACKUP_DIR=/caminho     onde salvar          (default ./backup-imagens)
#    BACKUP_API_BASE=...     origem da API        (default prod pública)
#    BACKUP_STORAGE_BASE=... base pública storage (default prod pública)
#    BACKUP_NO_FILES=1       só manifestos, sem baixar binários
# =============================================================================
import os, sys, json, urllib.request, urllib.error
from datetime import datetime

API_BASE = os.environ.get("BACKUP_API_BASE", "https://guiadecompras.casashopping.com/api").rstrip("/")
STORAGE_BASE = os.environ.get("BACKUP_STORAGE_BASE", "https://storage.casashopping.com/casashopping").rstrip("/")
OUT_ROOT = os.environ.get("BACKUP_DIR", "./backup-imagens")
NO_FILES = os.environ.get("BACKUP_NO_FILES", "0") == "1"
TIMEOUT = 30

stamp = datetime.now().strftime("%Y-%m-%d_%H%M%S")
outdir = os.path.join(OUT_ROOT, stamp)
objdir = os.path.join(outdir, "objects")
os.makedirs(objdir, exist_ok=True)
print(f"  Backup  -> {outdir}")
print(f"  API     -> {API_BASE}")
print(f"  Storage -> {STORAGE_BASE}")


def http_get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "casashopping-backup/1.0"})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as r:
        return r.read()


def get_json(path):
    return json.loads(http_get(f"{API_BASE}/{path}").decode("utf-8"))


def key_of(url):
    """URL absoluta do NOSSO storage -> key relativa. Outro host / vazio -> None."""
    if not url:
        return None
    if url.startswith(STORAGE_BASE + "/"):
        return url[len(STORAGE_BASE) + 1:]
    if url.startswith("http"):
        return None
    return url.lstrip("/")


saved = set()
dl_ok = dl_skip = dl_fail = 0


def fetch_key(key):
    global dl_ok, dl_skip, dl_fail
    if not key or NO_FILES or key in saved:
        return
    dest = os.path.join(objdir, *key.split("/"))
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        saved.add(key); dl_skip += 1; return
    os.makedirs(os.path.dirname(dest), exist_ok=True)
    try:
        data = http_get(f"{STORAGE_BASE}/{key}")
        with open(dest, "wb") as f:
            f.write(data)
        saved.add(key); dl_ok += 1
    except Exception as e:
        if os.path.exists(dest):
            os.remove(dest)
        dl_fail += 1
        print(f"  ! falha baixando: {key}  ({e})")


def fetch_all(path):
    """Baixa todas as páginas e concatena .data[]."""
    sep = "&" if "?" in path else "?"
    items, page = [], 1
    while True:
        resp = get_json(f"{path}{sep}page={page}")
        data = resp.get("data", []) or []
        items.extend(data)
        last = (resp.get("meta") or {}).get("lastPage", 1) or 1
        if page >= last or not data:
            break
        page += 1
    return items


# ------------------------------------------------------------------ LOJAS -----
print("  --- lojas ---")
stores = fetch_all("stores?limit=100")
smanifest = []
for s in stores:
    logo, banner = s.get("logoImage") or "", s.get("bannerImage") or ""
    lk, bk = key_of(logo), key_of(banner)
    fetch_key(lk); fetch_key(bk)
    smanifest.append({
        "id": s.get("id"), "name": s.get("name"), "slug": s.get("slug"),
        "logoImage": logo, "logoKey": lk, "bannerImage": banner, "bannerKey": bk,
    })
with open(os.path.join(outdir, "manifest-stores.json"), "w", encoding="utf-8") as f:
    json.dump(smanifest, f, ensure_ascii=False, indent=2)
print(f"  {len(stores)} loja(s).")

# --------------------------------------------------------------- PRODUTOS -----
print("  --- produtos ---")
products = fetch_all("products")
pmanifest = []
nimg = 0
for p in products:
    keys = []
    for img in (p.get("images") or []):
        k = key_of(img.get("path") or "")
        if k:
            keys.append(k); nimg += 1; fetch_key(k)
    store = p.get("store") or {}
    pmanifest.append({
        "id": p.get("id"), "name": p.get("name"),
        "storeId": p.get("storeId") or store.get("id") or "",
        "imageKeys": keys,
    })
with open(os.path.join(outdir, "manifest-products.json"), "w", encoding="utf-8") as f:
    json.dump(pmanifest, f, ensure_ascii=False, indent=2)
print(f"  {len(products)} produto(s), {nimg} imagem(ns) referenciada(s).")

# ----------------------------------------------------------------- RESUMO -----
with open(os.path.join(outdir, "manifest.json"), "w", encoding="utf-8") as f:
    json.dump({
        "createdAt": stamp, "apiBase": API_BASE, "storageBase": STORAGE_BASE,
        "stores": len(stores), "products": len(products),
        "objects": {"downloaded": dl_ok, "skipped": dl_skip, "failed": dl_fail},
    }, f, ensure_ascii=False, indent=2)

# Integridade: nº de keys únicas baixadas deve bater com nº de arquivos no
# disco. Se não bater, o filesystem fundiu keys (Windows/macOS são
# case-INSENSITIVE: "Foo.webp" e "foo.webp" viram o mesmo arquivo) e o
# snapshot está INCOMPLETO. O backup DEVE rodar em FS case-sensitive (Linux).
on_disk = sum(len(files) for _, _, files in os.walk(objdir))
fs_folded = len(saved) - on_disk

print("  ----------------------------------------")
print(f"  Lojas: {len(stores)} | Produtos: {len(products)}")
print(f"  Objetos: baixados {dl_ok} | ja existiam {dl_skip} | falha {dl_fail}")
print(f"  Arquivos no disco: {on_disk} (de {len(saved)} keys unicas)")
print(f"  Snapshot: {outdir}")
if dl_fail:
    print(f"  ATENCAO: {dl_fail} arquivo(s) falharam (ver linhas '!' acima).", file=sys.stderr)
if fs_folded > 0:
    print(f"  ERRO DE INTEGRIDADE: {fs_folded} key(s) foram FUNDIDAS pelo filesystem "
          f"(case-insensitive). Snapshot INCOMPLETO. Rode em Linux (case-sensitive).",
          file=sys.stderr)
    sys.exit(2)
print("  Restore:  python3 scripts/restore-images.py")
