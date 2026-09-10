import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useStoreProducts, useStoreCategories } from '@/features/storefront/hooks';
import SEOHead from '@/components/SEOHead';
import { Skeleton, EmptyState, Badge } from '@/components/ui';
import { useIsMobile } from '@/hooks/useMediaQuery';

function getCategoryIcon(name: string): JSX.Element {
  const lower = name.toLowerCase();
  if (lower.includes('fashion') || lower.includes('pakaian')) {
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" /></svg>;
  }
  if (lower.includes('elektronik') || lower.includes('gadget')) {
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" /></svg>;
  }
  if (lower.includes('makanan') || lower.includes('minuman') || lower.includes('food')) {
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.126-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265z" /></svg>;
  }
  if (lower.includes('rumah') || lower.includes('dapur') || lower.includes('home')) {
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>;
  }
  if (lower.includes('kecantikan') || lower.includes('beauty')) {
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" /></svg>;
  }
  if (lower.includes('olahraga') || lower.includes('sport')) {
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" /></svg>;
  }
  if (lower.includes('otomotif') || lower.includes('automotive')) {
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5-2.25h7.5m-7.5 0H6.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h7.5m-7.5 0v-3.375c0-.621.504-1.125 1.125-1.125H8.25v3.375m7.5-7.5h.008v.008H15.75V9zm-7.5 0h.008v.008H8.25V9z" /></svg>;
  }
  if (lower.includes('mainan') || lower.includes('hobi') || lower.includes('toy')) {
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875S10.5 3.089 10.5 4.125c0 .369.128.713.349 1.003.215.283.401.604.401.959V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v.75c0 .355.186.676.401.959.221.29.349.634.349 1.003 0 1.036-1.007 1.875-2.25 1.875S0 10.089 0 11.125c0 .369.128.713.349 1.003.215.283.401.604.401.959V15a2.25 2.25 0 002.25 2.25h12a2.25 2.25 0 002.25-2.25v-2.083c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875S19 8.089 19 9.125c0 .369.128.713.349 1.003.215.283.401.604.401.959V15a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 15v-.75" /></svg>;
  }
  if (lower.includes('kesehatan') || lower.includes('health')) {
    return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>;
  }
  return <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" /></svg>;
}

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
            {isLoading ? (
              <Skeleton className="h-6 w-32 mb-4" />
            ) : (
              <h3 className="font-bold mb-4">Categories</h3>
            )}
            <ul className="space-y-2">
              {isLoading ? (
                Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)
              ) : (
                <>
                  <li>
                    <button
                      onClick={() => handleCategoryClick(null)}
                      className={`text-sm rounded-sm ${!categoryId ? 'text-brand-accent font-medium' : 'text-[rgb(var(--text-secondary))] hover:text-brand-accent'}`}
                    >
                      All Products
                    </button>
                  </li>
                  {categories?.map((cat: any) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => handleCategoryClick(cat.id)}
                        className={`text-sm rounded-sm ${categoryId === cat.id ? 'text-brand-accent font-medium' : 'text-[rgb(var(--text-secondary))] hover:text-brand-accent'}`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </aside>
        )}

        <div className="flex-1">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            {isLoading ? (
              <Skeleton className="h-8 w-64" />
            ) : (
              <h1 className="text-xl md:text-2xl font-bold">
                {search ? `Results for "${search}"` : 'All Products'}
              </h1>
            )}
            {!isLoading && (
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full sm:w-auto border border-[rgb(var(--border))] px-3 py-2 text-sm bg-[rgb(var(--bg-primary))]"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low → High</option>
                <option value="price_desc">Price: High → Low</option>
              </select>
            )}
          </div>

          {isMobile && !isLoading && (
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 -mx-4 px-4">
              <button
                onClick={() => handleCategoryClick(null)}
                className={`flex-shrink-0 px-3 py-1.5 text-sm rounded-sm flex items-center gap-1.5 ${!categoryId ? 'bg-brand-accent text-white' : 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))]'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" /></svg>
                All
              </button>
              {categories?.map((cat: any) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex-shrink-0 px-3 py-1.5 text-sm rounded-sm flex items-center gap-1.5 ${categoryId === cat.id ? 'bg-brand-accent text-white' : 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))]'}`}
                >
                  {getCategoryIcon(cat.name)}
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 items-stretch">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="h-40 md:h-48" />
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
                  className="bg-[rgb(var(--bg-primary))] overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full"
                >
                  <div className="h-32 md:h-48 bg-[rgb(var(--bg-tertiary))] flex items-center justify-center">
                    {product.media?.[0]?.url ? (
                      <img src={product.media[0].url} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-[rgb(var(--text-muted))] text-sm">No Image</span>
                    )}
                  </div>
                  <div className="p-3 md:p-4 flex flex-col flex-1">
                    <p className="text-xs text-[rgb(var(--text-muted))]">{product.publisher?.fullName}</p>
                    <p className="font-medium line-clamp-2 mt-1 text-sm md:text-base">{product.name}</p>
                    <p className="text-brand-accent font-bold mt-auto pt-1 text-sm md:text-base">
                      Rp {Number(product.marketplacePrice).toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))
            )}
          </div>

          {!isLoading && data && data.totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    const params = new URLSearchParams(searchParams);
                    params.set('page', String(p));
                    setSearchParams(params);
                  }}
                  className={`w-10 h-10 text-sm font-medium transition-colors rounded-sm ${
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
