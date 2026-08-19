import React, { useState } from 'react';
import { Product } from '../types/product';

interface Props {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => Promise<{ success: boolean; error?: string }>;
}

const ProductTable: React.FC<Props> = ({ products, onEdit, onDelete }) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDelete = async (product: Product) => {
    const confirmed = window.confirm(
      `Delete "${product.name}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(product.id);
    setDeleteError(null);

    const result = await onDelete(product.id);

    if (!result.success) {
      setDeleteError(result.error ?? 'Failed to delete product.');
    }
    setDeletingId(null);
  };

  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
        No products found. Add your first product above.
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

      <div className="overflow-hidden rounded-lg border border-slate-200 shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Created
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-blue-50/50">
                <td className="px-4 py-3 text-sm font-medium text-slate-800">
                  {product.name}
                </td>
                <td className="max-w-xs px-4 py-3 text-sm text-slate-600">
                  <span className="line-clamp-2">
                    {product.description || (
                      <em className="text-slate-400">—</em>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-green-700">
                  ${product.price.toFixed(2)}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
                  {new Date(product.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(product)}
                      disabled={deletingId === product.id}
                      className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      disabled={deletingId === product.id}
                      className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                    >
                      {deletingId === product.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;