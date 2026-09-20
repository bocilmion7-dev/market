import { Link } from 'react-router-dom';
import { useWishlist, useRemoveFromWishlist } from '@/features/wishlist/hooks';
import { useAddToCart } from '@/features/cart/hooks';
import { useUIStore } from '@/stores/ui';
import { Skeleton, EmptyState, PageTransition } from '@/components/ui';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';

export default function Wishlist() {
  const { data: wishlistItems = [], isLoading } = useWishlist();
  const removeWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();
  const addToast = useUIStore((s) => s.addToast);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array(4).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-sm bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <Heart className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Wishlist Saya</h1>
            <p className="text-sm text-[rgb(var(--text-muted))]">{wishlistItems.length} produk tersimpan</p>
          </div>
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-[rgb(var(--bg-primary))] rounded-sm border border-[rgb(var(--border))]">
            <EmptyState
              title="Wishlist kosong"
              description="Belum ada produk yang disimpan"
              action={{ label: "Jelajahi Produk", onClick: () => window.location.href = '/products' }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {wishlistItems.map((item: any) => {
              const product = item.product;
              if (!product) return null;
              return (
                <div key={item.id} className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm p-4 flex gap-4 hover:shadow-md transition-shadow group">
                  <Link to={`/products/${product.slug}`} className="w-24 h-24 md:w-28 md:h-28 bg-[rgb(var(--bg-tertiary))] flex-shrink-0 flex items-center justify-center overflow-hidden rounded-sm">
                    {product.media?.[0]?.url ? (
                      <img src={product.media[0].url} alt="" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                      <span className="text-[rgb(var(--text-muted))] text-xs">No img</span>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0 flex flex-col">
                    <Link to={`/products/${product.slug}`} className="font-medium hover:text-brand-accent text-sm md:text-base line-clamp-2">
                      {product.name}
                    </Link>
                    {product.category && (
                      <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{product.category.name}</p>
                    )}
                    <p className="text-brand-accent font-bold mt-1 text-sm md:text-base">
                      Rp {Number(product.marketplacePrice).toLocaleString()}
                    </p>
                    <div className="flex gap-2 mt-auto pt-3">
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
                        className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-brand-accent hover:bg-brand-accent-dark text-white text-xs font-medium rounded-sm transition-colors active:scale-95"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Keranjang
                      </button>
                      <button
                        onClick={() => {
                          removeWishlist.mutate(product.id);
                          addToast('Dihapus dari wishlist', 'success');
                        }}
                        className="h-9 w-9 flex items-center justify-center text-[rgb(var(--text-muted))] hover:text-semantic-error hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
