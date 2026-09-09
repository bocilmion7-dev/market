import { Link } from 'react-router-dom';
import { useHomepage } from '@/features/storefront/hooks';
import SEOHead from '@/components/SEOHead';
import { Skeleton } from '@/components/ui';
import { useState, useEffect, useCallback } from 'react';

function getCategoryIcon(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('fashion')) return '👕';
  if (lower.includes('elektronik')) return '📱';
  if (lower.includes('makanan') || lower.includes('minuman')) return '🍜';
  if (lower.includes('rumah') || lower.includes('dapur')) return '🏠';
  if (lower.includes('kecantikan')) return '💄';
  return '📦';
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
          <button onClick={() => setCurrent((c) => (c - 1 + banners.length) % banners.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-8 h-8 flex items-center justify-center">‹</button>
          <button onClick={() => setCurrent((c) => (c + 1) % banners.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white w-8 h-8 flex items-center justify-center">›</button>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {banners.map((_: any, i: number) => (
              <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 transition-colors ${i === current ? 'bg-white' : 'bg-white/50'}`} />
            ))}
          </div>
        </>
      )}
    </div>
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

      <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24" />)
          ) : (
            data?.categories?.map((cat: any) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="bg-[rgb(var(--bg-primary))] p-4 flex flex-col items-center justify-center gap-2 hover:shadow-md transition-shadow touch-target h-24"
              >
                <span className="text-2xl">{getCategoryIcon(cat.name)}</span>
                <p className="font-medium text-xs md:text-sm text-center leading-tight">{cat.name}</p>
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold">Latest Products</h2>
          <Link to="/products" className="text-brand-accent hover:underline text-sm md:text-base">View All →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="h-40 md:h-48" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))
          ) : (
            data?.featuredProducts?.map((product: any) => (
              <Link
                key={product.id}
                to={`/products/${product.slug}`}
                className="bg-[rgb(var(--bg-primary))] overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="h-32 md:h-48 bg-[rgb(var(--bg-tertiary))] flex items-center justify-center">
                  {product.media?.[0]?.url ? (
                    <img src={product.media[0].url} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[rgb(var(--text-muted))] text-sm">No Image</span>
                  )}
                </div>
                <div className="p-3 md:p-4">
                  <p className="text-xs text-[rgb(var(--text-muted))]">{product.category?.name}</p>
                  <p className="font-medium truncate text-sm md:text-base">{product.name}</p>
                  <p className="text-brand-accent font-bold mt-1 text-sm md:text-base">
                    Rp {Number(product.marketplacePrice).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
