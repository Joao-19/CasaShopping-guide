export interface WhereOperations<T> {
  $gte?: T,
  $lte?: T,
  $eq?: T,
}

type WhereValue<T> = T | WhereOperations<T>;

type Where<T> = {
  [K in keyof T]?: WhereValue<T[K]>;
};

export interface GetForm<Model> {
  id?: string;
  where?: Where<Model>;
  search?: Partial<Model> | string;
}
export interface FindForm<Model> {
  where?: Where<Model>;
  search?: Partial<Model> | string;
  sort?: keyof Model | keyof Model[];
  fields?: (keyof Model)[];
}

export interface ListForm<Model> {
  where?: Partial<Model>;
  search?: Partial<Model> | string;
  limit?: number;
  pageSize?: number;
  page?: number;
  sort?: string[] | string;
}

export interface ListResult<Model> {
  rows: Model[],
  pageSize: number;
  page: number;
  total: number;
  totalPages: number;
}
export interface GetResult<Model> {
  rows: Model[],
  pageSize?: number;
  page?: number;
}

export type UpdateForm<Model> = Partial<Model> & { id: string };

export interface DeleteForm {
  id: string;
}

export interface ApiError<Data = unknown> {
  code: string,
  name: string,
  type: string,
  message: string,
  data? : Data,
}
