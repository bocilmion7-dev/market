import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCategories } from '@/features/admin/hooks';
import { usePublisherProduct, useCreateProduct, useUpdateProduct, useSubmitProduct } from '@/features/products/hooks';
import { useCategoryFormSchema } from '@/features/form-builder/hooks';
import FieldRenderer from '@/components/forms/FieldRenderer';

export default function ProductForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id && id !== 'new';

  const { data: existingProduct } = usePublisherProduct(isEdit ? id! : '');
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const submitProduct = useSubmitProduct();

  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [bestPrice, setBestPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [categoryFormData, setCategoryFormData] = useState<Record<string, any>>({});

  const { data: catSchema } = useCategoryFormSchema(categoryId);

  useEffect(() => {
    if (existingProduct) {
      setCategoryId(existingProduct.categoryId);
      setBrandId(existingProduct.brandId || '');
      setName(existingProduct.name);
      setDescription(existingProduct.description);
      setBestPrice(Number(existingProduct.bestPrice));
      setStock(existingProduct.stock);
      setCategoryFormData(existingProduct.categoryFormData || {});
    }
  }, [existingProduct]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { categoryId, brandId: brandId || undefined, name, description, bestPrice, stock, categoryFormData, hasVariants: false };

    if (isEdit) {
      updateProduct.mutate({ id: id!, data: payload }, { onSuccess: () => navigate('/publisher/products') });
    } else {
      createProduct.mutate(payload, { onSuccess: () => navigate('/publisher/products') });
    }
  };

  const handleSubmitForApproval = () => {
    submitProduct.mutate(id!, { onSuccess: () => navigate('/publisher/products') });
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">{isEdit ? 'Edit Product' : 'New Product'}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="w-full border px-3 py-2" required>
            <option value="">Select category...</option>
            {categories?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Product Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border px-3 py-2" required />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="w-full border px-3 py-2 h-24" required />
        </div>

        {catSchema?.fields && (
          <div className="border-t pt-4">
            <h3 className="font-semibold mb-3">Category Attributes</h3>
            {catSchema.fields.map((field: any) => (
              <div key={field.fieldKey} className="mb-3">
                <FieldRenderer
                  field={field}
                  value={categoryFormData[field.fieldKey]}
                  onChange={(val: any) => setCategoryFormData({ ...categoryFormData, [field.fieldKey]: val })}
                />
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Best Price (Rp)</label>
            <input type="number" value={bestPrice} onChange={(e) => setBestPrice(Number(e.target.value))} className="w-full border px-3 py-2" min="0" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock</label>
            <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} className="w-full border px-3 py-2" min="0" required />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <button type="submit" className="bg-brand-accent text-white px-6 py-2">
            {isEdit ? 'Update' : 'Save Draft'}
          </button>
          {isEdit && existingProduct?.status === 'DRAFT' && (
            <button type="button" onClick={handleSubmitForApproval} className="bg-green-600 text-white px-6 py-2">
              Submit for Approval
            </button>
          )}
          <button type="button" onClick={() => navigate('/publisher/products')} className="border px-6 py-2">Cancel</button>
        </div>
      </form>
    </div>
  );
}
