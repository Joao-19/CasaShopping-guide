# 10 — Infra: Portainer (escravo) + Nginx separado + Manutenção

> Frente de **infraestrutura/deploy**. Continuação do cutover pra GHCR e do
> Portainer-agent+VPN já feitos. Objetivo: gerenciar a prod **100% via Portainer
> (Git)**, com o **nginx em stack própria** (estratégica), **tela de manutenção**
> e as pendências operacionais/segurança amarradas.
> Criado em 2026-06-26.

## Estado atual (base desta frente)

Já concluído (ver memória do projeto e commits):
- Prod em **GHCR `:prod`** (Actions builda em push na `main`/`dev-deploy`); deploy manual.
- **Watchtower removido** (revertia prod pro build antigo).
- **nginx com `resolver` dinâmico** (não cai mais em recriação de container).
- **DB + MinIO** preservados (volumes `external` `casashopping-guide_*`).
- **Portainer-agent (escravo) + Tailscale (VPN)** conectado; device approval ligado;
  key antiga revogada; nó morto removido; ACL aplicada.

## Sumário das frentes

| # | Item | Prioridade | Risco | Bloqueio |
|---|------|-----------|-------|----------|
| F1 | Nginx em **compose separado** (stack própria, estratégica) | Alta | Médio (borda/SSL) | decisão de SSL (host mount vs env) |
| F2 | **Levar o projeto** (app stack) pro Portainer via Git | Alta | Médio (.env/bind mounts) | depende de F1 |
| F3 | **Tela de manutenção** no `default.conf` do nginx | Média | Baixo | depende de F1 |
| F4 | ✅ **FEITO** — isolamento da ACL (cliente ⊥ minha infra) provado | Alta (seg.) | — | concluído 2026-06-26 |
| F5 | Limpeza de disco (image/builder prune) | Média | Baixo | — |
| F6 | Portainer mestre via **MagicDNS** (não IP) | Baixa | Baixo | — |
| F7 | **Watchdog** agent↔tailscale (reata sozinho) | Baixa | Baixo | — |
| F8 | Remover `deploy.yml` dormente (Docker Hub/`main1`) | Baixa | Baixo | — |
| F9 | Migração **MinIO → R2** (Cloudflare) | Futuro | Médio | decisão + janela |

---

## F1 — Nginx em compose separado (estratégico)

**Objetivo:** tirar o `nginx-proxy` do `docker-compose.yml` (app) e colocá-lo numa
stack própria (`docker-compose.nginx.yml`), gerenciada via Portainer/Git,
independente do app.

**Por que (estratégia):**
- Redeploy do app **não toca na borda** (proxy não reinicia → zero risco de queda
  de borda a cada deploy de app).
- O proxy pode evoluir sozinho (manutenção, futura central multi-app, crowdsec)
  sem mexer no app — alinhado ao padrão `WePlanner-Infra`.
- Já está pronto pra isso: nginx fala com os apps por **service name na rede
  externa `web-proxy`** + `resolver` dinâmico.

**Tarefas:**
1. Criar `docker-compose.nginx.yml` com só o serviço `nginx-proxy`
   (80/443, `web-proxy` external, mount do `default.conf` e dos certs).
2. Remover o `nginx-proxy` (e o `depends_on`) do `docker-compose.yml` do app
   — `depends_on` cross-stack não existe; o `resolver` já tolera upstream fora do ar.
3. Subir como stack própria no Portainer (Git), projeto separado do app.

**Decisão pendente — SSL:**
- **Opção A (simples, recomendada p/ 1ª etapa):** manter bind-mount do host
  `/etc/nginx/ssl/cloudflare` (como hoje).
- **Opção B (estratégica, padrão WePlanner):** imagem custom do nginx no GHCR +
  certs via env (`NGINX_SSL_CERT_PEM`/`KEY_PEM`), entrypoint grava em runtime →
  **nada de cert no disco**, tudo via Portainer. Mais trabalho, mais portável.

**DoD:** app e nginx em stacks separadas; deploy do app não recria o nginx;
HTTPS intacto; rotas `/`, `/admin/`, `/api/` 200.

---

## F2 — Levar o projeto (app stack) pro Portainer via Git

**Objetivo:** a stack do app (sem nginx, após F1) gerenciada como **Portainer
Stack via Git**, redeploy por "Pull and redeploy".

**Tarefas:**
1. App stack = `docker-compose.yml` (GHCR `:prod`, volumes `external`, sem nginx).
2. Resolver **`.env` no Portainer-Git** (gotcha real): hoje há bind-mount
   `./.env:/app/.env` + interpolação `${VAR}`. No stack Git o working dir é o
   repo clonado, e o `.env` **não está no Git** (gitignored) → o mount montaria
   vazio. **Plano:** usar as *Environment variables* da stack no Portainer
   (cobre o `${VAR}`) e **auditar serviço a serviço** se o mount `/app/.env`
   é realmente necessário (a maioria lê `process.env`) — remover o mount onde
   for redundante.
