# Exemplo de importação de produtos

Arquivo: **`exemplo-importacao-produtos.xlsx`** — modelo pronto pra
importação em massa no painel (**Importar Produtos**).

## Como preencher

| Coluna | O que vai | Observação |
|--------|-----------|------------|
| **Nome** | Nome do produto | obrigatório |
| **Loja** | Nome **exato** da loja já cadastrada | obrigatório; se não bater, o sistema sugere a mais parecida |
| **Preço** | `Baixo`, `Médio`, `Alto` ou `Sem valor` | aceita texto; vira a faixa de preço |
| **Categorias** | `Sala`, `Quarto`, `Banheiro`, `Cozinha`, `Área Externa`, `Escritório` | mais de uma: separe por `;` (ex.: `Sala; Cozinha`) |
| **Descrição** | Texto livre | opcional |
| **Tags** | Palavras-chave separadas por `;` | opcional |
| **Destaque** | `Sim` ou `Não` | opcional |
| **Imagem** | **Só o nome do arquivo + extensão** | ex.: `sofa-retratil_1.jpg` |

## Sobre as imagens (importante)

Na coluna **Imagem** você coloca **apenas o nome do arquivo**, não a foto
em si — por exemplo `mesa-jantar.jpg`. As fotos vão num **arquivo .zip à
parte**, e o nome dentro do zip precisa ser **igual** ao que está na
planilha.

- Vários produtos podem ter várias fotos: separe os nomes por `;`
  (ex.: `conjunto-varanda_1.jpg; conjunto-varanda_2.jpg`).
- Até **5 imagens** por produto.
- Formatos aceitos: `.jpg`, `.jpeg`, `.png`, `.webp`.

No momento de importar você envia **dois arquivos**: esta planilha e o
`.zip` com as imagens.
