export const translateError = (error: any): string => {
  const defaultMessage =
    "Ocorreu um erro inesperado. Tente novamente mais tarde.";

  if (!error) return defaultMessage;

  // 1. Handle String Error directly
  if (typeof error === "string") return error;

  // 2. Extract the raw message/tag
  let tag = error.response?.data?.message || error.message || "";

  // 2a. Handle Array of errors (Class Validator)
  if (Array.isArray(tag)) {
    // If it's an array of strings, join them or take the first one
    return tag.map((msg) => translateValidationMessage(msg)).join(". ");
  }

  // 3. Exact Match Map (Fast path)
  const errorMap: Record<string, string> = {
    // Auth
    "Credentials are not valid":
      "Credenciais inválidas. Verifique seu e-mail e senha.",
    "User not found": "Usuário não encontrado.",
    "email must be an email": "O e-mail informado é inválido.",
    "Network Error": "Erro de conexão. Verifique sua internet.",
    Unauthorized: "Sessão expirada ou não autorizada.",
    Forbidden: "Você não tem permissão para realizar esta ação.",
    "Bad Request": "Requisição inválida. Verifique os dados.",

    // Store Exact Matches
    "Store not found": "Loja não encontrada.",
    "Internal Server Error": "Erro interno no servidor.",
  };

  if (errorMap[tag]) {
    return errorMap[tag];
  }

  // 4. Regex/Dynamic Patterns (Slower path)
  const patterns = [
    {
      regex: /A store with name "(.*)" already exists/,
      message: "Já existe uma loja com o nome '$1'.",
    },
    {
      regex: /Store with ID "(.*)" not found/,
      message: "Loja não encontrada (ID: $1).",
    },
    { regex: /Store with ID (.*) not found/, message: "Loja não encontrada." },
    {
      regex: /Product with ID (.*) not found/,
      message: "Produto não encontrado.",
    },
    {
      regex: /User with email (.*) already exists/,
      message: "Já existe um usuário com o e-mail $1.",
    },
    { regex: /Duplicate entry/, message: "Registro duplicado." },
  ];

  for (const pattern of patterns) {
    const match = tag.match(pattern.regex);
    if (match) {
      // Replace placeholders like $1 with captured groups
      let translated = pattern.message;
      for (let i = 1; i < match.length; i++) {
        translated = translated.replace(`$${i}`, match[i]);
      }
      return translated;
    }
  }

  // 5. Fallback: If it looks like a backend message but we didn't translate it,
  // we return it IF it's not a generic raw error (optional strategy).
  // For now, return the tag if it exists to help debugging, but ideally we'd map everything.
  if (tag) {
    return tag;
  }

  return defaultMessage;
};

// Helper to translate common validation lines inside arrays
const translateValidationMessage = (msg: string): string => {
  if (msg.includes("must be a string"))
    return msg.replace("must be a string", "deve ser texto");
  if (msg.includes("should not be empty"))
    return msg.replace("should not be empty", "não pode ser vazio");
  if (msg.includes("must be an email")) return "E-mail inválido";
  // Add more validation translations as needed
  return msg;
};

export const VALIDATION_MESSAGES = {
  REQUIRED_NAME: "Nome da loja é obrigatório",
  REQUIRED_ADDRESS: "Endereço é obrigatório",
  INVALID_URL: "URL inválida",
};
