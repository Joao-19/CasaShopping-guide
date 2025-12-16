import axios from 'axios';
import { LoginResponse } from './auth.http';

export type Role = 'ROOT' | 'CA' | 'CS';

export interface Rbac {
  role: Role;
  companyId: string;
  userId: string;
}

export interface UserRegisterForm{
  firstName: string,
  lastName: string,
  firstNameKana: string,
  lastNameKana: string,
  email: string,
  password: string,
  tel: string,
  fax?: string,
  zipCode: string,
  prefId: string,
  cityId: string,
  address: string,
  contactTelFlag?: boolean,
  contactFaxFlag?: boolean,
  contactPostFlag?: boolean,
  contactMailFlag?: boolean,
  fcShopIds: number[],
  pushShinyabinFlag?: boolean,
  hope: {
    prefId?: string,
    cityId1?: string,
    cityId2?: string,
    cityId3?: string,
    estateType: {
      newEstatePrice: boolean,
      oldEstatePrice: boolean,
      newMansionPrice: boolean,
      oldMansionPrice: boolean,
      landPrice: boolean,
      businessPrice: boolean,
    },
    typeId: string,
    newEstatePrice: [number, number],
    oldEstatePrice: [number, number],
    newMansionPrice: [number, number],
    oldMansionPrice: [number, number],
    landPrice: [number, number],
    businessPrice: [number, number],
  },
}

export default {
  register(form: UserRegisterForm) {
    return axios.post<void>('/customers/register', form).then((res) => res.data);
  },
  getMyself() {
    return axios.get<LoginResponse>('/user/getMyself');
  },
};
