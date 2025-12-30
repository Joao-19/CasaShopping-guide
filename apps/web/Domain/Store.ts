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
  createdAt: string; // Dates often come as strings in JSON
  modifiedAt: string;
  deletedAt?: string | null;
}
