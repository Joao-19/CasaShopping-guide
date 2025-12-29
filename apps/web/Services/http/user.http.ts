import axios from "axios";
import { LoginResponse } from "./auth.http";
import http from "./index";

export type Role = "ROOT" | "CA" | "CS";

export interface Rbac {
  role: Role;
  companyId: string;
  userId: string;
}

export interface UserRegisterForm {
  firstName: string;
  lastName: string;
  firstNameKana: string;
  lastNameKana: string;
  email: string;
  password: string;
  tel: string;
  fax?: string;
  zipCode: string;
  prefId: string;
  cityId: string;
  address: string;
  contactTelFlag?: boolean;
  contactFaxFlag?: boolean;
  contactPostFlag?: boolean;
  contactMailFlag?: boolean;
  fcShopIds: number[];
  pushShinyabinFlag?: boolean;
  hope: {
    prefId?: string;
    cityId1?: string;
    cityId2?: string;
    cityId3?: string;
    estateType: {
      newEstatePrice: boolean;
      oldEstatePrice: boolean;
      newMansionPrice: boolean;
      oldMansionPrice: boolean;
      landPrice: boolean;
      businessPrice: boolean;
    };
    typeId: string;
    newEstatePrice: [number, number];
    oldEstatePrice: [number, number];
    newMansionPrice: [number, number];
    oldMansionPrice: [number, number];
    landPrice: [number, number];
    businessPrice: [number, number];
  };
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  profileImage?: string;
  createdAt: string;
}

export default {
  register(form: UserRegisterForm) {
    return axios
      .post<void>("/customers/register", form)
      .then((res) => res.data);
  },
  getMyself() {
    return axios.get<LoginResponse>("/user/getMyself");
  },
  getMe() {
    return http.get<UserProfile>("/users/me").then((res) => res.data);
  },
  updateProfileImage(profileImage: string) {
    return http
      .patch<UserProfile>("/users/me/profile-image", { profileImage })
      .then((res) => res.data);
  },
  deleteAccount() {
    return http
      .delete<{ message: string }>("/users/me")
      .then((res) => res.data);
  },
};
