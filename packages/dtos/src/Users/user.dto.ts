export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  // password não deve trafegar em DTOs de resposta, só de entrada
  password: string;
}
