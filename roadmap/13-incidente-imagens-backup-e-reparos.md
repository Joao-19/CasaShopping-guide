# 13 — Incidente de imagens: backup de prevenção + reparos

**Status:** Parte 1 (backup) entregue; Parte 2 (reparos) planejada, aguardando
backup validado.
**Origem:** auditoria pedida pelo cliente após sumiço de logos de loja
(jul/2026). O fix anterior (`toStorageKey`, eixo URL absoluta × key relativa)
fechou UMA porta; a auditoria achou outras ainda abertas.

---

## Diagnóstico (o que a auditoria encontrou)

| # | Achado | Sev. | Mecanismo |
|---|--------|------|-----------|
| 1 | **Key de storage não-única** — imagem de produto e logo/banner da loja compartilham o namespace `stores/{storeId}/{arquivo}`. Upload/edição/remoção de uma sobrescreve ou **apaga** a outra. | Alta | `storage.service.ts:334` monta `key = folder/filename` com o **nome do arquivo** enviado, sem uuid. `useImageUpload.ts` (admin) só sanitiza o nome. Já `useProfileImageUpload.ts` (web) usa `profile_{userId}_{ts}.webp` — key única. |
| 2a | **Lost-update reintroduz a perda de logo** — duas pessoas na MESMA conta de admin editando a mesma loja: o save “velho” de uma reverte o `logoImage` e o `store.update` **deleta o arquivo novo** da outra. | Alta | `store.service.ts:324-340` deleta o arquivo antigo quando a key muda; sem guarda de concorrência (`modifiedAt`/versão). Form envia sempre o objeto inteiro (`CreateStoreForm.tsx:412`). |
| 2b | **Corrida de duplicata** — unicidade de nome de loja e de `(storeId, name)` de produto só em nível de app (`findFirst`→`create`, não-atômico). Sem constraint no banco. | Média | `product.service.ts:31-46`, `store.service.ts:26-37`. Schema só tem `@unique` em `slug`, não em `name`/`(storeId,name)`. |

Efeito colateral relevante: o `StoreLogo` com fallback pra iniciais (commit
`ed4e14b`) **mascara** a perda — a logo some do bucket mas a UI não “quebra”,
então o dano passa despercebido.

---

## PARTE 1 — Backup de prevenção (ENTREGUE)

Objetivo: antes de qualquer reparo, garantir que **todo** byte de imagem
(logo, banner, produto) esteja salvo e restaurável com **um** comando.

### Scripts

- `scripts/backup-images.sh` — **100% só leitura**. GET nas rotas públicas
  (`/stores`, `/products`) + download das imagens por URL pública. Salva:
  - `objects/<key>` → os bytes, **no mesmo caminho da key** do storage
    (o caminho relativo A `objects/` **é** a key → restore exato).
  - `manifest-stores.json`, `manifest-products.json`, `manifest.json` (resumo).
  - Sem credencial, sem escrita em prod, sem deleção.
- `scripts/restore-images.sh` — **só PUT**, nunca deleta, nunca toca no banco.
  - DRY-RUN por padrão; grava só com `CONFIRM=1`.
  - Reenvia cada arquivo pra key EXATA via o mesmo presign do app; **aborta**
    o arquivo se o backend devolver key diferente (trava de segurança).
  - `ONLY_MISSING=1` restaura só o que está 404 agora (recupera só o que
    sumiu, sem sobrescrever o que está são).

### Comandos

```bash
# BACKUP (rode antes de tudo; guarde a pasta ./backup-imagens)
bash scripts/backup-images.sh

# RESTORE — passo 1: ver o que faria (não grava)
ADMIN_TOKEN=<token_admin> bash scripts/restore-images.sh
# RESTORE — passo 2: recuperar só o que sumiu (mais seguro)
ADMIN_TOKEN=<token_admin> ONLY_MISSING=1 CONFIRM=1 bash scripts/restore-images.sh
# RESTORE — restaurar tudo (força todos os bytes de volta)
ADMIN_TOKEN=<token_admin> CONFIRM=1 bash scripts/restore-images.sh
```

`ADMIN_TOKEN` = cookie `access_token` de um admin logado.

### Critério de aceite da Parte 1
- [ ] `backup-images.sh` roda em prod e baixa lojas + produtos sem falha
      (`objects: falha 0`).
- [ ] `restore-images.sh` em DRY-RUN lista os mesmos arquivos.
- [ ] Teste de fumaça: restaurar UMA key conhecida com `CONFIRM=1` e conferir
      no navegador. Só depois seguir pra Parte 2.

---

## PARTE 2 — Reparos (minuciosa e cautelosa) — PLANEJADA

**Regra de ouro:** nenhum passo começa sem o backup da Parte 1 validado.
Ordem do menor risco pro maior. Cada item vira commit atômico em `dev`.

### 2.1 — Key única no upload (fecha o achado #1) — risco baixo
- Espelhar o padrão que a web já usa: `useImageUpload.ts` (admin) passa a
  gerar filename único (`{uuid}-{nome}.webp`) para produto, logo e banner.
- Sem mudança de contrato, sem migration. Restore continua exato (usa a key
  gravada no manifesto, não gera uuid).
- **Aceite:** subir imagem de produto com mesmo nome de arquivo da logo NÃO
  altera nem apaga a logo (validar na UI com Playwright).

### 2.2 — Guarda de concorrência no update (fecha o achado #2a) — risco médio
- `store.update` (e `product.update`): comparar `modifiedAt`/`updatedAt`
  recebido com o do banco; se divergir, responder **409** em vez de gravar por
  cima. Front trata o 409 pedindo recarregar.
- Alternativa/complemento: front não reenviar `logoImage`/`bannerImage` quando
  não houve troca real.
- **Aceite:** dois saves concorrentes na mesma loja — o segundo (stale) é
  rejeitado com 409; a logo do primeiro permanece no bucket.

### 2.3 — Constraints no banco (fecha o achado #2b) — risco: migration
- Migration idempotente: `@@unique([storeId, name])` em Product e unicidade de
  `name` em Store (avaliar case-insensitive).
- **Pré-requisito obrigatório:** varrer duplicatas existentes ANTES (a
  constraint falha se já houver duplicata). Script de checagem read-only
  primeiro; só criar a migration com o banco limpo.
- **Rodar contra produção:** só com OK explícito do cliente (regra de área
  sensível). Testar local + `prisma migrate status` antes.

### Sequência segura
1. Backup validado (Parte 1). ← trava de segurança
2. 2.1 em `dev` → validar UI → deploy.
3. 2.2 em `dev` → validar UI → deploy.
4. 2.3: checar duplicatas → migration local → **OK do cliente** → prod.

---

## Gotchas / decisões
- Restore usa presign (não credencial S3) — casa com o stack e roda de qualquer
  máquina; precisa só de um token de admin.
- Endpoint `/storage/upload-url` está com o guard comentado
  (`storage.controller.ts:10`) — funciona sem token, mas o restore **exige**
  token mesmo assim (à prova de futuro se o guard voltar). Reativar o guard é
  candidato a item futuro (fora do escopo deste incidente).
- Não reconciliar logo pelo conteúdo do bucket (regra já registrada no
  incidente jul/2026): a fonte da verdade é o manifesto do backup + o `logoImage`
  do banco, nunca “o que sobrou no bucket”.
