"use client";

import { useCallback } from "react";
import { toast } from "@repo/ui";
import { useImport } from "./-lib/useImport";
import { useImportJob } from "./-lib/ImportJobContext";
import { UploadStep } from "./-components/UploadStep";
import { MappingStep } from "./-components/MappingStep";
import { PreviewStep } from "./-components/PreviewStep";

const STEPS = [
  { key: "upload", label: "Arquivos" },
  { key: "mapping", label: "Colunas" },
  { key: "preview", label: "Revisão" },
] as const;

export default function ImportarProdutosPage() {
  const im = useImport();
  const importJob = useImportJob();

  const storeNameById = useCallback(
    (id: string) => im.stores.find((s) => s.id === id)?.name ?? id,
    [im.stores],
  );

  // Entrega o job ao provider (roda em segundo plano) e reseta o wizard.
  const handleStart = useCallback(() => {
    if (importJob.isRunning) {
      toast.warning("Já existe uma importação em andamento.");
      return;
    }
    if (im.importableRows.length === 0) {
      toast.warning("Nenhuma linha apta para importar.");
      return;
    }
    importJob.start({ rows: im.importableRows, zip: im.zip });
    toast.success("Importação iniciada — acompanhe no card no canto da tela.");
    im.reset();
  }, [importJob, im]);

  const activeIndex = STEPS.findIndex((s) => s.key === im.step);

  return (
    <div className="p-6">
      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <span
              className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                i <= activeIndex ? "bg-[#1A2B3C] text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {i + 1}
            </span>
            <span
              className={`text-sm ${i === activeIndex ? "font-semibold text-gray-800" : "text-gray-400"}`}
            >
              {s.label}
            </span>
            {i < STEPS.length - 1 && <span className="w-8 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      {im.step === "upload" && (
        <UploadStep parsing={im.parsing} onSubmit={im.onFiles} />
      )}

      {im.step === "mapping" && (
        <MappingStep
          headers={im.headers}
          suggestions={im.suggestions}
          onConfirm={im.confirmMapping}
          onBack={im.reset}
        />
      )}

      {im.step === "preview" && (
        <PreviewStep
          rows={im.rows}
          storeNameById={storeNameById}
          diagnose={im.diagnoseRow}
          importableCount={im.importableRows.length}
          blockedCount={im.blockedCount}
          isJobRunning={importJob.isRunning}
          onUpdateRow={im.updateRow}
          onBulkSetStore={im.bulkSetStore}
          unresolvedStoreGroups={im.unresolvedStoreGroups}
          onMapStoreByName={im.mapStoreByRawName}
          onImport={handleStart}
          onBack={() => im.reset()}
        />
      )}
    </div>
  );
}
