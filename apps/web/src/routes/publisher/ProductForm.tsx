import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCategories } from '@/features/admin/hooks';
import { usePublisherProduct, useCreateProduct, useUpdateProduct, useSubmitProduct } from '@/features/products/hooks';
import { useCategoryFormSchema } from '@/features/form-builder/hooks';
import FieldRenderer from '@/components/forms/FieldRenderer';
import { ImageUpload } from '@/components/ui';

interface ProductImage {
  url: string;
  altText?: string;
}

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
  const [weight, setWeight] = useState(500);
  const [categoryFormData, setCategoryFormData] = useState<Record<string, any>>({});
  const [images, setImages] = useState<ProductImage[]>([]);

  const { data: catSchema } = useCategoryFormSchema(categoryId);

  useEffect(() => {
    if (existingProduct) {
      setCategoryId(existingProduct.categoryId);
      setBrandId(existingProduct.brandId || '');
      setName(existingProduct.name);
      setDescription(existingProduct.description);
      setBestPrice(Number(existingProduct.bestPrice));
      setStock(existingProduct.stock);
      setWeight(existingProduct.weight || 500);
      setCategoryFormData(existingProduct.categoryFormData || {});
      if (existingProduct.media) {
        setImages(existingProduct.media.map((m: any) => ({ url: m.url, altText: m.altText })));
      }
    }
  }, [existingProduct]);

  const handleAddImage = () => {
    if (images.length < 6) {
      setImages([...images, { url: '', altText: name }]);
    }
  };

  const handleUpdateImage = (index: number, url: string) => {
    const updated = [...images];
    updated[index] = { ...updated[index], url };
    setImages(updated);
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validImages = images.filter((img) => img.url);
    const payload = { categoryId, brandId: brandId || undefined, name, description, bestPrice, stock, weight, categoryFormData, hasVariants: false, media: validImages };

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

        {/* Product Images */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Gambar Produk (maks 6)</h3>
            {images.length < 6 && (
              <button type="button" onClick={handleAddImage} className="text-sm text-brand-accent hover:underline">
                + Tambah Gambar
              </button>
            )}
          </div>
          {images.length === 0 && (
            <p className="text-sm text-[rgb(var(--text-muted))]">Belum ada gambar. Klik "+ Tambah Gambar" untuk menambahkan.</p>
          )}
          <div className="space-y-4">
            {images.map((img, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <span className="text-sm text-[rgb(var(--text-muted))] mt-2">{idx + 1}.</span>
                <ImageUpload
                  value={img.url}
                  onChange={(url) => handleUpdateImage(idx, url)}
                  folder="products"
                  previewClassName="w-24 h-24"
                  className="flex-1"
                />
                <button type="button" onClick={() => handleRemoveImage(idx)} className="mt-2 text-sm text-red-500 hover:text-red-600">
                  Hapus
                </button>
              </div>
            ))}
          </div>
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

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Best Price (Rp)</label>
            <input type="number" value={bestPrice} onChange={(e) => setBestPrice(Number(e.target.value))} className="w-full border px-3 py-2" min="0" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock</label>
            <input type="number" value={stock} onChange={(e) => setStock(Number(e.target.value))} className="w-full border px-3 py-2" min="0" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Berat (gram) *</label>
            <input type="number" value={weight} onChange={(e) => setWeight(Number(e.target.value))} className="w-full border px-3 py-2" min="1" required />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <button type="submit" className="bg-brand-accent text-white px-6 py-2 rounded-sm">
            {isEdit ? 'Update' : 'Save Draft'}
          </button>
          {isEdit && existingProduct?.status === 'DRAFT' && (
            <button type="button" onClick={handleSubmitForApproval} className="bg-green-600 text-white px-6 py-2 rounded-sm">
              Submit for Approval
            </button>
          )}
          <button type="button" onClick={() => navigate('/publisher/products')} className="border px-6 py-2 rounded-sm">Cancel</button>
        </div>
      </form>
    </div>
  );
}
