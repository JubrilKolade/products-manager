import {
  PagedResult,
  Product,
  CreateProductPayload,
  UpdateProductPayload,
} from '../types/product';
import apiClient from './apiClient';

export const productApi = {
  getAll: async (
    pageNumber: number,
    pageSize: number
  ): Promise<PagedResult<Product>> => {
    const { data } = await apiClient.get<PagedResult<Product>>('/products', {
      params: { pageNumber, pageSize },
    });
    return data;
  },

  getById: async (id: string): Promise<Product> => {
    const { data } = await apiClient.get<Product>(`/products/${id}`);
    return data;
  },

  create: async (payload: CreateProductPayload): Promise<Product> => {
    const { data } = await apiClient.post<Product>('/products', payload);
    return data;
  },

  update: async (
    id: string,
    payload: UpdateProductPayload
  ): Promise<Product> => {
    const { data } = await apiClient.put<Product>(`/products/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },
};