#!/bin/bash
# Build Script para CasaShopping (Linux/Mac)
# Uso: ./build.sh [--no-cache] [--up]

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Parametros
NO_CACHE=false
UP=false

for arg in "$@"; do
    case $arg in
        --no-cache) NO_CACHE=true ;;
        --up) UP=true ;;
    esac
done

# Ordem otimizada: dependencias primeiro
SERVICES=(
    "db-migration"
    "auth-service"
    "users-service"
    "stores-service"
    "products-service"
    "storage-service"
    "api-gateway"
    "web"
    "admin"
)

echo ""
echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║   CasaShopping - Build Sequencial      ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}"
echo ""

START_TIME=$(date +%s)

FAILED=()
SUCCEEDED=()

for service in "${SERVICES[@]}"; do
    echo ""
    echo -e "${CYAN}=== Building: $service ===${NC}"
    SERVICE_START=$(date +%s)
    
    if $NO_CACHE; then
        CACHE_ARG="--no-cache"
    else
        CACHE_ARG=""
    fi
    
    if docker compose build $CACHE_ARG $service; then
        SERVICE_END=$(date +%s)
        ELAPSED=$((SERVICE_END - SERVICE_START))
        MINS=$((ELAPSED / 60))
        SECS=$((ELAPSED % 60))
        echo -e "${GREEN}[OK] $service concluido em ${MINS}m${SECS}s${NC}"
        SUCCEEDED+=("$service")
    else
        echo -e "${RED}[ERRO] $service falhou${NC}"
        FAILED+=("$service")
    fi
done

END_TIME=$(date +%s)
TOTAL_ELAPSED=$((END_TIME - START_TIME))
TOTAL_MINS=$((TOTAL_ELAPSED / 60))
TOTAL_SECS=$((TOTAL_ELAPSED % 60))

echo ""
echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║           RESUMO DO BUILD              ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "Tempo total: ${TOTAL_MINS}m${TOTAL_SECS}s"
echo -e "Sucesso: ${#SUCCEEDED[@]}/${#SERVICES[@]}"

if [ ${#FAILED[@]} -gt 0 ]; then
    echo -e "${RED}Falharam: ${FAILED[*]}${NC}"
    exit 1
fi

if $UP; then
    echo ""
    echo -e "${CYAN}=== Iniciando containers... ===${NC}"
    docker compose up -d
fi

echo ""
echo -e "${GREEN}[OK] Build concluido com sucesso!${NC}"
echo ""
