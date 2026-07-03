#!/usr/bin/env bash
# =============================================================================
#  BACKUP SEGURO — lojas + logos (casashopping-guide) — nativo Ubuntu
# =============================================================================
#  Gera um snapshot do que importa pra restaurar logo de loja:
#    - manifest.json / manifest.csv -> id, nome, slug, logoImage, key relativa
#    - logos/<slug>.<ext>           -> o ARQUIVO de cada logo baixado
#
#  100% SÓ LEITURA: só faz GET /stores (rota pública) e baixa as imagens.
#  NÃO loga, NÃO escreve em prod, NÃO deleta. Sem credenciais.
#
#  Requisitos (Ubuntu):  curl  jq   (sudo apt install -y curl jq)
#  Rodar:                bash scripts/backup-lojas-logos.sh
#
#  Env opcionais:
#    BACKUP_DIR=/caminho        onde salvar (default ./backup-lojas)
#    BACKUP_API_BASE=...        origem (default prod pública)
#    BACKUP_NO_FILES=1          só o manifesto, sem baixar binários
# =============================================================================
set -uo pipefail

API_BASE="${BACKUP_API_BASE:-https://guiadecompras.casashopping.com/api}"
OUT_ROOT="${BACKUP_DIR:-./backup-lojas}"
NO_FILES="${BACKUP_NO_FILES:-0}"
STORAGE_BASE="https://storage.casashopping.com/casashopping"

for c in curl jq; do
  command -v "$c" >/dev/null 2>&1 || {
    echo "ERRO: falta '$c'. Instale:  sudo apt install -y curl jq"
    exit 1
  }
done

stamp="$(date +%Y-%m-%d_%H%M%S)"
outdir="$OUT_ROOT/$stamp"
mkdir -p "$outdir/logos"
echo "  Backup  -> $outdir"
echo "  Origem  -> $API_BASE"

# 1) baixa TODAS as páginas de /stores e concatena os objetos .data
raw="$(mktemp)"
trap 'rm -f "$raw"' EXIT
page=1
while : ; do
  resp="$(curl -fsS "$API_BASE/stores?page=$page&limit=100")" || {
    echo "  ERRO ao buscar /stores (página $page)"; exit 1; }
  printf '%s' "$resp" | jq -c '.data[]' >> "$raw"
  last="$(printf '%s' "$resp" | jq -r '.meta.lastPage // 1')"
  cnt="$(printf '%s' "$resp" | jq -r '.data | length')"
  { [ "$page" -ge "$last" ] || [ "$cnt" -eq 0 ]; } && break
  page=$((page + 1))
done
total="$(wc -l < "$raw" | tr -d ' ')"
echo "  $total loja(s)."

slugify() {
  printf '%s' "$1" | iconv -f utf-8 -t ascii//TRANSLIT 2>/dev/null \
    | tr '[:upper:]' '[:lower:]' \
    | sed -E 's/[^a-z0-9._-]+/-/g; s/^-+//; s/-+$//' | cut -c1-80
}
key_of() { # URL absoluta do nosso storage -> key relativa ("stores/<id>/x.jpg")
  case "$1" in
    "$STORAGE_BASE"/*) printf '%s' "${1#"$STORAGE_BASE"/}" ;;
    http*) printf '' ;;             # URL de outro host — não é nossa key
    *) printf '%s' "${1#/}" ;;
  esac
}

echo "id,name,slug,logoImage,logoKey,bannerImage,bannerKey,logoFile" > "$outdir/manifest.csv"
: > "$outdir/manifest.jsonl"

okLogo=0; semLogo=0; falha=0
declare -A used
while IFS=$'\t' read -r id name slug logo banner; do
  logoKey="$(key_of "$logo")"
  bannerKey="$(key_of "$banner")"

  base="$(slugify "${slug:-$name}")"; [ -z "$base" ] && base="loja"
  fname="$base"; n=2
  while [ -n "${used[$fname]:-}" ]; do fname="$base-$n"; n=$((n + 1)); done
  used["$fname"]=1

  logoFile=""
  if [ "$NO_FILES" != "1" ] && [ -n "$logo" ]; then
    ext="${logo%%\?*}"; ext="${ext##*.}"
    printf '%s' "$ext" | grep -qE '^[A-Za-z0-9]{2,5}$' || ext="img"
    if curl -fsS "$logo" -o "$outdir/logos/$fname.$ext"; then
      logoFile="logos/$fname.$ext"; okLogo=$((okLogo + 1))
    else
      falha=$((falha + 1)); logoFile="ERRO"; echo "  ! falha no logo de: $name"
    fi
  elif [ -z "$logo" ]; then
    semLogo=$((semLogo + 1))
  fi

  # CSV (cada campo entre aspas, com escape de aspas internas)
  row=""
  for f in "$id" "$name" "$slug" "$logo" "$logoKey" "$banner" "$bannerKey" "$logoFile"; do
    row="$row,\"$(printf '%s' "$f" | sed 's/"/""/g')\""
  done
  printf '%s\n' "${row#,}" >> "$outdir/manifest.csv"

  # JSON (uma loja por linha; vira array no fim)
  jq -nc \
    --arg id "$id" --arg name "$name" --arg slug "$slug" \
    --arg logo "$logo" --arg logoKey "$logoKey" \
    --arg banner "$banner" --arg bannerKey "$bannerKey" --arg logoFile "$logoFile" \
    '{id:$id,name:$name,slug:$slug,logoImage:$logo,logoKey:$logoKey,bannerImage:$banner,bannerKey:$bannerKey,logoFile:$logoFile}' \
    >> "$outdir/manifest.jsonl"
done < <(jq -r '[.id, .name, (.slug // ""), (.logoImage // ""), (.bannerImage // "")] | @tsv' "$raw")

jq -s '.' "$outdir/manifest.jsonl" > "$outdir/manifest.json" && rm -f "$outdir/manifest.jsonl"

echo "  ----------------------------------------"
echo "  Lojas: $total | logos: $okLogo | sem logo: $semLogo | falha: $falha"
echo "  Manifesto: $outdir/manifest.json (+ .csv)"
echo "  Arquivos:  $outdir/logos"
