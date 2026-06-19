import http from "./index";

export default {
  // Remove um arquivo do storage pela key (ex.: limpeza de imagens
  // órfãs de linhas que falharam no import em massa).
  deleteImage(key: string) {
    return http.post("/storage/delete", { key }).then((res) => res.data);
  },
};
