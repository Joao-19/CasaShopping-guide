#!/bin/bash

# Cores para o terminal
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Iniciando sincronização de bancos de dados...${NC}"

# Lista de containers que precisam de migration (nomes definidos no docker-compose)
SERVICES=("casashopping-auth" "casashopping-users" "casashopping-gateway")

for SERVICE in "${SERVICES[@]}"
do
    echo -e "${YELLOW}Verificando $SERVICE...${NC}"
    
    # Verifica se o container está rodando
    if [ "$(docker ps -q -f name=$SERVICE)" ]; then
        echo -e "${GREEN}Container ativo. Rodando migrations...${NC}"
        
        # Executa a migration (Ajuste para seu ORM: prisma, typeorm, etc)
        # Exemplo com Prisma:
        docker exec $SERVICE npx prisma migrate deploy
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✅ $SERVICE sincronizado com sucesso!${NC}"
        else
            echo -e "${RED}❌ Falha ao sincronizar $SERVICE.${NC}"
        fi
    else
        echo -e "${RED}⚠️ Container $SERVICE não está rodando. Pulando...${NC}"
    fi
    echo "------------------------------------"
done

echo -e "${GREEN}Processo finalizado!${NC}"