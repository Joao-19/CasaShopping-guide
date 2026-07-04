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

### Scripts (python3 puro — nativo no Ubuntu, SEM jq/curl/pip/apt)

O servidor é do cliente; não dá pra instalar pacote. Por isso os scripts usam
só a stdlib do `python3` (já presente em qualquer EC2 Ubuntu).

- `scripts/backup-images.py` — **100% só leitura**. GET nas rotas públicas
  (`/stores`, `/products`) + download das imagens por URL pública. Salva:
  - `objects/<key>` → os bytes, **no mesmo caminho da key** do storage
    (o caminho relativo A `objects/` **é** a key → restore exato).
  - `manifest-stores.json`, `manifest-products.json`, `manifest.json` (resumo).
  - Sem credencial, sem escrita em prod, sem deleção.
- `scripts/restore-images.py` — **só PUT**, nunca deleta, nunca toca no banco.
  - DRY-RUN por padrão; grava só com `CONFIRM=1`.
  - Reenvia cada arquivo pra key EXATA via o mesmo presign do app; **aborta**
    o arquivo se o backend devolver key diferente (trava de segurança).
  - `ONLY_MISSING=1` restaura só o que está 404 agora (recupera só o que
    sumiu, sem sobrescrever o que está são).

### Comandos

```bash
# BACKUP (rode antes de tudo; guarde a pasta ./backup-imagens)
python3 scripts/backup-images.py

# RESTORE — passo 1: ver o que faria (não grava)
ADMIN_TOKEN=<token_admin> python3 scripts/restore-images.py
# RESTORE — passo 2: recuperar só o que sumiu (mais seguro)
ADMIN_TOKEN=<token_admin> ONLY_MISSING=1 CONFIRM=1 python3 scripts/restore-images.py
# RESTORE — restaurar tudo (força todos os bytes de volta)
ADMIN_TOKEN=<token_admin> CONFIRM=1 python3 scripts/restore-images.py
```

`ADMIN_TOKEN` = cookie `access_token` de um admin logado.

### Validação (feita em 2026-07-03, contra prod)
- [x] `backup-images.py` rodou contra prod: 108 lojas, 81 produtos, **188 keys
      únicas**, falha 0, ~27 MB.
- [x] `restore-images.py` em DRY-RUN listou os arquivos.
- [x] Guarda de integridade: aborta (exit 2) se o FS fundir keys.
- [ ] **Rodar o backup autoritativo no servidor Linux** (não no Windows — ver
      gotcha de case-sensitivity). Esperado: 188 arquivos, falha 0.
- [ ] Teste de fumaça: restaurar UMA key conhecida com `CONFIRM=1` e conferir
      no navegador. Só depois seguir pra Parte 2.

> **Achado #1 confirmado em dados reais:** loja *Studio do Sono* tem a logo em
> `stores/56a44c97.../studio-do-sono.webp` e um produto com imagem em
> `stores/56a44c97.../Studio-do-Sono.webp` — mesma pasta, diferindo só na caixa.
> No MinIO (Linux) coexistem; se a caixa batesse igual, a imagem do produto teria
> sobrescrito a logo. É a brecha #1 quase disparada. Reforça a urgência da 2.1.

---

## PARTE 2 — Reparos (minuciosa e cautelosa) — PLANEJADA

**Regra de ouro:** nenhum passo começa sem o backup da Parte 1 validado.
Ordem do menor risco pro maior. Cada item vira commit atômico em `dev`.

### 2.1 — Key única no upload (fecha o achado #1) — risco baixo — ✅ CÓDIGO FEITO
- Espelhar o padrão que a web já usa: `useImageUpload.ts` (admin) passa a
  gerar filename único (`{uuid}-{nome}.webp`) para produto, logo e banner.
- Sem mudança de contrato, sem migration. Restore continua exato (usa a key
  gravada no manifesto, não gera uuid).
- **Status:** feito em `dev` (`a86cf2a`), `tsc --noEmit` verde. `key.match(/stores\/.*$/)`
  no CreateProductForm continua ok com o prefixo.
