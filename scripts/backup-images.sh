#!/usr/bin/env bash
# =============================================================================
#  BACKUP COMPLETO DE IMAGENS — lojas (logo + banner) + produtos
#  casashopping-guide — nativo Ubuntu (curl + jq)
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
#  Requisitos:  curl  jq   (sudo apt install -y curl jq)
#  Rodar:       bash scripts/backup-images.sh
#
#  Env opcionais:
#    BACKUP_DIR=/caminho     onde salvar          (default ./backup-imagens)
#    BACKUP_API_BASE=...     origem da API        (default prod pública)
#    BACKUP_STORAGE_BASE=... base pública storage (default prod pública)
#    BACKUP_NO_FILES=1       só manifestos, sem baixar binários
# =============================================================================
set -uo pipefail

API_BASE="${BACKUP_API_BASE:-https://guiadecompras.casashopping.com/api}"
STORAGE_BASE="${BACKUP_STORAGE_BASE:-https://storage.casashopping.com/casashopping}"
OUT_ROOT="${BACKUP_DIR:-./backup-imagens}"
NO_FILES="${BACKUP_NO_FILES:-0}"

for c in curl jq; do
  command -v "$c" >/dev/null 2>&1 || {
    echo "ERRO: falta '$c'. Instale:  sudo apt install -y curl jq"; exit 1; }
done

stamp="$(date +%Y-%m-%d_%H%M%S)"
outdir="$OUT_ROOT/$stamp"
mkdir -p "$outdir/objects"
echo "  Backup  -> $outdir"
echo "  API     -> $API_BASE"
echo "  Storage -> $STORAGE_BASE"

