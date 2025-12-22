export const translateError = (error: any): string => {
  const defaultMessage =
    "Ocorreu um erro inesperado. Tente novamente mais tarde.";

  if (!error) return defaultMessage;

  // Check for string error directly
  if (typeof error === "string") return error;

  // Check for response data message or tag
  const tag = error.response?.data?.message || error.message || "";

  // Map of error tags to Portuguese messages
  const errorMap: Record<string, string> = {
    // Auth
    "Credentials are not valid":
      "Credenciais inválidas. Verifique seu e-mail e senha.",
    "User not found": "Usuário não encontrado.",
    "email must be an email": "O e-mail informado é inválido.",
    "Network Error": "Erro de conexão. Verifique sua internet.",
    Unauthorized: "Sessão expirada ou não autorizada.",
    Forbidden: "Você não tem permissão para realizar esta ação.",

    // Store
    "Store not found": "Loja não encontrada.",

    // Default fallback check
    "Internal Server Error": "Erro interno no servidor.",
  };

  // Return translated message if found, otherwise return default
  return errorMap[tag] || defaultMessage;
};

export const VALIDATION_MESSAGES = {
  REQUIRED_NAME: "Nome da loja é obrigatório",
  REQUIRED_ADDRESS: "Endereço é obrigatório",
  INVALID_URL: "URL inválida",
};
