"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type JSZip from "jszip";
import { useImageUpload } from "@/composable/storage/useImageUpload";
import { runImportJob, type JobItem, type JobSummary } from "./runJob";
import type { ResolvedRow } from "./types";

type JobStatus = "idle" | "running" | "done";

interface StartParams {
  rows: ResolvedRow[];
  zip: JSZip | null;
}

interface ImportJobValue {
  status: JobStatus;
  items: JobItem[];
  summary?: JobSummary;
  isRunning: boolean;
  start: (params: StartParams) => void;
  dismiss: () => void;
}

const ImportJobContext = createContext<ImportJobValue | null>(null);

export function useImportJob(): ImportJobValue {
  const ctx = useContext(ImportJobContext);
  if (!ctx) {
    throw new Error("useImportJob deve ser usado dentro de ImportJobProvider");
  }
  return ctx;
}

// Executa o import em segundo plano: o estado vive acima do layout do
// DashBoard, então sobrevive à navegação entre telas do painel. NÃO
// sobrevive a F5/fechar aba (o upload é client-side) — daí o aviso no
// widget + o beforeunload abaixo.
export function ImportJobProvider({ children }: { children: React.ReactNode }) {
  const { uploadImage } = useImageUpload();
  const [status, setStatus] = useState<JobStatus>("idle");
  const [items, setItems] = useState<JobItem[]>([]);
  const [summary, setSummary] = useState<JobSummary | undefined>(undefined);
  const runningRef = useRef(false);

  const start = useCallback(
    (params: StartParams) => {
      if (runningRef.current) return;
      runningRef.current = true;
      setStatus("running");
      setSummary(undefined);
      setItems([]);

      runImportJob({
        rows: params.rows,
        zip: params.zip,
        uploadImage,
        onItems: setItems,
      })
        .then(({ summary: s }) => setSummary(s))
        .catch((err) => console.error("Falha no import em segundo plano:", err))
        .finally(() => {
          runningRef.current = false;
          setStatus("done");
        });
    },
    [uploadImage],
  );

  const dismiss = useCallback(() => {
    if (runningRef.current) return;
    setStatus("idle");
    setItems([]);
    setSummary(undefined);
  }, []);

  // Aviso nativo do navegador enquanto há import rodando (F5/fechar aba).
  useEffect(() => {
    if (status !== "running") return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [status]);

  return (
    <ImportJobContext.Provider
      value={{ status, items, summary, isRunning: status === "running", start, dismiss }}
    >
      {children}
    </ImportJobContext.Provider>
  );
}
