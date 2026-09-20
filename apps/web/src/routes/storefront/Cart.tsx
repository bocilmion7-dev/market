import { Link } from 'react-router-dom';
import { useCart, useUpdateCartItem, useRemoveFromCart } from '@/features/cart/hooks';
import { useUIStore } from '@/stores/ui';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Skeleton, EmptyState, PageTransition } from '@/components/ui';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, Store } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  marketplacePrice: number;
  media?: { url: string }[];
  publisher?: { fullName: string; cityId?: string };
}

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  variantId?: string;
}

export default function Cart() {
  const { data: items = [], isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const addToast = useUIStore((s) => s.addToast);

  const cartItems = Array.isArray(items) ? items : [];
  const productIds = cartItems.map((item: CartItem) => item.productId);

  const { data: products = {}, isLoading: loadingProducts } = useQuery<Record<string, Product>>({
    queryKey: ['cartProducts', productIds],
    queryFn: async () => {
      if (productIds.length === 0) return {};
      const results = await Promise.all(
        productIds.map((id: string) => api.get<Product>(`/products/by-id/${id}`).catch(() => null))
      );
      const map: Record<string, Product> = {};
      results.forEach((p) => { if (p) map[p.id] = p; });
      return map;
    },
    enabled: productIds.length > 0,
  });

  const total = cartItems.reduce((sum: number, item: CartItem) => {
    const product = products[item.productId];
    const price = product ? Number(product.marketplacePrice) : 0;
    return sum + price * item.quantity;
  }, 0);

  const totalItems = cartItems.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  if (isLoading || loadingProducts) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            {Array(3).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto px-4 py-6 md:py-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-sm bg-brand-accent/10 flex items-center justify-center">
            <ShoppingCart className="w-5 h-5 text-brand-accent" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Keranjang Belanja</h1>
            <p className="text-sm text-[rgb(var(--text-muted))]">{totalItems} item</p>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-[rgb(var(--bg-primary))] rounded-sm border border-[rgb(var(--border))]">
            <EmptyState
              title="Keranjang kosong"
              description="Tambahkan produk untuk mulai berbelanja"
              action={{ label: "Jelajahi Produk", onClick: () => window.location.href = '/products' }}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-3">
              {cartItems.map((item: CartItem) => {
                const product = products[item.productId];
                if (!product) return null;
                const price = Number(product.marketplacePrice);
                return (
                  <div key={item.id} className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm p-4 flex gap-4 hover:shadow-md transition-shadow">
                    <Link to={`/products/${product.slug}`} className="w-20 h-20 md:w-24 md:h-24 bg-[rgb(var(--bg-tertiary))] flex-shrink-0 flex items-center justify-center overflow-hidden rounded-sm">
                      {product.media?.[0]?.url ? (
                        <img src={product.media[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[rgb(var(--text-muted))] text-xs">No img</span>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0 flex flex-col">
                      <Link to={`/products/${product.slug}`} className="font-medium hover:text-brand-accent text-sm md:text-base line-clamp-2">
                        {product.name}
                      </Link>
                      {product.publisher && (
                        <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5 flex items-center gap-1">
                          <Store className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{product.publisher.fullName}</span>
                        </p>
                      )}
                      <div className="mt-auto pt-2 flex items-end justify-between">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => updateItem.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                            className="w-7 h-7 flex items-center justify-center bg-[rgb(var(--bg-tertiary))] hover:bg-brand-accent hover:text-white text-[rgb(var(--text-secondary))] rounded-sm transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
                            className="w-7 h-7 flex items-center justify-center bg-[rgb(var(--bg-tertiary))] hover:bg-brand-accent hover:text-white text-[rgb(var(--text-secondary))] rounded-sm transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <p className="font-bold text-brand-accent text-sm md:text-base whitespace-nowrap">Rp {(price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        removeItem.mutate(item.id);
                        addToast('Item dihapus dari keranjang', 'success');
                      }}
                      className="self-start p-1.5 text-[rgb(var(--text-muted))] hover:text-semantic-error hover:bg-red-50 dark:hover:bg-red-900/20 rounded-sm transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="md:col-span-1">
              <div className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm p-5 md:sticky md:top-20">
                <h3 className="font-bold mb-4">Ringkasan</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-[rgb(var(--text-muted))]">Item ({totalItems})</span>
                    <span>Rp {total.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[rgb(var(--text-muted))]">Ongkos Kirim</span>
                    <span className="text-[rgb(var(--text-muted))]">Dihitung saat checkout</span>
                  </div>
                  <div className="border-t border-[rgb(var(--border))] pt-3 flex justify-between">
                    <span className="font-bold">Total</span>
                    <span className="text-lg font-bold text-brand-accent">Rp {total.toLocaleString()}</span>
                  </div>
                </div>
                <Link
                  to="/checkout"
                  className="flex items-center justify-center gap-2 w-full bg-brand-accent text-white py-3 font-semibold hover:bg-brand-accent-dark active:scale-[0.98] transition-all rounded-sm"
                >
                  Checkout
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/products"
                  className="flex items-center justify-center gap-2 w-full mt-3 py-2.5 text-sm text-brand-accent hover:bg-[rgb(var(--bg-secondary))] rounded-sm transition-colors"
                >
                  <Store className="w-4 h-4" />
                  Lanjut Belanja
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
