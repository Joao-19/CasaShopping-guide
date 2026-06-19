"use client";

import { useCallback, useMemo, useState } from "react";
import type JSZip from "jszip";
import { toast } from "@repo/ui";
import storeHttp from "@/Services/http/store.http";
import { buildResolvedRows, diagnoseRow, isRowImportable } from "./buildRows";
import {
  suggestColumnMapping,
  suggestionsToMapping,
} from "./columnMapping";
import { loadZip } from "./matchImages";
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
  const [zip, setZip] = useState<JSZip | null>(null);
  const [imageEntries, setImageEntries] = useState<string[]>([]);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [suggestions, setSuggestions] = useState<MappingSuggestion[]>([]);
  const [rows, setRows] = useState<ResolvedRow[]>([]);

  // Passo 1: recebe planilha + zip, faz parse e pré-carrega lojas.
  const onFiles = useCallback(
    async (spreadsheet: File, zipFile: File | null) => {
      setParsing(true);
      try {
        const [{ headers: hdrs, rows: parsed }, loadedZip, storeList] =
          await Promise.all([
            parseSpreadsheet(spreadsheet),
            zipFile ? loadZip(zipFile) : Promise.resolve(null),
            storeHttp
              .list({ limit: 1000 })
              .then((r) => r.data.map((s) => ({ id: s.id, name: s.name }))),
          ]);

        if (parsed.length === 0) {
          toast.error("A planilha não tem linhas de dados.");
          return;
        }

        setHeaders(hdrs);
        setRawRows(parsed);
        setZip(loadedZip?.zip ?? null);
        setImageEntries(loadedZip?.entries ?? []);
        setStores(storeList);
        setSuggestions(suggestColumnMapping(hdrs));
        setStep("mapping");
      } catch (err) {
        console.error(err);
        toast.error("Falha ao ler os arquivos. Verifique o formato.");
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
    setZip(null);
    setImageEntries([]);
    setStores([]);
    setSuggestions([]);
    setRows([]);
  }, []);

  return {
    step,
    parsing,
    headers,
    zip,
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
