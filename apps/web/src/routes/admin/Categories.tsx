import { useState } from 'react';
import { useCategories, useCreateCategory, useDeleteCategory } from '@/features/admin/hooks';

export default function AdminCategories() {
  const [name, setName] = useState('');
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const deleteCategory = useDeleteCategory();

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    createCategory.mutate({ name }, { onSuccess: () => setName('') });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Categories</h1>

      <form onSubmit={handleCreate} className="flex gap-2 mb-6">
        <input placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} className="border px-3 py-2 flex-1" required />
        <button type="submit" className="bg-brand-accent text-white px-4 py-2 hover:bg-brand-accent-dark">Add</button>
      </form>

      <div className="bg-white shadow">
        {isLoading ? <p className="p-4 text-center">Loading...</p> : (
          <ul className="divide-y">
            {categories?.map((cat: any) => (
              <li key={cat.id} className="flex justify-between items-center p-3">
                <span>{cat.name} <span className="text-gray-400 text-sm">({cat.slug})</span></span>
                <button onClick={() => deleteCategory.mutate(cat.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
