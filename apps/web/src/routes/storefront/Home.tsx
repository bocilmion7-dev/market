import { Link, useNavigate } from 'react-router-dom';
import { useHomepage } from '@/features/storefront/hooks';
import { useAddToCart } from '@/features/cart/hooks';
import SEOHead from '@/components/SEOHead';
import { Skeleton } from '@/components/ui';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useUIStore } from '@/stores/ui';

function getCategoryIcon(name: string): JSX.Element {
  const lower = name.toLowerCase();
  
  if (lower.includes('fashion') || lower.includes('pakaian')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    );
  }
  if (lower.includes('elektronik') || lower.includes('gadget')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
      </svg>
    );
  }
  if (lower.includes('makanan') || lower.includes('minuman') || lower.includes('food')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0 3.354 3.354 0 00-3 0 3.354 3.354 0 01-3 0L3 16.5m15-3.38a48.474 48.474 0 00-6-.37c-2.032 0-4.034.126-6 .37m12 0c.39.049.777.102 1.163.16 1.07.16 1.837 1.094 1.837 2.175v5.17c0 .621-.504 1.125-1.125 1.125H4.125A1.125 1.125 0 013 20.625v-5.17c0-1.08.768-2.014 1.837-2.174A47.78 47.78 0 016 13.12M12.265 3.11a.375.375 0 11-.53 0L12 2.845l.265.265z" />
      </svg>
    );
  }
  if (lower.includes('rumah') || lower.includes('dapur') || lower.includes('home')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
      </svg>
    );
  }
  if (lower.includes('kecantikan') || lower.includes('beauty')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    );
  }
  if (lower.includes('olahraga') || lower.includes('sport')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
      </svg>
    );
  }
  if (lower.includes('otomotif') || lower.includes('automotive')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5-2.25h7.5m-7.5 0H6.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125h7.5m-7.5 0v-3.375c0-.621.504-1.125 1.125-1.125H8.25v3.375m7.5-7.5h.008v.008H15.75V9zm-7.5 0h.008v.008H8.25V9z" />
      </svg>
    );
  }
  if (lower.includes('mainan') || lower.includes('hobi') || lower.includes('toy')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875S10.5 3.089 10.5 4.125c0 .369.128.713.349 1.003.215.283.401.604.401.959V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v.75c0 .355.186.676.401.959.221.29.349.634.349 1.003 0 1.036-1.007 1.875-2.25 1.875S0 10.089 0 11.125c0 .369.128.713.349 1.003.215.283.401.604.401.959V15a2.25 2.25 0 002.25 2.25h12a2.25 2.25 0 002.25-2.25v-2.083c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875S19 8.089 19 9.125c0 .369.128.713.349 1.003.215.283.401.604.401.959V15a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 15v-.75" />
      </svg>
    );
  }
  if (lower.includes('kesehatan') || lower.includes('health')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
      </svg>
    );
  }
  if (lower.includes('aksesoris') || lower.includes('accessory')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
      </svg>
    );
  }
  if (lower.includes('sepatu') || lower.includes('shoe')) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
      </svg>
    );
  }
  
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
    </svg>
  );
}

function BannerSlider({ banners }: { banners: any[] }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length);
  }, [banners.length]);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [banners.length, next]);

  if (!banners.length) return null;

  const banner = banners[current];
  const content = (
    <div className="relative w-full h-40 md:h-56 overflow-hidden">
      {banner.imageUrl ? (
        <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-brand-dark to-brand-accent" />
      )}
      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-4">
        {banner.title && <h2 className="text-xl md:text-3xl font-bold text-white mb-2">{banner.title}</h2>}
        {banner.subtitle && <p className="text-sm md:text-base text-gray-200">{banner.subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="relative">
      {banner.link ? <Link to={banner.link}>{content}</Link> : content}
      {banners.length > 1 && (
        <>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_: any, i: number) => (
              <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 transition-colors rounded-sm ${i === current ? 'bg-white' : 'bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function HorizontalProductScroll({ products, isLoading, emptyMessage, darkMode = false }: { products: any[]; isLoading: boolean; emptyMessage?: string; darkMode?: boolean }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 280;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array(4).fill(0).map((_, i) => (
          <div key={i} className="flex-shrink-0 w-[240px] space-y-3">
            <Skeleton className="h-40" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="text-center py-8 text-[rgb(var(--text-muted))]">
        {emptyMessage || 'No products available'}
      </div>
    );
  }

  return (
    <div className="relative group">
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[rgb(var(--bg-primary))] shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-sm"
      >
        ‹
      </button>
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} horizontal darkMode={darkMode} />
        ))}
      </div>
      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[rgb(var(--bg-primary))] shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-sm"
      >
        ›
      </button>
    </div>
  );
}

