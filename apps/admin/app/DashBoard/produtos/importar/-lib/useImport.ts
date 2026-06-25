"use client";

import { useCallback, useMemo, useState } from "react";
import { toast } from "@repo/ui";
import storeHttp from "@/Services/http/store.http";
import { type LoadedArchive, loadArchive } from "./archive";
import { buildResolvedRows, diagnoseRow, isRowImportable } from "./buildRows";
import {
  suggestColumnMapping,
  suggestionsToMapping,
} from "./columnMapping";
import { parseSpreadsheet } from "./parseSpreadsheet";
import type { StoreOption } from "./resolve";
import type {
  MappingSuggestion,
  RawRow,
  ResolvedRow,
} from "./types";

export type ImportStep = "upload" | "mapping" | "preview" | "result";

export function useImport() {
  const [step, setStep] = useState<ImportStep>("upload");
  const [parsing, setParsing] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<RawRow[]>([]);
  const [archive, setArchive] = useState<LoadedArchive | null>(null);
  const [imageEntries, setImageEntries] = useState<string[]>([]);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [suggestions, setSuggestions] = useState<MappingSuggestion[]>([]);
  const [rows, setRows] = useState<ResolvedRow[]>([]);

  // Passo 1: recebe planilha + arquivo de imagens, faz parse e pré-carrega
  // lojas. Cada etapa tem erro próprio — uma falha de rede (lojas) não pode
  // se passar por "arquivo inválido", nem um zip/rar ruim por "planilha
  // ruim".
  const onFiles = useCallback(
    async (spreadsheet: File, archiveFile: File | null) => {
      setParsing(true);
      try {
        // 1) Planilha
        let parsedSheet;
        try {
          parsedSheet = await parseSpreadsheet(spreadsheet);
        } catch (err) {
          console.error(err);
          toast.error(
            "Não consegui ler a planilha. Confira se é um .xlsx/.csv válido.",
          );
          return;
        }
        if (parsedSheet.rows.length === 0) {
          toast.error("A planilha não tem linhas de dados.");
          return;
        }

        // 2) Arquivo de imagens (opcional) — .zip ou .rar
        let loadedArchive: LoadedArchive | null = null;
        if (archiveFile) {
          try {
            loadedArchive = await loadArchive(archiveFile);
          } catch (err) {
            console.error(err);
            toast.error(
              "Não consegui abrir o arquivo de imagens. Confira se é um .zip ou .rar válido.",
            );
            return;
          }
          if (loadedArchive.entries.length === 0) {
            toast.warning(
              "O arquivo não tem imagens reconhecidas (.jpg .png .webp .gif .avif .svg). Seguindo sem fotos.",
            );
          }
        }

        // 3) Lojas (backend) — universo COMPLETO via /stores/options. O
        // list() paginado capa em 25 no backend e deixaria milhares de
        // lojas invisíveis ao matching.
        let storeList;
        try {
          storeList = await storeHttp.options();
        } catch (err) {
          console.error(err);
          toast.error(
            "Não consegui carregar as lojas (o servidor pode estar fora do ar). Tente de novo.",
          );
          return;
        }

        setHeaders(parsedSheet.headers);
        setRawRows(parsedSheet.rows);
        setArchive(loadedArchive);
        setImageEntries(loadedArchive?.entries ?? []);
        setStores(storeList);
        setSuggestions(suggestColumnMapping(parsedSheet.headers));
        setStep("mapping");
      } finally {
        setParsing(false);
      }
    },
    [],
  );

  // Passo 2: usuário ajustou o mapeamento de colunas e confirmou.
  const confirmMapping = useCallback(
    (confirmed: MappingSuggestion[]) => {
      const mapping = suggestionsToMapping(confirmed);
      setRows(buildResolvedRows(rawRows, mapping, stores, imageEntries));
      setStep("preview");
    },
    [rawRows, stores, imageEntries],
  );

  // Passo 3 (repair): aplica patch numa linha do preview.
  const updateRow = useCallback(
    (index: number, patch: Partial<ResolvedRow>) => {
      setRows((prev) =>
        prev.map((r) => (r.index === index ? { ...r, ...patch } : r)),
      );
    },
    [],
  );

  // Aplica uma loja a várias linhas de uma vez (evita editar 700×).
  // `onlyUnresolved` = só nas linhas cuja loja não foi resolvida.
  const bulkSetStore = useCallback(
    (storeId: string, onlyUnresolved: boolean) => {
      setRows((prev) =>
        prev.map((r) =>
          onlyUnresolved && r.store.status === "resolved"
            ? r
            : { ...r, store: { status: "resolved", value: storeId, raw: r.store.raw } },
        ),
      );
    },
    [],
  );

  // Mapeia UM nome de loja da planilha (origem) para uma loja real,
  // aplicando só às linhas com aquele mesmo nome não resolvido. Permite
  // ajuste fino quando há muitas lojas diferentes: nome X → loja W,
  // nome Z → loja P, sem carimbar a mesma loja em cima de todas.
  const mapStoreByRawName = useCallback(
    (rawName: string, storeId: string) => {
      setRows((prev) =>
        prev.map((r) =>
          r.store.status !== "resolved" && r.store.raw === rawName
            ? { ...r, store: { status: "resolved", value: storeId, raw: r.store.raw } }
            : r,
        ),
      );
    },
    [],
  );

  // Nomes de loja da planilha que não resolveram, agrupados (com a
  // contagem de itens) — insumo do painel de resolução por nome.
  const unresolvedStoreGroups = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) {
      if (r.store.status !== "resolved") {
        counts.set(r.store.raw, (counts.get(r.store.raw) ?? 0) + 1);
      }
    }
    return Array.from(counts.entries())
      .map(([raw, count]) => ({ raw, count }))
      .sort((a, b) => b.count - a.count);
  }, [rows]);

  const importableRows = useMemo(() => rows.filter(isRowImportable), [rows]);
  const blockedCount = rows.length - importableRows.length;

  const reset = useCallback(() => {
    setStep("upload");
    setHeaders([]);
    setRawRows([]);
    setArchive(null);
    setImageEntries([]);
    setStores([]);
    setSuggestions([]);
    setRows([]);
  }, []);

  return {
    step,
    parsing,
    headers,
    archive,
    imageEntries,
    stores,
    suggestions,
    rows,
    importableRows,
    blockedCount,
    diagnoseRow,
    onFiles,
    confirmMapping,
    updateRow,
    bulkSetStore,
    mapStoreByRawName,
    unresolvedStoreGroups,
    reset,
  };
}
