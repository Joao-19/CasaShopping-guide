import Admin from "@/Domain/User";

export interface LoginForm {
  email: string;
  password: string;
}
export interface LoginResponse {
  user: Admin;
  accessToken: string;
  refreshToken: string;
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
  user: Admin;
  token: string;
}

import http from "./index";

export default {
  login(form: LoginForm) {
    return http
      .post<LoginResponse>("auth/admin/login/", form)
      .then((res) => res.data);
  },
  logout() {
    return http.post<void>("auth/logout").then((res) => res.data);
  },
  register(form: RegisterForm) {
    return http
      .post<RegisterResponse>("auth/register", form)
      .then((res) => res.data);
  },
  recoverPasswordRequest(form: RecoverPasswordRequestForm) {
    return http
      .post<void>("user/recoverPasswordRequest", form)
      .then((res) => res.data);
  },
  recoverPassword(form: RecoverPasswordForm) {
    return http
      .post<void>("user/recoverPassword", form)
      .then((res) => res.data);
  },
  changePassword(form: ChangePasswordForm) {
    return http
      .post<void>("customers/password/change", form)
      .then((res) => res.data);
  },
};
