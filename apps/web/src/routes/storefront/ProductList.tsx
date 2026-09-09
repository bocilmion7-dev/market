import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStoreProducts, useStoreCategories } from '@/features/storefront/hooks';
import SEOHead from '@/components/SEOHead';
import { Skeleton, EmptyState, Badge } from '@/components/ui';
import { useIsMobile } from '@/hooks/useMediaQuery';

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState('newest');
  const isMobile = useIsMobile();

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
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <SEOHead title="Products" description="Browse our collection of products" />
      
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {!isMobile && (
          <aside className="w-64 flex-shrink-0">
            <h3 className="font-bold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => handleCategoryClick(null)}
                  className={`text-sm ${!categoryId ? 'text-brand-accent font-medium' : 'text-[rgb(var(--text-secondary))] hover:text-brand-accent'}`}
                >
                  All Products
                </button>
              </li>
              {categories?.map((cat: any) => (
                <li key={cat.id}>
                  <button
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`text-sm ${categoryId === cat.id ? 'text-brand-accent font-medium' : 'text-[rgb(var(--text-secondary))] hover:text-brand-accent'}`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h1 className="text-xl md:text-2xl font-bold">
              {search ? `Results for "${search}"` : 'All Products'}
            </h1>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-full sm:w-auto border border-[rgb(var(--border))] rounded-lg px-3 py-2 text-sm bg-[rgb(var(--bg-primary))]"
            >
              <option value="newest">Newest</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
            </select>
          </div>

          {isMobile && (
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 -mx-4 px-4">
              <button
                onClick={() => handleCategoryClick(null)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm ${!categoryId ? 'bg-brand-accent text-white' : 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))]'}`}
              >
                All
              </button>
              {categories?.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm ${categoryId === cat.id ? 'bg-brand-accent text-white' : 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))]'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-40 md:h-48 rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))
            ) : data?.products?.length === 0 ? (
              <div className="col-span-full">
                <EmptyState
                  title={search ? `No products match "${search}"` : "No products found"}
                  description="Try adjusting your filters or search terms"
                  action={search ? { label: "Clear Search", onClick: () => setSearchParams({}) } : undefined}
                />
              </div>
            ) : (
              data?.products?.map((product: any) => (
                <Link
                  key={product.id}
                  to={`/products/${product.slug}`}
                  className="bg-[rgb(var(--bg-primary))] rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="h-32 md:h-48 bg-[rgb(var(--bg-tertiary))] flex items-center justify-center">
                    {product.media?.[0]?.url ? (
                      <img src={product.media[0].url} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[rgb(var(--text-muted))] text-sm">No Image</span>
                    )}
                  </div>
                  <div className="p-3 md:p-4">
                    <p className="text-xs text-[rgb(var(--text-muted))]">{product.publisher?.fullName}</p>
                    <p className="font-medium truncate mt-1 text-sm md:text-base">{product.name}</p>
                    <p className="text-brand-accent font-bold mt-1 text-sm md:text-base">
                      Rp {Number(product.marketplacePrice).toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          {data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('page', String(p));
                    setSearchParams(params);
                  }}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    p === page
                      ? 'bg-brand-accent text-white'
                      : 'bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-tertiary))]'
                  }`}
                >
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
