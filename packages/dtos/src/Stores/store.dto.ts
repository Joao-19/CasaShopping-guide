export interface CreateStoreDto {
  name: string;
  image?: any; // Using any to support File (frontend) or other types (backend buffer) avoiding lib conflicts
  location: string;
  phone?: string | null;
  website?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
}

export interface Store {
  id: string;
  name: string;
  image?: string;
  location: string;
  phone?: string | null;
  website?: string;
  facebook?: string;
  instagram?: string;
  youtube?: string;
}
