import { Link } from 'react-router-dom';
import { useWishlist, useRemoveFromWishlist } from '@/features/wishlist/hooks';
import { useAddToCart } from '@/features/cart/hooks';
import { useUIStore } from '@/stores/ui';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton, EmptyState } from '@/components/ui';

interface Product {
  id: string;
  name: string;
  slug: string;
  marketplacePrice: number;
  media?: { url: string }[];
  category?: { name: string };
}

export default function Wishlist() {
  const { data: wishlistItems = [], isLoading } = useWishlist();
  const removeWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();
  const addToast = useUIStore((s) => s.addToast);

  const productIds = wishlistItems.map((item: any) => item.productId);

  // Fetch product details for wishlist items
  const { data: products = [], isLoading: loadingProducts } = useQuery<Product[]>({
    queryKey: ['wishlistProducts', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return [];
      const results = await Promise.all(
        productIds.map((id: string) => api.get<Product>(`/products/by-id/${id}`).catch(() => null))
      );
      return results.filter(Boolean) as Product[];
    },
    enabled: productIds.length > 0,
  });

  if (isLoading || loadingProducts) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
      <h1 className="text-xl md:text-2xl font-bold mb-6">Wishlist Saya</h1>

      {products.length === 0 ? (
        <div className="bg-[rgb(var(--bg-primary))]">
          <EmptyState
            title="Wishlist kosong"
            description="Belum ada produk yang disimpan"
            action={{ label: "Jelajahi Produk", onClick: () => window.location.href = '/products' }}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div key={product.id} className="bg-[rgb(var(--bg-primary))] p-4 flex gap-4">
              <Link to={`/products/${product.slug}`} className="w-16 h-16 md:w-20 md:h-20 bg-[rgb(var(--bg-tertiary))] flex-shrink-0 flex items-center justify-center">
                {product.media?.[0]?.url ? (
                  <img src={product.media[0].url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[rgb(var(--text-muted))] text-xs">No img</span>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link to={`/products/${product.slug}`} className="font-medium hover:text-brand-accent text-sm md:text-base line-clamp-2 block">
                  {product.name}
                </Link>
                {product.category && (
                  <p className="text-xs text-[rgb(var(--text-muted))]">{product.category.name}</p>
                )}
                <p className="text-brand-accent font-bold mt-1 text-sm md:text-base whitespace-nowrap">
                  Rp {Number(product.marketplacePrice).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button
                  onClick={() => {
                    removeWishlist.mutate(product.id);
                    addToast('Dihapus dari wishlist', 'success');
                  }}
                  className="text-semantic-error text-xs touch-target rounded-sm"
                >
                  Hapus
                </button>
                <button
                  onClick={() => {
                    addToCart.mutate(
                      { productId: product.id, quantity: 1 },
                      {
                        onSuccess: () => addToast('Ditambahkan ke keranjang', 'success'),
                        onError: () => addToast('Gagal menambahkan', 'error'),
                      }
                    );
                  }}
                  className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 touch-target rounded-sm"
                >
                  + Keranjang
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
