import React, { useState, useEffect } from 'react';
import { Product, CreateProductPayload } from '../types/product';

interface Props {
  onSubmit: (
    payload: CreateProductPayload
  ) => Promise<{ success: boolean; error?: string }>;
  editingProduct?: Product | null;
  onCancelEdit?: () => void;
}

interface FormState {
  name: string;
  description: string;
  price: string;
}

interface FormErrors {
  name?: string;
  price?: string;
  api?: string;
}

const INITIAL: FormState = { name: '', description: '', price: '' };

const ProductForm: React.FC<Props> = ({
  onSubmit,
  editingProduct,
  onCancelEdit,
}) => {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name,
        description: editingProduct.description,
        price: String(editingProduct.price),
      });
      setErrors({});
      setSuccessMessage('');
    } else {
      setForm(INITIAL);
    }
  }, [editingProduct]);

  const validate = (): boolean => {
    const next: FormErrors = {};

    if (!form.name.trim()) {
      next.name = 'Product name is required.';
    } else if (form.name.trim().length > 100) {
      next.name = 'Name must not exceed 100 characters.';
    }

    const priceNum = parseFloat(form.price);
    if (!form.price || isNaN(priceNum)) {
      next.price = 'A valid price is required.';
    } else if (priceNum <= 0) {
      next.price = 'Price must be greater than zero.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});
    setSuccessMessage('');

    const result = await onSubmit({
      name: form.name.trim(),
      description: form.description.trim(),
      price: parseFloat(form.price),
    });

    setIsSubmitting(false);

    if (result.success) {
      setSuccessMessage(
        editingProduct ? 'Product updated!' : 'Product created!'
      );
      if (!editingProduct) setForm(INITIAL);
    } else {
      setErrors({ api: result.error });
    }
  };

  return (
    <div>
      {errors.api && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {errors.api}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-4 py-2 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Name <span className="text-red-500">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            maxLength={100}
            disabled={isSubmitting}
            placeholder="e.g. Running Shoes"
            className={`mt-1 block w-full rounded-lg border px-4 py-2.5 text-sm shadow-sm outline-none transition duration-200 focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 ${
              errors.name
                ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-xs text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            disabled={isSubmitting}
            placeholder="Optional description..."
            className="mt-1 block w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm shadow-sm outline-none transition duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-500"
          />
        </div>

        <div>
          <label
            htmlFor="price"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Price ($) <span className="text-red-500">*</span>
          </label>
          <input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0.01"
            value={form.price}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="0.00"
            className={`mt-1 block w-full rounded-lg border px-4 py-2.5 text-sm shadow-sm outline-none transition duration-200 focus:ring-2 disabled:bg-slate-50 disabled:text-slate-500 ${
              errors.price
                ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'
            }`}
          />
          {errors.price && (
            <p className="mt-1 text-xs text-red-600">{errors.price}</p>
          )}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? 'Saving...'
              : editingProduct
              ? 'Save Changes'
              : 'Add Product'}
          </button>
          {editingProduct && onCancelEdit && (
            <button
              type="button"
              onClick={onCancelEdit}
              disabled={isSubmitting}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProductForm;