import React, { useState } from 'react';
import { Product } from '../types/product';
import Modal from './Modal';

interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const ProductTable: React.FC<Props> = ({ products, onEdit, onDelete }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const confirmDelete = (product: Product) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setTimeout(() => setProductToDelete(null), 300);
    setDeleteError(null);
  };

  const handleDelete = async () => {
    if (!productToDelete) return;

    setDeletingId(productToDelete.id);
    setDeleteError(null);

    const result = await onDelete(productToDelete.id);

    if (!result.success) {
      setDeleteError(result.error ?? 'Failed to delete product.');
    } else {
      setIsDeleteModalOpen(false);
      setTimeout(() => setProductToDelete(null), 300);
    }
    setDeletingId(null);
  };

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/50 p-16 text-center backdrop-blur-sm">
        <div className="mb-4 rounded-full bg-slate-100 p-4">
          <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="mb-1 text-lg font-medium text-slate-900">No products yet</h3>
        <p className="text-sm text-slate-500">Get started by creating a new product.</p>
      </div>
    );
  }

  return (
    <div>
      {deleteError && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {deleteError}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] ring-1 ring-slate-900/5">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/80 backdrop-blur-sm">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                Product
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                Description
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">
                Added
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-widest text-slate-500">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {products.map((product) => (
              <tr key={product.id} className="group transition-colors hover:bg-slate-50/80">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900">{product.name}</div>
                </td>
                <td className="px-6 py-4 max-w-sm">
                  <div className="truncate text-sm text-slate-500">
                    {product.description || <span className="italic opacity-50">No description</span>}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    ${product.price.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                  {new Date(product.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                    <button
                      onClick={() => onEdit(product)}
                      disabled={deletingId === product.id}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:opacity-50"
                      aria-label="Edit product"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => confirmDelete(product)}
                      disabled={deletingId === product.id}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-100 disabled:opacity-50"
                      aria-label="Delete product"
                    >
                      {deletingId === product.id ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={cancelDelete}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete <span className="font-semibold text-slate-900">{productToDelete?.name}</span>? This action cannot be undone.
          </p>
          
          {deleteError && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
              {deleteError}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleDelete}
              disabled={deletingId !== null}
              className="flex-1 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deletingId !== null ? 'Deleting...' : 'Delete'}
            </button>
            <button
              onClick={cancelDelete}
              disabled={deletingId !== null}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ProductTable;