import { useState, useEffect, useCallback } from 'react';
import { AxiosError } from 'axios';
import {
  Product,
  PagedResult,
  CreateProductPayload,
  UpdateProductPayload,
} from '../types/product';
import { productApi } from '../api/productApi';

interface State {
  data: PagedResult<Product> | null;
  isLoading: boolean;
  error: string | null;
}

export const useProducts = (initialPageSize = 10) => {
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(initialPageSize);
  const [state, setState] = useState<State>({
    data: null,
    isLoading: false,
    error: null,
  });

  const fetchProducts = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await productApi.getAll(pageNumber, pageSize);
      setState({ data, isLoading: false, error: null });
    } catch (err) {
      setState({
        data: null,
        isLoading: false,
        error: extractErrorMessage(err),
      });
    }
  }, [pageNumber, pageSize]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const createProduct = async (payload: CreateProductPayload) => {
    try {
      await productApi.create(payload);
      await fetchProducts();
      return { success: true as const };
    } catch (err) {
      return { success: false as const, error: extractErrorMessage(err) };
    }
  };

  const updateProduct = async (id: string, payload: UpdateProductPayload) => {
    try {
      await productApi.update(id, payload);
      await fetchProducts();
      return { success: true as const };
    } catch (err) {
      return { success: false as const, error: extractErrorMessage(err) };
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productApi.delete(id);
      await fetchProducts();
      return { success: true as const };
    } catch (err) {
      return { success: false as const, error: extractErrorMessage(err) };
    }
  };

  return {
    ...state,
    pageNumber,
    pageSize,
    setPageNumber,
    refresh: fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
  };
};

function extractErrorMessage(err: unknown): string {
  if (err instanceof AxiosError) {
    const data = err.response?.data;
    if (data?.detail) return data.detail;
    if (data?.title) return data.title;
    if (data?.errors) {
      const allErrors = Object.values(
        data.errors as Record<string, string[]>
      ).flat();
      return allErrors.join(' ');
    }
    if (err.message) return err.message;
  }
  return 'An unexpected error occurred.';
}