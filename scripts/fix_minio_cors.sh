#!/bin/bash
# Script para corrigir permissões e CORS do MinIO
# Execute este script no servidor onde o Docker está rodando

echo "Configurando MinIO..."

# Executa um container temporário do MinIO Client (mc) para configurar o servidor
docker run --rm --network casashopping-net --entrypoint /bin/sh minio/mc -c "
echo 'Connecting to MinIO...'
# Configura o alias (myminio) apontando para o container do storage
mc alias set myminio http://casashopping-storage:9000 admin password123

echo 'Setting policy to public...'
# Define o bucket como público
mc anonymous set public myminio/casashopping

echo 'Configuring CORS...'
# Define as regras de CORS permitindo tudo (*)
mc cors set myminio/casashopping <(echo '
[
  {
    \"AllowedHeaders\": [\"*\"],
    \"AllowedMethods\": [\"PUT\", \"POST\", \"DELETE\", \"GET\"],
    \"AllowedOrigins\": [\"*\"],
    \"ExposeHeaders\": [\"ETag\"]
  }
]
')

echo 'MinIO configuration completed successfully!'
"
