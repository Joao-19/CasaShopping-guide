"use client";

import { useCallback, useMemo, useState } from "react";
import { BulkCreateResult } from "@repo/dtos";
import { toast } from "@repo/ui";
import productHttp from "@/Services/http/product.http";
import storeHttp from "@/Services/http/store.http";
import { useImageUpload } from "@/composable/storage/useImageUpload";
import { buildResolvedRows, diagnoseRow, isRowImportable } from "./buildRows";
import {
  suggestColumnMapping,
  suggestionsToMapping,
} from "./columnMapping";
import { extractZipImages, type ZipImage } from "./matchImages";
import { parseSpreadsheet } from "./parseSpreadsheet";
import { buildBulkPayload, type CommitProgress } from "./commit";
import type { StoreOption } from "./resolve";
import type {
  MappingSuggestion,
  RawRow,
  ResolvedRow,
} from "./types";

export type ImportStep = "upload" | "mapping" | "preview" | "result";

export function useImport() {
  const { uploadImage } = useImageUpload();

  const [step, setStep] = useState<ImportStep>("upload");
  const [parsing, setParsing] = useState(false);
  const [headers, setHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<RawRow[]>([]);
  const [zipImages, setZipImages] = useState<ZipImage[]>([]);
  const [stores, setStores] = useState<StoreOption[]>([]);
  const [suggestions, setSuggestions] = useState<MappingSuggestion[]>([]);
  const [rows, setRows] = useState<ResolvedRow[]>([]);
  const [progress, setProgress] = useState<CommitProgress | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<BulkCreateResult | null>(null);

  // Passo 1: recebe planilha + zip, faz parse e pré-carrega lojas.
  const onFiles = useCallback(
    async (spreadsheet: File, zip: File | null) => {
      setParsing(true);
      try {
        const [{ headers: hdrs, rows: parsed }, images, storeList] =
          await Promise.all([
            parseSpreadsheet(spreadsheet),
            zip ? extractZipImages(zip) : Promise.resolve<ZipImage[]>([]),
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
        setZipImages(images);
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
      setRows(buildResolvedRows(rawRows, mapping, stores, zipImages));
      setStep("preview");
    },
    [rawRows, stores, zipImages],
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

  const importableRows = useMemo(() => rows.filter(isRowImportable), [rows]);
  const blockedCount = rows.length - importableRows.length;

  // Passo 4: sobe imagens e chama o endpoint bulk.
  const runImport = useCallback(async () => {
    if (importableRows.length === 0) {
      toast.warning("Nenhuma linha apta para importar.");
      return;
    }
    setImporting(true);
    setProgress({ phase: "uploading", uploadedImages: 0, totalImages: 0 });
    try {
      const products = await buildBulkPayload(
        importableRows,
        zipImages,
        uploadImage,
        setProgress,
      );
      const res = await productHttp.createBulk({ products });
      setResult(res);
      setStep("result");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao importar. Nenhuma alteração parcial foi perdida.");
    } finally {
      setImporting(false);
      setProgress(null);
    }
  }, [importableRows, zipImages, uploadImage]);

  const reset = useCallback(() => {
    setStep("upload");
    setHeaders([]);
    setRawRows([]);
    setZipImages([]);
    setStores([]);
    setSuggestions([]);
    setRows([]);
    setResult(null);
  }, []);

  return {
    step,
    parsing,
    importing,
    progress,
    headers,
    zipImages,
    stores,
    suggestions,
    rows,
    importableRows,
    blockedCount,
    result,
    diagnoseRow,
    onFiles,
    confirmMapping,
    updateRow,
    runImport,
    reset,
  };
}
