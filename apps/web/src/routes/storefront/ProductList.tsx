import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStoreProducts, useStoreCategories } from '@/features/storefront/hooks';
import SEOHead from '@/components/SEOHead';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState('newest');

  const categoryId = searchParams.get('categoryId') || undefined;
  const search = searchParams.get('search') || undefined;
  const page = Number(searchParams.get('page')) || 1;

  const { data, isLoading } = useStoreProducts({ page, categoryId, search, sort });
  const { data: categories } = useStoreCategories();

  const handleCategoryClick = (id: string | null) => {
    const params = new URLSearchParams(searchParams);
    if (id) params.set('categoryId', id);
    else params.delete('categoryId');
    params.delete('page');
    setSearchParams(params);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEOHead title="Products" description="Browse our collection of products" />
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 flex-shrink-0">
          <h3 className="font-bold mb-4">Categories</h3>
          <ul className="space-y-2">
            <li>
              <button onClick={() => handleCategoryClick(null)} className={`text-sm ${!categoryId ? 'text-brand-accent font-medium' : 'text-gray-600 hover:text-brand-accent'}`}>
                All Products
              </button>
            </li>
            {categories?.map((cat: any) => (
              <li key={cat.id}>
                <button onClick={() => handleCategoryClick(cat.id)} className={`text-sm ${categoryId === cat.id ? 'text-brand-accent font-medium' : 'text-gray-600 hover:text-brand-accent'}`}>
                  {cat.name}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              {search ? `Results for "${search}"` : 'All Products'}
            </h1>
            <select value={sort} onChange={(e) => setSort(e.target.value)} className="border rounded-lg px-3 py-2 text-sm">
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-lg h-64 animate-pulse" />
              ))
            ) : data?.products?.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">No products found</div>
            ) : (
              data?.products?.map((product: any) => (
                <Link key={product.id} to={`/products/${product.slug}`} className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {product.media?.[0]?.url ? (
                      <img src={product.media[0].url} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-gray-400">No Image</span>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-xs text-gray-500">{product.publisher?.fullName}</p>
                    <p className="font-medium truncate mt-1">{product.name}</p>
                    <p className="text-brand-accent font-bold mt-1">Rp {Number(product.marketplacePrice).toLocaleString()}</p>
                  </div>
                </Link>
              ))
            )}
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => { const params = new URLSearchParams(searchParams); params.set('page', String(p)); setSearchParams(params); }} className={`px-3 py-1 rounded ${p === page ? 'bg-brand-accent text-white' : 'bg-white border'}`}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
