export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  phone: string;
  // password não deve trafegar em DTOs de resposta, só de entrada
  password: string;
}
