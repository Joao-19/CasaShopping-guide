export interface CreateStoreDto {
  name: string;
  image?: any; // Using any to support File (frontend) or other types (backend buffer) avoiding lib conflicts
  address: string;
  phone?: string | null;
  site?: string | null;
  facebookLink?: string | null;
  instagramLink?: string | null;
  youtubeLink?: string | null;
}

export interface Store {
  id: string;
  name: string;
  logoImage?: string | null;
  address: string;
  phone?: string | null;
  site?: string | null;
  facebookLink?: string | null;
  instagramLink?: string | null;
  youtubeLink?: string | null;
  createdAt: Date;
  modifiedAt: Date;
  deletedAt?: Date | null;
}
