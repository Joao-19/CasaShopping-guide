#!/usr/bin/env bash
# =============================================================================
#  RESTORE DE IMAGENS — lojas + produtos — casashopping-guide (curl + jq)
# =============================================================================
#  Reenvia CADA arquivo salvo pelo backup-images.sh de volta pra sua key
#  EXATA no storage. O caminho relativo a objects/ JÁ É a key -> não há
#  remontagem de nome, não há adivinhação.
#
#  SEGURANÇA:
#    - SÓ FAZ PUT (upload). NUNCA deleta, nunca mexe no banco.
#    - Idempotente: reenviar os mesmos bytes pra mesma key é inócuo.
#    - Confere que o presign devolveu EXATAMENTE a key esperada; se o
#      backend devolver key diferente (ex.: se um dia gerar sufixo único
#      no servidor), ABORTA aquele arquivo em vez de gravar no lugar errado.
#    - DRY-RUN por padrão: mostra o que faria. Só grava com CONFIRM=1.
#
#  Requisitos:  curl  jq
#  Uso:
#    # 1) ver o que seria restaurado (não grava nada):
#    ADMIN_TOKEN=xxx bash scripts/restore-images.sh
#    # 2) restaurar de fato:
#    ADMIN_TOKEN=xxx CONFIRM=1 bash scripts/restore-images.sh
#
#  ADMIN_TOKEN: access_token de um admin logado (DevTools > Application >
#               Cookies, ou o valor do cookie access_token). Necessário
#               pro endpoint de presign aceitar o upload.
#
#  Env opcionais:
#    SNAPSHOT=/caminho/2026-..._....  qual snapshot usar (default: o + recente
#                                     em ./backup-imagens)
#    RESTORE_API_BASE=...             API (default prod pública)
#    ONLY_MISSING=1                   só restaura keys que estão 404 no storage
#                                     agora (recupera só o que sumiu; mais seguro)
# =============================================================================
set -uo pipefail

API_BASE="${RESTORE_API_BASE:-https://guiadecompras.casashopping.com/api}"
STORAGE_BASE="${RESTORE_STORAGE_BASE:-https://storage.casashopping.com/casashopping}"
ROOT="${BACKUP_DIR:-./backup-imagens}"
CONFIRM="${CONFIRM:-0}"
ONLY_MISSING="${ONLY_MISSING:-0}"
TOKEN="${ADMIN_TOKEN:-}"

for c in curl jq; do
  command -v "$c" >/dev/null 2>&1 || {
    echo "ERRO: falta '$c'. Instale:  sudo apt install -y curl jq"; exit 1; }
done

# Descobre o snapshot (o mais recente, se não informado)
SNAP="${SNAPSHOT:-}"
if [ -z "$SNAP" ]; then
  SNAP="$(ls -d "$ROOT"/*/ 2>/dev/null | sort | tail -n1)"
  SNAP="${SNAP%/}"
fi
[ -n "$SNAP" ] && [ -d "$SNAP/objects" ] || {
  echo "ERRO: snapshot inválido. Rode o backup antes, ou informe SNAPSHOT=..."; exit 1; }

echo "  Snapshot -> $SNAP"
echo "  API      -> $API_BASE"
[ "$CONFIRM" = "1" ] && echo "  MODO     -> GRAVANDO (CONFIRM=1)" \
                     || echo "  MODO     -> DRY-RUN (não grava; use CONFIRM=1 pra valer)"
[ "$ONLY_MISSING" = "1" ] && echo "  FILTRO   -> só keys ausentes no storage agora"

if [ "$CONFIRM" = "1" ] && [ -z "$TOKEN" ]; then
  echo "ERRO: CONFIRM=1 exige ADMIN_TOKEN (token de admin logado)."; exit 1
fi

# ext -> content-type (o PUT precisa bater com o ContentType que o presign assinou)
ctype_of() {
  case "${1,,}" in
    *.webp) echo image/webp ;; *.png) echo image/png ;;
    *.jpg|*.jpeg) echo image/jpeg ;; *.gif) echo image/gif ;;
    *.mp4) echo video/mp4 ;; *.webm) echo video/webm ;;
    *) echo application/octet-stream ;;
  esac
}

total=0; done_ok=0; skipped=0; failed=0

# Percorre todos os arquivos em objects/ ; a key = caminho relativo a objects/
while IFS= read -r file; do
  total=$((total+1))
  key="${file#"$SNAP"/objects/}"
  ctype="$(ctype_of "$key")"
  clen="$(wc -c < "$file" | tr -d ' ')"

  if [ "$ONLY_MISSING" = "1" ]; then
    if curl -fsI "$STORAGE_BASE/$key" >/dev/null 2>&1; then
      skipped=$((skipped+1)); continue          # já existe no storage; não mexe
    fi
  fi

  if [ "$CONFIRM" != "1" ]; then
    echo "  [dry] $key  (${clen}B, $ctype)"; continue
  fi

  folder="$(dirname "$key")"; [ "$folder" = "." ] && folder=""
  filename="$(basename "$key")"

  # 1) pega presign; folder+filename reconstroem a MESMA key
  resp="$(curl -fsS -X POST "$API_BASE/storage/upload-url" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      --data "$(jq -nc --arg folder "$folder" --arg filename "$filename" \
                       --arg ct "$ctype" --argjson cl "$clen" \
                 '{folder:$folder,filename:$filename,contentType:$ct,contentLength:$cl}')")" || {
    echo "  ! presign falhou: $key"; failed=$((failed+1)); continue; }

  url="$(jq -r '.url // empty' <<<"$resp")"
  gotkey="$(jq -r '.key // empty' <<<"$resp")"
  if [ -z "$url" ]; then echo "  ! sem url no presign: $key"; failed=$((failed+1)); continue; fi
  # trava de segurança: a key devolvida TEM que ser a esperada
  if [ "$gotkey" != "$key" ]; then
    echo "  ! key divergente (esperado '$key', veio '$gotkey') — PULANDO por segurança"
    failed=$((failed+1)); continue
  fi

  # 2) PUT dos bytes
  if curl -fsS -X PUT "$url" -H "Content-Type: $ctype" --data-binary "@$file" >/dev/null; then
    echo "  ok  $key"; done_ok=$((done_ok+1))
  else
    echo "  ! upload falhou: $key"; failed=$((failed+1))
  fi
done < <(find "$SNAP/objects" -type f | sort)

echo "  ----------------------------------------"
if [ "$CONFIRM" != "1" ]; then
  echo "  DRY-RUN: $total arquivo(s) seriam restaurados. Rode com CONFIRM=1 pra gravar."
else
  echo "  Restaurados: $done_ok | pulados: $skipped | falha: $failed  (de $total)"
  [ "$failed" -gt 0 ] && echo "  ATENÇÃO: $failed falha(s) — ver linhas '!' acima." >&2
fi
