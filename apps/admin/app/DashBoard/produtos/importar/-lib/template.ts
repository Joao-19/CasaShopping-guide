import * as XLSX from "xlsx";

// Cabeçalhos que o auto-mapeamento reconhece com 100% de confiança, +
// 2 linhas de exemplo mostrando o formato esperado (preço em texto,
// categorias separadas por ";", nome do arquivo de imagem).
const TEMPLATE_ROWS = [
  {
    Nome: "Sofá Retrátil 3 Lugares",
    Loja: "Nome exato da loja cadastrada",
    "Preço": "Alto",
    Categorias: "Sala; Escritório",
    "Descrição": "Descrição do produto",
    Imagem: "sofa.jpg",
  },
  {
    Nome: "Mesa de Jantar 6 Lugares",
    Loja: "Nome exato da loja cadastrada",
    "Preço": "Médio",
    Categorias: "Cozinha",
    "Descrição": "Outra descrição",
    Imagem: "mesa.jpg",
  },
];

// Gera e baixa o modelo .xlsx no browser. Preço aceita Baixo/Médio/Alto/
// Sem valor; Imagem deve casar com o nome do arquivo dentro do zip.
export function downloadTemplate() {
  const ws = XLSX.utils.json_to_sheet(TEMPLATE_ROWS);
  ws["!cols"] = [
    { wch: 28 },
    { wch: 28 },
    { wch: 10 },
    { wch: 22 },
    { wch: 30 },
    { wch: 16 },
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Produtos");
  XLSX.writeFile(wb, "modelo-importacao-produtos.xlsx");
}
