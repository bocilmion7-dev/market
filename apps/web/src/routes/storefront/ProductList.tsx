import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useStoreProducts, useStoreCategories } from '@/features/storefront/hooks';
import { useAddToCart } from '@/features/cart/hooks';
import { useUIStore } from '@/stores/ui';
import SEOHead from '@/components/SEOHead';
import { Skeleton, EmptyState, Badge, PageTransition } from '@/components/ui';
import { useIsMobile } from '@/hooks/useMediaQuery';
import {
  ShoppingBag, Smartphone, Coffee, Home, Sparkles, Trophy,
  Car, Gamepad, Heart, Watch, Footprints, Package, LayoutGrid,
  List, ChevronLeft, ChevronRight, Search, SlidersHorizontal, MapPin,
  ShoppingCart
} from 'lucide-react';

function getCategoryIcon(name: string): JSX.Element {
  const lower = name.toLowerCase();
  const iconClass = "w-4 h-4";

  if (lower.includes('fashion') || lower.includes('pakaian')) return <ShoppingBag className={iconClass} />;
  if (lower.includes('elektronik') || lower.includes('gadget')) return <Smartphone className={iconClass} />;
  if (lower.includes('makanan') || lower.includes('minuman') || lower.includes('food')) return <Coffee className={iconClass} />;
  if (lower.includes('rumah') || lower.includes('dapur') || lower.includes('home')) return <Home className={iconClass} />;
  if (lower.includes('kecantikan') || lower.includes('beauty')) return <Sparkles className={iconClass} />;
  if (lower.includes('olahraga') || lower.includes('sport')) return <Trophy className={iconClass} />;
  if (lower.includes('otomotif') || lower.includes('automotive')) return <Car className={iconClass} />;
  if (lower.includes('mainan') || lower.includes('hobi') || lower.includes('toy')) return <Gamepad className={iconClass} />;
  if (lower.includes('kesehatan') || lower.includes('health')) return <Heart className={iconClass} />;
  if (lower.includes('aksesoris') || lower.includes('accessory')) return <Watch className={iconClass} />;
  if (lower.includes('sepatu') || lower.includes('shoe')) return <Footprints className={iconClass} />;
  return <Package className={iconClass} />;
}

function ProductCardGrid({ product }: { product: any }) {
  const addToCart = useAddToCart();
  const navigate = useNavigate();
  const addToast = useUIStore((s) => s.addToast);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart.mutate(
      { productId: product.id, quantity: 1 },
      {
        onSuccess: () => addToast('Produk ditambahkan ke keranjang', 'success'),
        onError: () => addToast('Gagal menambahkan ke keranjang', 'error'),
      }
    );
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart.mutate(
      { productId: product.id, quantity: 1 },
      {
        onSuccess: () => navigate('/checkout'),
        onError: () => addToast('Gagal menambahkan ke keranjang', 'error'),
      }
    );
  };

  return (
    <div className="bg-[rgb(var(--bg-primary))] overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full group rounded-sm hover:-translate-y-1">
      <Link to={`/products/${product.slug}`} className="block">
        <div className="h-32 md:h-48 bg-[rgb(var(--bg-tertiary))] flex items-center justify-center overflow-hidden">
          {product.media?.[0]?.url ? (
            <img src={product.media[0].url} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <span className="text-[rgb(var(--text-muted))] text-sm">No Image</span>
          )}
        </div>
      </Link>
      <div className="p-3 md:p-4 flex flex-col flex-1">
        <Link to={`/products/${product.slug}`}>
          <p className="text-xs text-[rgb(var(--text-muted))]">{product.publisher?.fullName}</p>
          <p className="font-medium line-clamp-2 mt-1 text-sm md:text-base">{product.name}</p>
          <p className="text-brand-accent font-bold mt-auto pt-1 text-sm md:text-base">
            Rp {Number(product.marketplacePrice).toLocaleString()}
          </p>
        </Link>
        <div className="flex gap-1.5 mt-2">
          <button
            onClick={handleAddToCart}
            disabled={addToCart.isPending}
            className="h-9 w-9 flex-shrink-0 rounded-sm bg-brand-accent hover:bg-brand-accent-dark text-white flex items-center justify-center transition-all duration-150 active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
          <button
            onClick={handleBuyNow}
            disabled={addToCart.isPending}
            className="flex-1 h-9 rounded-sm bg-brand-accent hover:bg-brand-accent-dark text-white text-xs font-medium transition-all duration-150 active:scale-95"
          >
            Beli
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductCardList({ product }: { product: any }) {
  const addToCart = useAddToCart();
  const navigate = useNavigate();
  const addToast = useUIStore((s) => s.addToast);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart.mutate(
      { productId: product.id, quantity: 1 },
      {
        onSuccess: () => addToast('Produk ditambahkan ke keranjang', 'success'),
        onError: () => addToast('Gagal menambahkan ke keranjang', 'error'),
      }
    );
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart.mutate(
      { productId: product.id, quantity: 1 },
      {
        onSuccess: () => navigate('/checkout'),
        onError: () => addToast('Gagal menambahkan ke keranjang', 'error'),
      }
    );
  };

  return (
    <div className="bg-[rgb(var(--bg-primary))] overflow-hidden hover:shadow-lg transition-all duration-300 flex group rounded-sm hover:-translate-y-0.5">
      <Link to={`/products/${product.slug}`} className="flex-shrink-0">
        <div className="w-32 h-32 md:w-40 md:h-40 bg-[rgb(var(--bg-tertiary))] flex items-center justify-center overflow-hidden">
          {product.media?.[0]?.url ? (
            <img src={product.media[0].url} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <span className="text-[rgb(var(--text-muted))] text-sm">No Image</span>
          )}
        </div>
      </Link>
      <div className="p-3 md:p-4 flex flex-col flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[rgb(var(--text-muted))]">{product.publisher?.fullName}</p>
            <Link to={`/products/${product.slug}`}>
              <p className="font-medium line-clamp-2 mt-1 text-sm md:text-base">{product.name}</p>
            </Link>
            {product.publisher?.cityId && (
              <p className="text-xs text-[rgb(var(--text-muted))] mt-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{product.publisher.address?.split(',').pop()?.trim() || product.publisher.cityId}</span>
              </p>
            )}
          </div>
          <p className="text-brand-accent font-bold text-sm md:text-base whitespace-nowrap">
            Rp {Number(product.marketplacePrice).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2 mt-auto pt-3">
          <button
            onClick={handleAddToCart}
            disabled={addToCart.isPending}
            className="h-9 w-9 flex-shrink-0 rounded-sm bg-brand-accent hover:bg-brand-accent-dark text-white flex items-center justify-center transition-all duration-150 active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
          <button
            onClick={handleBuyNow}
            disabled={addToCart.isPending}
            className="flex-1 h-9 rounded-sm bg-brand-accent hover:bg-brand-accent-dark text-white text-xs font-medium transition-all duration-150 active:scale-95"
          >
            Beli
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
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
    <PageTransition>
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <SEOHead title="Products" description="Browse our collection of products" />
        
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {!isMobile && (
            <aside className="w-64 flex-shrink-0">
              {isLoading ? (
                <Skeleton className="h-6 w-32 mb-4" />
              ) : (
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-brand-accent" />
                  Categories
                </h3>
              )}
              <ul className="space-y-1">
                {isLoading ? (
                  Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-4 w-full" />)
                ) : (
                  <>
                    <li>
                      <button
                        onClick={() => handleCategoryClick(null)}
                        className={`text-sm rounded-sm w-full text-left px-3 py-2 flex items-center gap-2 transition-all duration-150 ${
                          !categoryId 
                            ? 'bg-brand-accent/10 text-brand-accent font-medium' 
                            : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] hover:text-brand-accent'
                        }`}
                      >
                        <LayoutGrid className="w-4 h-4" />
                        All Products
                      </button>
                    </li>
                    {categories?.map((cat: any) => (
                      <li key={cat.id}>
                        <button
                          onClick={() => handleCategoryClick(cat.id)}
                          className={`text-sm rounded-sm w-full text-left px-3 py-2 flex items-center gap-2 transition-all duration-150 ${
                            categoryId === cat.id 
                              ? 'bg-brand-accent/10 text-brand-accent font-medium' 
                              : 'text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-tertiary))] hover:text-brand-accent'
                          }`}
                        >
                          {getCategoryIcon(cat.name)}
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
                <h1 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <Search className="w-5 h-5 text-brand-accent" />
                  {search ? `Results for "${search}"` : 'All Products'}
                </h1>
              )}
              {!isLoading && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-[rgb(var(--border))] rounded-sm overflow-hidden">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`px-3 py-1.5 text-sm transition-colors flex items-center gap-1.5 ${viewMode === 'grid' ? 'bg-brand-accent text-white' : 'bg-[rgb(var(--bg-primary))] hover:bg-[rgb(var(--bg-tertiary))]'}`}
                    >
                      <LayoutGrid className="w-4 h-4" />
                      <span className="hidden sm:inline">Grid</span>
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`px-3 py-1.5 text-sm transition-colors flex items-center gap-1.5 ${viewMode === 'list' ? 'bg-brand-accent text-white' : 'bg-[rgb(var(--bg-primary))] hover:bg-[rgb(var(--bg-tertiary))]'}`}
                    >
                      <List className="w-4 h-4" />
                      <span className="hidden sm:inline">List</span>
                    </button>
                  </div>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="border border-[rgb(var(--border))] px-3 py-1.5 text-sm bg-[rgb(var(--bg-primary))] rounded-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 transition-all"
                  >
                    <option value="newest">Newest</option>
                    <option value="price_asc">Price: Low → High</option>
                    <option value="price_desc">Price: High → Low</option>
                  </select>
                </div>
              )}
            </div>

            {isMobile && !isLoading && (
              <div className="flex gap-2 overflow-x-auto pb-4 mb-4 -mx-4 px-4 scrollbar-hide">
                <button
                  onClick={() => handleCategoryClick(null)}
                  className={`flex-shrink-0 px-3 py-1.5 text-sm rounded-sm flex items-center gap-1.5 transition-all duration-150 ${
                    !categoryId 
                      ? 'bg-brand-accent text-white' 
                      : 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-secondary))]'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  All
                </button>
                {categories?.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`flex-shrink-0 px-3 py-1.5 text-sm rounded-sm flex items-center gap-1.5 transition-all duration-150 ${
                      categoryId === cat.id 
                        ? 'bg-brand-accent text-white' 
                        : 'bg-[rgb(var(--bg-tertiary))] text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-secondary))]'
                    }`}
                  >
                    {getCategoryIcon(cat.name)}
                    {cat.name}
                  </button>
                ))}
              </div>
            )}

            {viewMode === 'grid' ? (
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
                    <ProductCardGrid key={product.id} product={product} />
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {isLoading ? (
                  Array(6).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="w-32 h-32 flex-shrink-0" />
                      <div className="flex-1 space-y-3">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                      </div>
                    </div>
                  ))
                ) : data?.products?.length === 0 ? (
                  <EmptyState
                    title={search ? `No products match "${search}"` : "No products found"}
                    description="Try adjusting your filters or search terms"
                    action={search ? { label: "Clear Search", onClick: () => setSearchParams({}) } : undefined}
                  />
                ) : (
                  data?.products?.map((product: any) => (
                    <ProductCardList key={product.id} product={product} />
                  ))
                )}
              </div>
            )}

            {!isLoading && data && data.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => {
                    if (page > 1) {
                      const params = new URLSearchParams(searchParams);
                      params.set('page', String(page - 1));
                      setSearchParams(params);
                    }
                  }}
                  disabled={page === 1}
                  className="w-10 h-10 text-sm font-medium transition-all duration-150 rounded-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-tertiary))] active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => {
                      const params = new URLSearchParams(searchParams);
                      params.set('page', String(p));
                      setSearchParams(params);
                    }}
                    className={`w-10 h-10 text-sm font-medium transition-all duration-150 rounded-sm active:scale-95 ${
                      p === page
                        ? 'bg-brand-accent text-white shadow-md'
                        : 'bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-tertiary))]'
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => {
                    if (page < data.totalPages) {
                      const params = new URLSearchParams(searchParams);
                      params.set('page', String(page + 1));
                      setSearchParams(params);
                    }
                  }}
                  disabled={page === data.totalPages}
                  className="w-10 h-10 text-sm font-medium transition-all duration-150 rounded-sm flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-tertiary))] active:scale-95"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