function ProductCard({ product, horizontal = false, darkMode = false }: { product: any; horizontal?: boolean; darkMode?: boolean }) {
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

  if (horizontal) {
    return (
      <Link
        to={`/products/${product.slug}`}
        className={`flex-shrink-0 w-[240px] overflow-hidden hover:shadow-md transition-shadow group/card rounded-sm ${darkMode ? 'bg-white' : 'bg-[rgb(var(--bg-primary))]'}`}
      >
        <div className="h-40 bg-[rgb(var(--bg-tertiary))] flex items-center justify-center relative">
          {product.media?.[0]?.url ? (
            <img src={product.media[0].url} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-[rgb(var(--text-muted))] text-sm">No Image</span>
          )}
        </div>
        <div className="p-3">
          <p className={`text-xs truncate ${darkMode ? 'text-blue-100' : 'text-[rgb(var(--text-muted))]'}`}>{product.category?.name}</p>
          <p className={`font-medium text-sm line-clamp-2 ${darkMode ? 'text-gray-900' : ''}`}>{product.name}</p>
          <p className="text-brand-accent font-bold mt-1 text-sm">
            Rp {Number(product.marketplacePrice).toLocaleString()}
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleAddToCart}
              disabled={addToCart.isPending}
              className="h-8 w-8 rounded-sm bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
            <button
              onClick={handleBuyNow}
              disabled={addToCart.isPending}
              className="flex-1 h-8 rounded-sm bg-brand-accent hover:bg-brand-accent-dark text-white text-xs font-medium transition-colors"
            >
              Beli
            </button>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="bg-[rgb(var(--bg-primary))] overflow-hidden hover:shadow-md transition-shadow group/card rounded-sm flex flex-col h-full"
    >
      <div className="h-48 bg-[rgb(var(--bg-tertiary))] flex items-center justify-center relative">
        {product.media?.[0]?.url ? (
          <img src={product.media[0].url} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <span className="text-[rgb(var(--text-muted))] text-sm">No Image</span>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-[rgb(var(--text-muted))]">{product.category?.name}</p>
        <p className="font-medium line-clamp-2 text-sm">{product.name}</p>
        {product.publisher?.cityId && (
          <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5 flex items-center gap-1">
            <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
            </svg>
            <span className="truncate">{product.publisher.address?.split(',').pop()?.trim() || product.publisher.cityId}</span>
          </p>
        )}
        <p className="text-brand-accent font-bold mt-auto pt-1.5 text-sm">
          Rp {Number(product.marketplacePrice).toLocaleString()}
        </p>
        <div className="flex gap-1.5 mt-2">
          <button
            onClick={handleAddToCart}
            disabled={addToCart.isPending}
            className="h-9 w-9 flex-shrink-0 rounded-sm bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
          <button
            onClick={handleBuyNow}
            disabled={addToCart.isPending}
            className="flex-1 h-9 rounded-sm bg-brand-accent hover:bg-brand-accent-dark text-white flex items-center justify-center transition-colors"
          >
            <span className="text-sm font-medium">Beli</span>
          </button>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const { data, isLoading } = useHomepage();

  return (
    <div>
      <SEOHead title="Home" description="Discover products from multiple publishers at great prices" />

      <section>
        {isLoading ? (
          <Skeleton className="h-40 md:h-56" />
        ) : data?.banners?.length > 0 ? (
          <BannerSlider banners={data.banners} />
        ) : (
          <div className="bg-gradient-to-r from-brand-dark to-brand-accent text-white py-10 md:py-14 text-center">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome to Marketplace</h1>
            <p className="text-gray-200">Discover products from multiple publishers</p>
          </div>
        )}
      </section>

      {/* Kategori Populer */}
      <section className="max-w-7xl mx-auto px-4 py-4 md:py-5">
        {isLoading ? (
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-6 w-40" />
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-brand-accent" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <h2 className="text-xl md:text-2xl font-bold">Kategori Populer</h2>
          </div>
        )}
        <div className="grid grid-cols-2 gap-px bg-[rgb(var(--border))] border border-[rgb(var(--border))]">
          {isLoading ? (
            Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-16 bg-[rgb(var(--bg-primary))]" />)
          ) : (
            data?.categories?.slice(0, 10).map((cat: any) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="bg-[rgb(var(--bg-primary))] px-4 py-3 flex items-center gap-3 hover:bg-[rgb(var(--bg-secondary))] transition-colors"
              >
                <span className="text-brand-accent">
                  {getCategoryIcon(cat.name)}
                </span>
                <span className="text-sm font-medium truncate">{cat.name}</span>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* Produk Terkini - di atas */}
      {isLoading ? (
        <section className="max-w-7xl mx-auto px-4 py-4 md:py-5">
          <div className="flex justify-between items-center mb-3">
            <Skeleton className="h-6 w-40" />
          </div>
          <HorizontalProductScroll products={[]} isLoading={true} emptyMessage="" />
        </section>
      ) : (
        <section className="max-w-7xl mx-auto md:px-4 py-4 md:py-5 bg-blue-900 mb-4">
          <div className="flex justify-between items-center mb-3 px-4 md:px-0">
            <h2 className="text-xl md:text-2xl font-bold text-white">Produk Terkini</h2>
            <Link to="/products" className="text-white hover:underline text-sm md:text-base font-medium">
              Lihat Semua →
            </Link>
          </div>
          <HorizontalProductScroll
            products={data?.latestProducts || []}
            isLoading={false}
            emptyMessage="Belum ada produk terkini"
            darkMode
          />
        </section>
      )}

      {/* Produk Terlaris */}
      {isLoading ? (
        <section className="max-w-7xl mx-auto px-4 py-4 md:py-5">
          <div className="flex justify-between items-center mb-3">
            <Skeleton className="h-6 w-40" />
          </div>
          <HorizontalProductScroll products={[]} isLoading={true} emptyMessage="" />
        </section>
      ) : (
        <section className="max-w-7xl mx-auto md:px-4 py-4 md:py-5 bg-orange-500">
          <div className="flex justify-between items-center mb-3 px-4 md:px-0">
            <h2 className="text-xl md:text-2xl font-bold text-white">Produk Terlaris</h2>
            <Link to="/products?sort=bestselling" className="text-white hover:underline text-sm md:text-base font-medium">
              Lihat semua →
            </Link>
          </div>
          <HorizontalProductScroll
            products={data?.bestsellingProducts || []}
            isLoading={false}
            emptyMessage="Belum ada produk terlaris"
            darkMode
          />
        </section>
      )}

      {/* Produk Utama (40 Random) */}
      {isLoading ? (
        <section className="max-w-7xl mx-auto px-4 py-4 md:py-5">
          <div className="flex justify-between items-center mb-3">
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-stretch">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-48" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section className="max-w-7xl mx-auto px-4 py-4 md:py-5">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl md:text-2xl font-bold">Produk Pilihan</h2>
            <Link to="/products" className="text-brand-accent hover:underline text-sm md:text-base font-medium">
              Lihat Semua →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-stretch">
            {data?.randomProducts?.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
