"use client";

import { PriceTier } from "@repo/dtos";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui";
import { CategoryMultiSelect } from "../../-components/CategoryMultiSelect";
import { PRODUCT_CATEGORIES } from "../-lib/categories";
import type { CommitProgress } from "../-lib/commit";
import type { RowDiagnostics, ResolvedRow } from "../-lib/types";
import { StoreResolveCell } from "./StoreResolveCell";
import { BulkStoreToolbar } from "./BulkStoreToolbar";
import {
  StoreResolutionPanel,
  type UnresolvedStoreGroup,
} from "./StoreResolutionPanel";

// Mesmos rótulos do form de criação de produto (CreateProductForm).
const PRICE_LABELS: Record<PriceTier, string> = {
  [PriceTier.LOW]: "Baixo ($)",
  [PriceTier.MEDIUM]: "Médio ($$)",
  [PriceTier.HIGH]: "Alto ($$$)",
  [PriceTier.ON_REQUEST]: "Sem Valor",
};

const SEVERITY_DOT: Record<RowDiagnostics["severity"], string> = {
  ok: "bg-green-500",
  warning: "bg-amber-400",
  error: "bg-red-500",
};

function categoryName(id: string) {
  return PRODUCT_CATEGORIES.find((c) => c.id === id)?.name ?? id;
}

interface PreviewStepProps {
  rows: ResolvedRow[];
  storeNameById: (id: string) => string;
  diagnose: (row: ResolvedRow) => RowDiagnostics;
  importableCount: number;
  blockedCount: number;
  importing: boolean;
  progress: CommitProgress | null;
  onUpdateRow: (index: number, patch: Partial<ResolvedRow>) => void;
  onBulkSetStore: (storeId: string, onlyUnresolved: boolean) => void;
  unresolvedStoreGroups: UnresolvedStoreGroup[];
  onMapStoreByName: (rawName: string, storeId: string) => void;
  onImport: () => void;
  onBack: () => void;
}

export function PreviewStep({
  rows,
  storeNameById,
  diagnose,
  importableCount,
  blockedCount,
  importing,
  progress,
  onUpdateRow,
  onBulkSetStore,
  unresolvedStoreGroups,
  onMapStoreByName,
  onImport,
  onBack,
}: PreviewStepProps) {
  const resolvedImageCount = (row: ResolvedRow) =>
    row.images.filter((i) => i.status === "resolved").length;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Revisar e corrigir</h2>
          <p className="text-sm text-gray-500">
            <span className="text-green-600 font-medium">{importableCount} aptos</span>
            {blockedCount > 0 && (
              <>
                {" · "}
                <span className="text-red-600 font-medium">
                  {blockedCount} bloqueados
                </span>{" "}
                (corrija a loja/categoria/preço)
              </>
            )}
          </p>
        </div>
      </div>

      <StoreResolutionPanel
        groups={unresolvedStoreGroups}
        onMap={onMapStoreByName}
      />

      <BulkStoreToolbar onApply={onBulkSetStore} />

      <div className="border border-gray-100 rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10"></TableHead>
              <TableHead>Produto</TableHead>
              <TableHead>Loja</TableHead>
              <TableHead>Preço</TableHead>
              <TableHead>Categorias</TableHead>
              <TableHead>Fotos</TableHead>
              <TableHead>Problemas</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const diag = diagnose(row);
              return (
                <TableRow key={row.index}>
                  <TableCell>
                    <span
                      className={`inline-block w-3 h-3 rounded-full ${SEVERITY_DOT[diag.severity]}`}
                      title={diag.severity}
                    />
                  </TableCell>
                  <TableCell className="font-medium text-gray-800 max-w-[180px]">
                    {row.name || (
                      <span className="text-red-500 italic">sem nome</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <StoreResolveCell
                      store={row.store}
                      storeNameById={storeNameById}
                      onResolve={(id) =>
                        onUpdateRow(row.index, {
                          store: { status: "resolved", value: id, raw: row.store.raw },
                        })
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <select
                      value={row.price.value ?? PriceTier.ON_REQUEST}
                      onChange={(e) =>
                        onUpdateRow(row.index, {
                          price: {
                            status: "resolved",
                            value: e.target.value as PriceTier,
                            raw: row.price.raw,
                          },
                        })
                      }
                      className={`px-2 py-1 border rounded text-sm bg-white ${
                        row.price.status === "missing" ? "border-red-400" : "border-gray-200"
                      }`}
                    >
                      {Object.values(PriceTier).map((t) => (
                        <option key={t} value={t}>
                          {PRICE_LABELS[t]}
                        </option>
                      ))}
                    </select>
                  </TableCell>
                  <TableCell className="min-w-[180px]">
                    {row.categories.status === "resolved" ? (
                      <div className="flex flex-wrap gap-1">
                        {(row.categories.value ?? []).map((id) => (
                          <span
                            key={id}
                            className="text-xs bg-[#1A2B3C]/10 text-[#1A2B3C] px-2 py-0.5 rounded"
                          >
                            {categoryName(id)}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <CategoryMultiSelect
                        value={row.categories.value ?? []}
                        onChange={(ids) =>
                          onUpdateRow(row.index, {
                            categories: {
                              status: ids.length ? "resolved" : "missing",
                              value: ids,
                              raw: row.categories.raw,
                            },
                          })
                        }
                      />
                    )}
                  </TableCell>
                  <TableCell
                    className={`whitespace-nowrap text-sm ${
                      resolvedImageCount(row) === 0
                        ? "text-red-600 font-medium"
                        : "text-gray-600"
                    }`}
                  >
                    {resolvedImageCount(row) === 0
                      ? "sem foto"
                      : `${resolvedImageCount(row)}/${row.images.length}`}
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    {diag.messages.length === 0 ? (
                      <span className="text-xs text-green-600">ok</span>
                    ) : (
                      <ul className="text-xs list-disc list-inside">
                        {diag.messages.map((m, i) => (
                          <li
                            key={i}
                            className={
                              m.level === "error" ? "text-red-600" : "text-amber-600"
                            }
                          >
                            {m.text}
                          </li>
                        ))}
                      </ul>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {progress && (
        <div className="text-sm text-gray-500">
          {progress.phase === "uploading"
            ? `Subindo imagens... ${progress.uploadedImages}/${progress.totalImages}`
            : "Salvando produtos..."}
        </div>
      )}

      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          disabled={importing}
          className="px-4 py-2 text-gray-500 font-medium text-sm hover:bg-gray-50 rounded-lg disabled:opacity-50"
        >
          Voltar
        </button>
        <button
          onClick={onImport}
          disabled={importing || importableCount === 0}
          className="px-6 py-2 bg-[#1A2B3C] text-white font-medium text-sm rounded-lg hover:bg-[#2c455d] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {importing ? "Importando..." : `Importar ${importableCount} produtos`}
        </button>
      </div>
    </div>
  );
}
