import { Link, useNavigate } from 'react-router-dom';
import { useHomepage } from '@/features/storefront/hooks';
import { useAddToCart } from '@/features/cart/hooks';
import SEOHead from '@/components/SEOHead';
import { Skeleton, PageTransition } from '@/components/ui';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useUIStore } from '@/stores/ui';
import {
  Star, ShoppingCart, Zap, MapPin, ChevronLeft, ChevronRight,
  ShoppingBag, Smartphone, Coffee, Home as HomeIcon, Sparkles, Trophy,
  Car, Gamepad, Heart, Watch, Footprints, Package, LayoutGrid, List
} from 'lucide-react';

function getCategoryIcon(name: string): JSX.Element {
  const lower = name.toLowerCase();
  const iconClass = "w-5 h-5";

  if (lower.includes('fashion') || lower.includes('pakaian')) return <ShoppingBag className={iconClass} />;
  if (lower.includes('elektronik') || lower.includes('gadget')) return <Smartphone className={iconClass} />;
  if (lower.includes('makanan') || lower.includes('minuman') || lower.includes('food')) return <Coffee className={iconClass} />;
  if (lower.includes('rumah') || lower.includes('dapur') || lower.includes('home')) return <HomeIcon className={iconClass} />;
  if (lower.includes('kecantikan') || lower.includes('beauty')) return <Sparkles className={iconClass} />;
  if (lower.includes('olahraga') || lower.includes('sport')) return <Trophy className={iconClass} />;
  if (lower.includes('otomotif') || lower.includes('automotive')) return <Car className={iconClass} />;
  if (lower.includes('mainan') || lower.includes('hobi') || lower.includes('toy')) return <Gamepad className={iconClass} />;
  if (lower.includes('kesehatan') || lower.includes('health')) return <Heart className={iconClass} />;
  if (lower.includes('aksesoris') || lower.includes('accessory')) return <Watch className={iconClass} />;
  if (lower.includes('sepatu') || lower.includes('shoe')) return <Footprints className={iconClass} />;
  return <Package className={iconClass} />;
}

function BannerSlider({ banners }: { banners: any[] }) {
  const [current, setCurrent] = useState(0);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % banners.length);
  }, [banners.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + banners.length) % banners.length);
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
        <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover transition-transform duration-500" />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-brand-dark to-brand-accent" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col items-center justify-end pb-8 text-center px-4">
        {banner.title && <h2 className="text-xl md:text-3xl font-bold text-white mb-2 animate-fade-in-up">{banner.title}</h2>}
        {banner.subtitle && <p className="text-sm md:text-base text-gray-200 animate-fade-in-up animation-delay-100">{banner.subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="relative group">
      {banner.link ? <Link to={banner.link}>{content}</Link> : content}
      {banners.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full backdrop-blur-sm"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/30 hover:bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full backdrop-blur-sm"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_: any, i: number) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/70'
                }`}
              />
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
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[rgb(var(--bg-primary))] shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full hover:scale-110"
      >
        <ChevronLeft className="w-5 h-5" />
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
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-[rgb(var(--bg-primary))] shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full hover:scale-110"
      >
        <ChevronRight className="w-5 h-5" />
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
        className={`flex-shrink-0 w-[240px] overflow-hidden hover:shadow-lg transition-all duration-300 group/card rounded-sm ${darkMode ? 'bg-white' : 'bg-[rgb(var(--bg-primary))]'} hover:-translate-y-1`}
      >
        <div className="h-40 bg-[rgb(var(--bg-tertiary))] flex items-center justify-center relative overflow-hidden">
          {product.media?.[0]?.url ? (
            <img src={product.media[0].url} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105" />
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
              className="h-8 w-8 rounded-sm bg-brand-accent hover:bg-brand-accent-dark text-white flex items-center justify-center transition-all duration-150 active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
            <button
              onClick={handleBuyNow}
              disabled={addToCart.isPending}
              className="flex-1 h-8 rounded-sm bg-brand-accent hover:bg-brand-accent-dark text-white text-xs font-medium transition-all duration-150 active:scale-95"
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
      className="bg-[rgb(var(--bg-primary))] overflow-hidden hover:shadow-lg transition-all duration-300 group/card rounded-sm flex flex-col h-full hover:-translate-y-1"
    >
      <div className="h-48 bg-[rgb(var(--bg-tertiary))] flex items-center justify-center relative overflow-hidden">
        {product.media?.[0]?.url ? (
          <img src={product.media[0].url} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105" />
        ) : (
          <span className="text-[rgb(var(--text-muted))] text-sm">No Image</span>
        )}
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-[rgb(var(--text-muted))]">{product.category?.name}</p>
        <p className="font-medium line-clamp-2 text-sm">{product.name}</p>
        {product.publisher?.cityId && (
          <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 flex-shrink-0" />
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
            className="h-9 w-9 flex-shrink-0 rounded-sm bg-brand-accent hover:bg-brand-accent-dark text-white flex items-center justify-center transition-all duration-150 active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
          <button
            onClick={handleBuyNow}
            disabled={addToCart.isPending}
            className="flex-1 h-9 rounded-sm bg-brand-accent hover:bg-brand-accent-dark text-white flex items-center justify-center transition-all duration-150 active:scale-95"
          >
            <span className="text-sm font-medium">Beli</span>
          </button>
        </div>
      </div>
    </Link>
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
        <div className="w-28 h-28 md:w-32 md:h-32 bg-[rgb(var(--bg-tertiary))] flex items-center justify-center overflow-hidden">
          {product.media?.[0]?.url ? (
            <img src={product.media[0].url} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          ) : (
            <span className="text-[rgb(var(--text-muted))] text-xs">No Image</span>
          )}
        </div>
      </Link>
      <div className="p-3 flex flex-col flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-[rgb(var(--text-muted))]">{product.category?.name}</p>
            <Link to={`/products/${product.slug}`}>
              <p className="font-medium line-clamp-2 text-sm">{product.name}</p>
            </Link>
          </div>
          <p className="text-brand-accent font-bold text-sm whitespace-nowrap">
            Rp {Number(product.marketplacePrice).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2 mt-auto pt-2">
          <button
            onClick={handleAddToCart}
            disabled={addToCart.isPending}
            className="h-8 w-8 flex-shrink-0 rounded-sm bg-brand-accent hover:bg-brand-accent-dark text-white flex items-center justify-center transition-all duration-150 active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
          </button>
          <button
            onClick={handleBuyNow}
            disabled={addToCart.isPending}
            className="flex-1 h-8 rounded-sm bg-brand-accent hover:bg-brand-accent-dark text-white text-xs font-medium transition-all duration-150 active:scale-95"
          >
            Beli
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data, isLoading } = useHomepage();
  const [featuredView, setFeaturedView] = useState<'grid' | 'list'>('grid');

  return (
    <PageTransition>
      <div>
        <SEOHead title="Home" description="Discover products from multiple publishers at great prices" />

        <section>
          {isLoading ? (
            <Skeleton className="h-40 md:h-56" />
          ) : data?.banners?.length > 0 ? (
            <BannerSlider banners={data.banners} />
          ) : (
            <div className="bg-gradient-to-r from-brand-dark to-brand-accent text-white py-10 md:py-14 text-center">
              <h1 className="text-2xl md:text-3xl font-bold mb-2 animate-fade-in-up">Welcome to Marketplace</h1>
              <p className="text-gray-200 animate-fade-in-up animation-delay-100">Discover products from multiple publishers</p>
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
              <Star className="w-5 h-5 text-brand-accent fill-brand-accent" />
              <h2 className="text-xl md:text-2xl font-bold">Kategori Populer</h2>
            </div>
          )}
          <div className="grid grid-cols-2 gap-px bg-[rgb(var(--border))] border border-[rgb(var(--border))]">
            {isLoading ? (
              Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-16 bg-[rgb(var(--bg-primary))]" />)
            ) : (
              data?.categories?.slice(0, 10).map((cat: any, index: number) => (
                <Link
                  key={cat.id}
                  to={`/products?categoryId=${cat.id}`}
                  className="bg-[rgb(var(--bg-primary))] px-4 py-3 flex items-center gap-3 hover:bg-[rgb(var(--bg-secondary))] transition-all duration-200 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className="text-brand-accent group-hover:scale-110 transition-transform duration-200">
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
          <section className="max-w-7xl mx-auto md:px-4 py-4 md:py-5 bg-gradient-to-r from-blue-900 to-blue-800 mb-4">
            <div className="flex justify-between items-center mb-3 px-4 md:px-0">
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-400" />
                Produk Terkini
              </h2>
              <Link to="/products" className="text-white hover:text-blue-200 text-sm md:text-base font-medium flex items-center gap-1 transition-colors">
                Lihat Semua <ChevronRight className="w-4 h-4" />
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
          <section className="max-w-7xl mx-auto md:px-4 py-4 md:py-5 bg-gradient-to-r from-orange-500 to-orange-600">
            <div className="flex justify-between items-center mb-3 px-4 md:px-0">
              <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <Trophy className="w-6 h-6 text-yellow-300" />
                Produk Terlaris
              </h2>
              <Link to="/products?sort=bestselling" className="text-white hover:text-orange-100 text-sm md:text-base font-medium flex items-center gap-1 transition-colors">
                Lihat semua <ChevronRight className="w-4 h-4" />
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
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-brand-accent" />
                Produk Pilihan
              </h2>
              <Link to="/products" className="text-brand-accent hover:text-brand-accent-dark text-sm md:text-base font-medium flex items-center gap-1 transition-colors">
                Lihat Semua <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="flex justify-end mb-3">
              <div className="flex items-center border border-[rgb(var(--border))] rounded-sm overflow-hidden">
                <button
                  onClick={() => setFeaturedView('grid')}
                  className={`px-3 py-1.5 text-sm transition-colors flex items-center gap-1 ${featuredView === 'grid' ? 'bg-brand-accent text-white' : 'bg-[rgb(var(--bg-primary))] hover:bg-[rgb(var(--bg-tertiary))]'}`}
                >
                  <LayoutGrid className="w-4 h-4" />
                  <span>Grid</span>
                </button>
                <button
                  onClick={() => setFeaturedView('list')}
                  className={`px-3 py-1.5 text-sm transition-colors flex items-center gap-1 ${featuredView === 'list' ? 'bg-brand-accent text-white' : 'bg-[rgb(var(--bg-primary))] hover:bg-[rgb(var(--bg-tertiary))]'}`}
                >
                  <List className="w-4 h-4" />
                  <span>List</span>
                </button>
              </div>
            </div>
            {featuredView === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-stretch">
                {data?.randomProducts?.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {data?.randomProducts?.map((product: any) => (
                  <ProductCardList key={product.id} product={product} />
                ))}
              </div>
            )}
          </section>
        )}
      </div>
    </PageTransition>
  );
}