- **Falta:** validar upload real na UI (subir imagem de produto com mesmo nome
  de arquivo da logo NÃO altera nem apaga a logo). Fazer antes de considerar pronto.

### 2.2 — Lost-update em edição concorrente (achado #2a) — ✅ CÓDIGO FEITO (leve)
**Decisão:** abordagem Leve (frontend). Feito em `dev` (`5327421`), tsc verde.
- Loja: `logoImage`/`bannerImage` só entram no payload com novo upload ou remoção.
- Produto: `images` só é reenviado quando muda (upload/remoção/reordenação).
- **Falta:** validar na UI (edição concorrente não apaga imagem do outro).

O vetor de perda de imagem existe em loja E produto: o save "velho" reenvia a
lista/URL antiga e o backend deleta o arquivo que o outro admin acabou de subir.
Duas abordagens (perguntado ao usuário, sem resposta ainda):
- **Leve (frontend, recomendada):** front só envia `logoImage`/`bannerImage`/
  imagens quando REALMENTE mudaram (novo upload ou remoção). Um "salvar telefone"
  omite as imagens → backend não deleta nada. Fecha o vetor de perda de imagem.
  Baixo risco, sem backend/dtos/migration. Não protege campos de texto contra
  last-write-wins (aceitável — o incidente é imagem).
- **Robusto (optimistic concurrency):** `modifiedAt`/version no update → 409 +
  reload no front. Protege TODOS os campos. Cross-service (dtos+backend+front),
  mais escopo/risco.
- **Aceite (leve):** com um form aberto e a imagem trocada por outro caminho, um
  save que não mexe na imagem NÃO apaga o arquivo do outro (validar na UI).
- **Nota técnica (leve):** em store.update, omitir `logoImage` deixa
  `updateData.logoImage === undefined` → bloco de deleção não roda (já é o
  comportamento atual). Em produto, o form hoje reconstrói `images` sempre;
  precisa passar a só reenviar quando houver mudança real.

### 2.3 — Constraints no banco (fecha o achado #2b) — risco: migration
- Migration idempotente: `@@unique([storeId, name])` em Product e unicidade de
  `name` em Store (avaliar case-insensitive).
- **Pré-requisito — ✅ VERIFICADO (2026-07-03):** varredura de duplicatas via
  manifest do backup: 108 lojas, 81 produtos, **0 duplicatas** (case-insensitive).
  Banco limpo → constraints seguras de adicionar.
- **Rodar contra produção:** só com OK explícito do cliente (regra de área
  sensível). Testar local + `prisma migrate status` antes.

### Sequência segura
1. Backup validado (Parte 1). ← trava de segurança
2. 2.1 em `dev` → validar UI → deploy.
3. 2.2 em `dev` → validar UI → deploy.
4. 2.3: checar duplicatas → migration local → **OK do cliente** → prod.

---

## Gotchas / decisões
- **Backup só é confiável em FS case-sensitive (Linux).** Keys no mesmo folder
  podem diferir só na caixa (ex.: `studio-do-sono.webp` × `Studio-do-Sono.webp`).
  Windows/macOS fundem as duas num arquivo → snapshot incompleto. O script tem
  guarda que aborta (exit 2) nesse caso. Rodar no EC2 (`python3 scripts/backup-images.py`).
- Restore usa presign (não credencial S3) — casa com o stack e roda de qualquer
  máquina; precisa só de um token de admin.
- Endpoint `/storage/upload-url` está com o guard comentado
  (`storage.controller.ts:10`) — funciona sem token, mas o restore **exige**
  token mesmo assim (à prova de futuro se o guard voltar). Reativar o guard é
  candidato a item futuro (fora do escopo deste incidente).
- Não reconciliar logo pelo conteúdo do bucket (regra já registrada no
  incidente jul/2026): a fonte da verdade é o manifesto do backup + o `logoImage`
  do banco, nunca “o que sobrou no bucket”.
