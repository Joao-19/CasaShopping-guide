import * as XLSX from "xlsx";
import { PRODUCT_CATEGORIES } from "./categories";

// Exemplos que, juntos, exercitam TODAS as opções: preço em texto livre
// (de/por, simples e vazio), as 6 categorias (incl. multi-categoria),
// com/sem foto, tags e destaque.
const TEMPLATE_ROWS = [
  {
    Nome: "Sofá Retrátil 3 Lugares",
    Loja: "Nome exato da loja cadastrada",
    "Preço": "R$ 7.847 por R$ 4.708,20",
    Categorias: "Sala",
    "Descrição": "Sofá retrátil e reclinável, 3 lugares.",
    Tags: "sofa; sala de estar",
    Destaque: "Sim",
    Imagem: "sofa_1.jpg; sofa_2.jpg",
  },
  {
    Nome: "Cama Box Casal",
    Loja: "Nome exato da loja cadastrada",
    "Preço": "R$ 3.299,90",
    Categorias: "Quarto",
    "Descrição": "Cama box casal com baú.",
    Tags: "cama; quarto",
    Destaque: "Não",
    Imagem: "cama.jpg",
  },
  {
    Nome: "Gabinete para Banheiro",
    Loja: "Nome exato da loja cadastrada",
    "Preço": "R$ 1.450",
    Categorias: "Banheiro",
    "Descrição": "Gabinete com cuba e espelheira.",
    Tags: "banheiro; gabinete",
    Destaque: "Não",
    Imagem: "gabinete.jpg",
  },
  {
    Nome: "Conjunto Mesa + Cadeiras Cozinha",
    Loja: "Nome exato da loja cadastrada",
    "Preço": "R$ 5.200 por R$ 3.990",
    Categorias: "Cozinha; Sala",
    "Descrição": "Mesa com 4 cadeiras (multi-categoria).",
    Tags: "mesa; cozinha",
    Destaque: "Sim",
    Imagem: "mesa_1.jpg; mesa_2.jpg",
  },
  {
    Nome: "Conjunto para Varanda",
    Loja: "Nome exato da loja cadastrada",
    "Preço": "R$ 899",
    Categorias: "Área Externa",
    "Descrição": "Mesa e cadeiras em fibra sintética.",
    Tags: "varanda; externa",
    Destaque: "Não",
    Imagem: "varanda.jpg",
  },
  {
    Nome: "Escrivaninha Home Office",
    Loja: "Nome exato da loja cadastrada",
    "Preço": "",
    Categorias: "Escritório",
    "Descrição": "Preço vazio e sem foto — pode importar mesmo assim.",
    Tags: "escritorio; home office",
    Destaque: "Não",
    Imagem: "",
  },
];

const HEADER_ORDER = [
  "Nome",
  "Loja",
  "Preço",
  "Categorias",
  "Descrição",
  "Tags",
  "Destaque",
  "Imagem",
];

// Aba de referência com TODAS as opções válidas, pro lojista consultar.
function buildOptionsSheet(): XLSX.WorkSheet {
  const rows: (string | undefined)[][] = [
    ["COMO PREENCHER — valores aceitos em cada coluna"],
    [],
    ["Coluna", "Valores aceitos / regra"],
    ["Nome", "Texto livre (obrigatório)"],
    ["Loja", "Nome EXATO de uma loja já cadastrada (obrigatório)"],
    [
      "Preço",
      'Texto livre — aparece igual no site. Promoção (de/por): use "por"  →  ex.: R$ 7.847 por R$ 4.708,20. Simples: R$ 3.299,90. Vazio = "Sob consulta".',
    ],
    [
      "Categorias",
      PRODUCT_CATEGORIES.map((c) => c.name).join("  |  "),
    ],
    ["Categorias (várias)", 'Separe por ";"  →  ex.: Sala; Cozinha'],
    ["Descrição", "Texto livre (opcional)"],
    ["Tags", 'Palavras-chave separadas por ";" (opcional)'],
    ["Destaque", "Sim  |  Não"],
    ["Imagem", "Só o NOME do arquivo + extensão  →  ex.: sofa.jpg"],
    ["Imagem (várias)", 'Separe por ";" — até 5 por produto'],
    [],
    ["Categorias válidas (uma por linha):"],
    ...PRODUCT_CATEGORIES.map((c) => [c.name]),
    [],
    ["Sobre as fotos:"],
    ["- As fotos vão num arquivo .zip separado da planilha."],
    ["- O nome do arquivo no zip tem que ser IGUAL ao da coluna Imagem."],
    ["- Formatos: .jpg .jpeg .png .webp — até 5 por produto."],
    ["- Pode importar sem foto: o produto é criado e fica avisado."],
  ];
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [{ wch: 22 }, { wch: 70 }];
  return ws;
}

// Gera e baixa o modelo .xlsx (aba Produtos com exemplos + aba Opções
// com todos os valores aceitos).
export function downloadTemplate() {
  const wb = XLSX.utils.book_new();

  const produtos = XLSX.utils.json_to_sheet(TEMPLATE_ROWS, {
    header: HEADER_ORDER,
  });
  produtos["!cols"] = [
    { wch: 32 },
    { wch: 28 },
    { wch: 26 },
    { wch: 20 },
    { wch: 44 },
    { wch: 22 },
    { wch: 10 },
    { wch: 24 },
  ];
  XLSX.utils.book_append_sheet(wb, produtos, "Produtos");
  XLSX.utils.book_append_sheet(wb, buildOptionsSheet(), "Opções");

  XLSX.writeFile(wb, "modelo-importacao-produtos.xlsx");
}
