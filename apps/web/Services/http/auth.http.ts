import axios from "axios";
import User from "@/Domain/User";

export interface LoginForm {
  email: string;
  password: string;
}
export interface LoginResponse {
  user: User;
  token: string;
}

export interface RecoverPasswordRequestForm {
  email: string;
}

export interface RecoverPasswordForm {
  token: string;
  password: string;
}

export interface ChangePasswordForm {
  password: string;
  confirmPassword: string;
  token: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
}

export default {
  login(form: LoginForm) {
    return axios.post<LoginResponse>("auth/login/", form);
  },
  register(form: RegisterForm) {
    return axios.post<RegisterResponse>("auth/register", form);
  },
  recoverPasswordRequest(form: RecoverPasswordRequestForm) {
    return axios.post<void>("user/recoverPasswordRequest", form);
  },
  recoverPassword(form: RecoverPasswordForm) {
    return axios.post<void>("user/recoverPassword", form);
  },
  changePassword(form: ChangePasswordForm) {
    return axios.post<void>("customers/password/change", form);
  },
};