# URL absoluta do NOSSO storage -> key relativa. URL de outro host -> vazio.
key_of() {
  case "$1" in
    "$STORAGE_BASE"/*) printf '%s' "${1#"$STORAGE_BASE"/}" ;;
    http*)             printf '' ;;
    "")                printf '' ;;
    *)                 printf '%s' "${1#/}" ;;
  esac
}

# Baixa a key pra objects/<key> (idempotente: pula se já existe). Ecoa status.
declare -A saved
dl_ok=0; dl_skip=0; dl_fail=0
fetch_key() {
  local key="$1"
  [ -z "$key" ] && return 0
  [ "$NO_FILES" = "1" ] && return 0
  [ -n "${saved[$key]:-}" ] && return 0          # dedup dentro do snapshot
  local dest="$outdir/objects/$key"
  if [ -s "$dest" ]; then saved[$key]=1; dl_skip=$((dl_skip+1)); return 0; fi
  mkdir -p "$(dirname "$dest")"
  if curl -fsS "$STORAGE_BASE/$key" -o "$dest"; then
    saved[$key]=1; dl_ok=$((dl_ok+1))
  else
    rm -f "$dest"; dl_fail=$((dl_fail+1)); echo "  ! falha baixando: $key"
  fi
}

# Paginador genérico: baixa todas as páginas de um endpoint e concatena .data[]
fetch_all() {  # $1 = path com querystring inicial (sem page)
  local path="$1" raw page=1 resp last cnt sep
  raw="$(mktemp)"
  case "$path" in *\?*) sep='&' ;; *) sep='?' ;; esac
  while : ; do
    resp="$(curl -fsS "$API_BASE/$path${sep}page=$page")" || {
      echo "  ERRO ao buscar $path (página $page)" >&2; rm -f "$raw"; return 1; }
    printf '%s' "$resp" | jq -c '.data[]' >> "$raw"
    last="$(printf '%s' "$resp" | jq -r '.meta.lastPage // 1')"
    cnt="$(printf '%s' "$resp" | jq -r '.data | length')"
    { [ "$page" -ge "$last" ] || [ "$cnt" -eq 0 ]; } && break
    page=$((page + 1))
  done
  printf '%s' "$raw"
}

# ---------------------------------------------------------------- LOJAS -------
echo "  --- lojas ---"
stores_raw="$(fetch_all "stores?limit=100")" || exit 1
: > "$outdir/manifest-stores.jsonl"
nstores=0
while IFS=$'\t' read -r id name slug logo banner; do
  nstores=$((nstores+1))
  logoKey="$(key_of "$logo")"; bannerKey="$(key_of "$banner")"
  fetch_key "$logoKey"; fetch_key "$bannerKey"
  jq -nc --arg id "$id" --arg name "$name" --arg slug "$slug" \
     --arg logo "$logo" --arg logoKey "$logoKey" \
     --arg banner "$banner" --arg bannerKey "$bannerKey" \
     '{id:$id,name:$name,slug:$slug,logoImage:$logo,logoKey:$logoKey,bannerImage:$banner,bannerKey:$bannerKey}' \
     >> "$outdir/manifest-stores.jsonl"
done < <(jq -r '[.id,.name,(.slug//""),(.logoImage//""),(.bannerImage//"")]|@tsv' "$stores_raw")
jq -s '.' "$outdir/manifest-stores.jsonl" > "$outdir/manifest-stores.json"
rm -f "$outdir/manifest-stores.jsonl" "$stores_raw"
echo "  $nstores loja(s)."

# ------------------------------------------------------------- PRODUTOS -------
echo "  --- produtos ---"
prod_raw="$(fetch_all "products")" || exit 1
: > "$outdir/manifest-products.jsonl"
nprod=0; nimg=0
while IFS= read -r prow; do
  nprod=$((nprod+1))
  # keys das imagens deste produto (converte cada path absoluto -> key)
  keys="$(jq -r '.images[]?.path // empty' <<<"$prow")"
  keyarr=()
  while IFS= read -r p; do
    [ -z "$p" ] && continue
    k="$(key_of "$p")"; [ -z "$k" ] && continue
    keyarr+=("$k"); nimg=$((nimg+1)); fetch_key "$k"
  done <<< "$keys"
  keysjson="$(printf '%s\n' "${keyarr[@]:-}" | jq -R . | jq -s 'map(select(length>0))')"
  jq -nc --arg id "$(jq -r '.id' <<<"$prow")" \
         --arg name "$(jq -r '.name' <<<"$prow")" \
         --arg storeId "$(jq -r '.storeId // .store.id // ""' <<<"$prow")" \
         --argjson keys "$keysjson" \
     '{id:$id,name:$name,storeId:$storeId,imageKeys:$keys}' \
     >> "$outdir/manifest-products.jsonl"
done < <(jq -c '.' "$prod_raw")
jq -s '.' "$outdir/manifest-products.jsonl" > "$outdir/manifest-products.json"
rm -f "$outdir/manifest-products.jsonl" "$prod_raw"
echo "  $nprod produto(s), $nimg imagem(ns) referenciada(s)."

# ------------------------------------------------------------- RESUMO ---------
jq -nc --arg api "$API_BASE" --arg storage "$STORAGE_BASE" --arg stamp "$stamp" \
   --argjson stores "$nstores" --argjson products "$nprod" \
   --argjson objDown "$dl_ok" --argjson objSkip "$dl_skip" --argjson objFail "$dl_fail" \
   '{createdAt:$stamp,apiBase:$api,storageBase:$storage,stores:$stores,products:$products,
     objects:{downloaded:$objDown,skipped:$objSkip,failed:$objFail}}' \
   | jq '.' > "$outdir/manifest.json"

echo "  ----------------------------------------"
echo "  Lojas: $nstores | Produtos: $nprod"
echo "  Objetos: baixados $dl_ok | já existiam $dl_skip | falha $dl_fail"
echo "  Snapshot: $outdir"
[ "$dl_fail" -gt 0 ] && echo "  ATENÇÃO: $dl_fail arquivo(s) falharam (ver linhas '!' acima)." >&2
echo "  Restore:  bash scripts/restore-images.sh"
