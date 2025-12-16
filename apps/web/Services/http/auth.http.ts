import axios from "axios";
import User from "@/Domain/User";

export interface LoginForm {
  name: string;
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
}

export interface RegisterResponse {
  user: User;
  token: string;
}

export default {
  login(form: LoginForm) {
    return axios.post<LoginResponse>("api/auth/user/login/", form);
  },
  register(form: RegisterForm) {
    return axios.post<RegisterResponse>("api/auth/user/register", form);
  },
  recoverPasswordRequest(form: RecoverPasswordRequestForm) {
    return axios.post<void>("api/user/recoverPasswordRequest", form);
  },
  recoverPassword(form: RecoverPasswordForm) {
    return axios.post<void>("api/user/recoverPassword", form);
  },
  changePassword(form: ChangePasswordForm) {
    return axios.post<void>("api/customers/password/change", form);
  },
};
