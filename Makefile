# CasaShopping - Build Commands
# Uso: make build | make up | make down | make logs

.PHONY: build build-seq up down logs clean rebuild

# Build padrão (paralelo)
build:
	docker compose build

# Build sequencial (um por vez, potência máxima)
build-seq:
	docker compose build db-migration
	docker compose build auth-service
	docker compose build users-service
	docker compose build stores-service
	docker compose build products-service
	docker compose build storage-service
	docker compose build api-gateway
	docker compose build web
	docker compose build admin

# Subir containers
up:
	docker compose up -d

# Derrubar containers
down:
	docker compose down

# Ver logs
logs:
	docker compose logs -f

# Limpar tudo (cuidado!)
clean:
	docker compose down -v --rmi local

# Rebuild completo sem cache
rebuild:
	docker compose build --no-cache
	docker compose up -d
