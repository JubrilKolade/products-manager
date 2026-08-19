export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  createdAt: string;
  updatedAt: string | null;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateProductPayload {
  name: string;
  description: string;
  price: number;
}

export type UpdateProductPayload = CreateProductPayload;