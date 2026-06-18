import * as XLSX from "xlsx";
import type { RawRow } from "./types";

export interface ParsedSheet {
  headers: string[];
  rows: RawRow[];
}

// Lê um .xlsx/.csv e devolve headers + linhas (todas as células como
// string já trimadas). Usa a primeira aba do arquivo.
export async function parseSpreadsheet(file: File): Promise<ParsedSheet> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return { headers: [], rows: [] };
  }
  const sheet = workbook.Sheets[firstSheetName];
  if (!sheet) {
    return { headers: [], rows: [] };
  }

  // header:1 -> matriz de arrays; a primeira linha é o cabeçalho.
  const matrix = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    blankrows: false,
    defval: "",
  });

  if (matrix.length === 0) return { headers: [], rows: [] };

  const headerRow = matrix[0] ?? [];
  const headers = headerRow.map((h) => String(h ?? "").trim()).filter(Boolean);

  const rows: RawRow[] = [];
  for (let r = 1; r < matrix.length; r++) {
    const cells = matrix[r] ?? [];
    const row: RawRow = {};
    let hasValue = false;
    headers.forEach((header, c) => {
      const value = String(cells[c] ?? "").trim();
      row[header] = value;
      if (value) hasValue = true;
    });
    if (hasValue) rows.push(row);
  }

  return { headers, rows };
}
