import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Matches,
  IsBoolean,
  Equals,
} from "class-validator";
import { Transform } from "class-transformer";

export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value.replace(/\D/g, ""))
  @Matches(/^(\d{2}9\d{8}|\d{10}|0800\d{7})$/, {
    message:
      "Telefone inválido (10 ou 11 dígitos, celular deve ter 9 ou 0800).",
  })
  phone!: string;

  @IsString()
  @MinLength(9, { message: "A senha deve ter no mínimo 9 caracteres." })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z]).*$/, {
    message: "A senha deve conter letras maiúsculas e minúsculas.",
  })
  password!: string;

  // Aceite da Política de Privacidade (LGPD). Obrigatoriamente true — o
  // timestamp do consentimento é gravado no servidor (privacyAcceptedAt).
  @IsBoolean()
  @Equals(true, {
    message: "É necessário aceitar a Política de Privacidade.",
  })
  privacyAccepted!: boolean;
}

export class UpdateProfileImageDto {
  @IsString()
  @IsNotEmpty()
  profileImage!: string;
}
