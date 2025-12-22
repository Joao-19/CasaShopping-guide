import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

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
  phone!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
