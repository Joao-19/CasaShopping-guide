"use client";

import { useCallback } from "react";
import { useImport } from "./-lib/useImport";
import { UploadStep } from "./-components/UploadStep";
import { MappingStep } from "./-components/MappingStep";
import { PreviewStep } from "./-components/PreviewStep";
import { ResultStep } from "./-components/ResultStep";

const STEPS = [
  { key: "upload", label: "Arquivos" },
  { key: "mapping", label: "Colunas" },
  { key: "preview", label: "Revisão" },
  { key: "result", label: "Resultado" },
] as const;

export default function ImportarProdutosPage() {
  const im = useImport();

  const storeNameById = useCallback(
    (id: string) => im.stores.find((s) => s.id === id)?.name ?? id,
    [im.stores],
  );

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
          importing={im.importing}
          progress={im.progress}
          onUpdateRow={im.updateRow}
          onBulkSetStore={im.bulkSetStore}
          onImport={im.runImport}
          onBack={() => im.reset()}
        />
      )}

      {im.step === "result" && im.result && (
        <ResultStep
          result={im.result}
          uploadFailures={im.uploadFailures}
          onReset={im.reset}
        />
      )}
    </div>
  );
}