3. Validar pela UI (login admin, produtos, upload de imagem).

**Risco:** `.env`/bind-mount mal resolvido → serviço sobe sem variável. Mitigar
com o passo 2 + teste pós-deploy.

**DoD:** redeploy do app inteiro pelo Portainer (Git) sem SSH; dados intactos;
fluxo real validado na UI.

---

## F3 — Tela de manutenção no nginx

**Objetivo:** servir `portainer/manutencao.html` (já existe) quando o app estiver
fora **e** sob demanda (manutenção planejada).

**Tarefas:**
1. Montar `manutencao.html` (+ imagem de fundo) em `/usr/share/nginx/maintenance/`
   no container do nginx.
2. No `default.conf`: `error_page 502 503 504 @maintenance;` + `location
   @maintenance { root ...; rewrite ^.*$ /manutencao.html break; }` → cai
   automático quando o upstream está fora.
3. (Opcional) **Toggle manual** por flag file (padrão WePlanner):
   `if (-f /usr/share/nginx/maintenance/on) { return 503; }` — liga/desliga
   manutenção planejada com `touch`/`rm` sem reload.

**Obs:** o `portainer/README.md` já descreve esse setup; o `WePlanner-Infra/nginx`
tem um `maintenance-casashopping.html` de referência.

**DoD:** app fora → usuário vê página de manutenção (HTTP 503), não 502 cru;
toggle manual funciona.

---

## F4 — Isolamento da ACL (segurança) ✅ FEITO (2026-06-26)

**Objetivo:** provar que o servidor do cliente (`casashopping-prod`) não
alcança a infra do dono (`home`, `weplanner-*`).

**Como ficou:**
- `casashopping-prod-1` taggeado `tag:casashopping` (não é member, sem regra de
  `src` → não inicia conexão com ninguém).
- Portainer mestre (`home`, 100.78.223.35) liberado **por IP/host alias** na ACL,
  independente de tag → não trava mesmo se a máquina estiver taggeada.
- ACL com bloco `tests` → o Tailscale **recusa salvar** se trancaria/não isolasse
  (rede de segurança anti-lockout).

**⚠️ ARMADILHA do teste (aprendizado):** `tailscale ping` (disco) **e** `--tsmp`
**NÃO** enxergam a ACL — sempre dão "pong". Só **`tailscale ping --icmp <nó>`**
testa a ACL.

**Prova final:**
```
docker exec casashopping-tailscale tailscale ping --icmp home              # timeout ✅
docker exec casashopping-tailscale tailscale ping --icmp weplanner-infra-1 # timeout ✅
```
Ambos deram **timeout** = cliente bloqueado. Portainer segue conectado; weplanner intacto.

---

## F5–F8 — Pendências operacionais

- **F5 Limpeza de disco:** `docker image prune -a -f && docker builder prune -f`
  (remove `joaovvv/*` órfãos + cache; ~29 GB). Conferir `docker system df`.
- **F6 MagicDNS no Portainer:** trocar `100.x:9001` por
  `casashopping-prod.<tailnet>.ts.net:9001` (resiliente a troca de IP).
- **F7 Watchdog agent↔tailscale:** ao reiniciar o `tailscale`, o `portainer_agent`
  precisa de restart (perde a netns). Automatizar (healthcheck/watchdog) pra
  reatar sozinho.
- **F8 Remover `deploy.yml`** dormente (Docker Hub, branch `main1`, SSH arm64) —
  higiene, sem consumidor desde a saída do watchtower.

---

## F9 — Migração MinIO → R2 (futuro)

Viável e de **baixo esforço** — o `apps/storage` já tem ganchos de R2 (`S3_REGION`,
checksum `WHEN_REQUIRED`, `STORAGE_SKIP_BUCKET_SETUP`, `UNSIGNED-PAYLOAD`).
Envolve: provisionar bucket+token no R2, `rclone` dos dados, domínio público R2
(custom domain Cloudflare), e auditar URLs legadas absolutas no banco
(maioria guarda **key**, então troca a base via `STORAGE_URL`). Ganho: sem egress,
menos disco/container stateful na VM. Trilha separada, quando houver janela.

---

## Ordem sugerida de execução

1. **F4** (verificar ACL — fecha o risco de segurança aberto) + **F5** (limpeza).
2. **F1** (nginx separado) → **F3** (manutenção, junto, mesmo arquivo).
3. **F2** (app stack no Portainer Git).
4. **F6/F7/F8** (polimento) e **F9** (R2) quando quiser.
