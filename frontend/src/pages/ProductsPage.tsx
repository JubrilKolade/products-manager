import React, { useState } from 'react';
import { Product, UpdateProductPayload } from '../types/product';
import { useProducts } from '../hooks/useProducts';
import ProductForm from '../components/ProductForm';
import ProductTable from '../components/ProductTable';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openAddModal = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setEditingProduct(null), 300); // clear after animation
  };

  const handleFormSubmit = async (payload: UpdateProductPayload) => {
    if (editingProduct) {
      const result = await updateProduct(editingProduct.id, payload);
      if (result.success) {
        closeModal();
      }
      return result;
    }
    const result = await createProduct(payload);
    if (result.success) {
      closeModal();
    }
    return result;
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Products
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your product inventory and pricing.
            {data && (
              <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                {data.totalCount} total
              </span>
            )}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </button>
      </header>

      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingProduct ? 'Edit Product' : 'Add New Product'}
      >
        <ProductForm
          onSubmit={handleFormSubmit}
          editingProduct={editingProduct}
          onCancelEdit={closeModal}
        />
      </Modal>

      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-slate-500">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 rounded-full border-[3px] border-slate-100"></div>
            <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-blue-600 border-t-transparent"></div>
          </div>
          <p className="text-sm font-medium animate-pulse">Loading inventory...</p>
        </div>
      )}

      {error && !isLoading && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-6 shadow-sm">
          <div className="flex items-center gap-3 text-red-800">
            <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium">Failed to load products</h3>
              <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && data && (
        <div className="space-y-6 animate-fade-in">
          <ProductTable
            products={data.items}
            onEdit={openEditModal}
            onDelete={deleteProduct}
          />
          {data.totalPages > 1 && (
            <div className="flex justify-center pt-2">
              <Pagination
                pageNumber={data.pageNumber}
                totalPages={data.totalPages}
                hasPreviousPage={data.hasPreviousPage}
                hasNextPage={data.hasNextPage}
                onPageChange={setPageNumber}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductsPage;