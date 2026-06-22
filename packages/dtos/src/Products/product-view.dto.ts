import { IsOptional, IsString, IsNotEmpty, MaxLength } from "class-validator";

/**
 * Registro de visualização de produto (Frente 3 — Área de Dados).
 * Enviado pelo front ao abrir um produto. `sessionId` é a base do dedupe
 * (o service ignora views repetidas da mesma sessão/produto numa janela
 * curta). Os campos de origem são capturados no 1º acesso da sessão.
 */
export class RegisterProductViewDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  sessionId!: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  referrer?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  utmSource?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  utmMedium?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  utmCampaign?: string;

  @IsOptional()
  @IsString()
  @MaxLength(512)
  landingPage?: string;
}

/** Resultado do registro: `recorded` false = deduplicada (não contou). */
export interface RegisterProductViewResult {
  recorded: boolean;
}
