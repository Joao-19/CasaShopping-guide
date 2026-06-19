# Padroes anti-TDZ (apps Next: web / admin)

TDZ = *Temporal Dead Zone*. Erro de runtime
`Cannot access 'X' before initialization` que aparece em build
**standalone** (Docker/Linux/produção) mas nao no dev local. Causa
tipica: ciclo de dependencia de **valor** (nao `import type`) entre um
Provider/Context e algo que ele importa.

## P1 — Ciclo envolvendo `*Provider.tsx` (o bloqueador real)

**Sintoma:** `madge --circular` lista um ciclo onde aparece
`AlgumProvider.tsx`. Em standalone, a ordem de avaliacao dos modulos do
chunk faz o Provider ser lido antes de a dependencia estar inicializada.

**Fix deterministico (aplicar sem perguntar):**

1. Extrair o `createContext(...)` e os hooks (`useX`) para um arquivo
   separado `XContext.ts` (sem JSX, sem o componente Provider).
2. O `XProvider.tsx` passa a importar `XContext` de `./XContext`.
3. Consumidores importam o hook de `./XContext`, nao do Provider.

Isso quebra o ciclo de valor: o arquivo de Context vira folha (so
`createContext` + hooks), e o Provider depende dele em uma direcao so.

```
// XContext.ts  (folha — sem ciclo)
import { createContext, useContext } from "react";
export const XContext = createContext<XValue | null>(null);
export function useX() {
  const v = useContext(XContext);
  if (!v) throw new Error("useX fora do XProvider");
  return v;
}

// XProvider.tsx
import { XContext } from "./XContext";
export function XProvider({ children }) {
  /* ... */
  return <XContext.Provider value={...}>{children}</XContext.Provider>;
}
```

## P2 — use-before-define em deps de useMemo/useCallback

**Sintoma:** uma funcao/const e referenciada no array de deps (ou corpo)
de um `useMemo`/`useCallback` antes de ser declarada no mesmo escopo.
ESLint pega como `no-use-before-define`.

**Fix:** mover a declaracao para antes do `useMemo`/`useCallback` que a
referencia.

## Como validar antes de push/deploy

1. `npx madge --circular --extensions ts,tsx apps/web` (e `apps/admin`).
2. Se houver ciclo de valor com Provider, aplicar P1.
3. Buildar o app em modo standalone (o mesmo que o Docker usa) e subir
   localmente para confirmar que nao ha TDZ em runtime.

O hook `.claude/hooks/pre-push-validate.js` automatiza (1) e bloqueia
push/deploy se encontrar ciclo de Provider em arquivo sensivel alterado.
