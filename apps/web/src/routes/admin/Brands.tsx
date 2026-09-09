import { useState } from 'react';
import { useBrands, useCreateBrand, useDeleteBrand } from '@/features/admin/hooks';

export default function AdminBrands() {
  const [name, setName] = useState('');
  const { data: brands, isLoading } = useBrands();
  const createBrand = useCreateBrand();
  const deleteBrand = useDeleteBrand();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createBrand.mutate({ name }, { onSuccess: () => setName('') });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Brands</h1>

      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input placeholder="Brand name" value={name} onChange={(e) => setName(e.target.value)} className="border px-3 py-2 flex-1" required />
        <button type="submit" className="bg-brand-accent text-white px-4 py-2 hover:bg-brand-accent-dark">Add</button>
      </form>

      <div className="bg-white shadow">
        {isLoading ? <p className="p-4 text-center">Loading...</p> : (
          <ul className="divide-y">
            {brands?.map((brand: any) => (
              <li key={brand.id} className="flex justify-between items-center p-3">
                <span>{brand.name} <span className="text-gray-400 text-sm">({brand.slug})</span></span>
                <button onClick={() => deleteBrand.mutate(brand.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
