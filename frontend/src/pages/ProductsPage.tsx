import React, { useState } from 'react';
import { Product, UpdateProductPayload } from '../types/product';
import { useProducts } from '../hooks/useProducts';
import ProductForm from '../components/ProductForm';
import ProductTable from '../components/ProductTable';
import Pagination from '../components/Pagination';

const ProductsPage: React.FC = () => {
  const {
    data,
    isLoading,
    error,
    setPageNumber,
    createProduct,
    updateProduct,
    deleteProduct,
  } = useProducts(10);

  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleFormSubmit = async (payload: UpdateProductPayload) => {
    if (editingProduct) {
      const result = await updateProduct(editingProduct.id, payload);
      if (result.success) setEditingProduct(null);
      return result;
    }
    return createProduct(payload);
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <header className="mb-8 flex items-baseline gap-4">
        <h1 className="text-3xl font-bold text-slate-900">
          Product Management
        </h1>
        {data && (
          <span className="text-sm text-slate-500">
            {data.totalCount} product{data.totalCount !== 1 ? 's' : ''} total
          </span>
        )}
      </header>

      <div className="mb-8">
        <ProductForm
          onSubmit={handleFormSubmit}
          editingProduct={editingProduct}
          onCancelEdit={() => setEditingProduct(null)}
        />
      </div>

      {isLoading && (
        <div className="flex flex-col items-center gap-3 py-12 text-slate-500">
          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-slate-200 border-t-blue-500" />
          <p>Loading products...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          <strong>Failed to load products:</strong> {error}
        </div>
      )}

      {!isLoading && !error && data && (
        <>
          <ProductTable
            products={data.items}
            onEdit={setEditingProduct}
            onDelete={deleteProduct}
          />
          <Pagination
            pageNumber={data.pageNumber}
            totalPages={data.totalPages}
            hasPreviousPage={data.hasPreviousPage}
            hasNextPage={data.hasNextPage}
            onPageChange={setPageNumber}
          />
        </>
      )}
    </div>
  );
};

export default ProductsPage;