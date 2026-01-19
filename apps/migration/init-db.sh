#!/bin/sh
echo "Aguardando Banco de Dados..."
# Loop simples esperando a porta 5432 (poderia usar wait-for-it, mas sleep resolve para MVP)
sleep 10

# Usando 'migrate deploy' para garantir consistência com o histórico de migrations.
# Isso é o correto para produção/testes integrados.
npx prisma migrate deploy --schema=./prisma/schema.prisma

echo "Banco de dados sincronizado."
