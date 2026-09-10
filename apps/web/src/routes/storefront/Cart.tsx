import { Link } from 'react-router-dom';
import { useCart, useUpdateCartItem, useRemoveFromCart } from '@/features/cart/hooks';
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

  // Fetch product details for cart items
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
      <h1 className="text-xl md:text-2xl font-bold mb-6">Keranjang Belanja</h1>

      {cartItems.length === 0 ? (
        <div className="bg-[rgb(var(--bg-primary))]">
          <EmptyState
            title="Keranjang kosong"
            description="Tambahkan produk untuk mulai berbelanja"
            action={{ label: "Jelajahi Produk", onClick: () => window.location.href = '/products' }}
          />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cartItems.map((item: CartItem) => {
              const product = products[item.productId];
              if (!product) return null;
              const price = Number(product.marketplacePrice);
              return (
                <div key={item.id} className="bg-[rgb(var(--bg-primary))] p-4 flex gap-4">
                  <Link to={`/products/${product.slug}`} className="w-16 h-16 md:w-20 md:h-20 bg-[rgb(var(--bg-tertiary))] flex-shrink-0 flex items-center justify-center">
                    {product.media?.[0]?.url ? (
                      <img src={product.media[0].url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[rgb(var(--text-muted))] text-xs">No img</span>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${product.slug}`} className="font-medium hover:text-brand-accent text-xs md:text-sm line-clamp-2 block">
                      {product.name}
                    </Link>
                    {product.publisher && (
                      <p className="text-[10px] text-[rgb(var(--text-muted))] mt-0.5 flex items-center gap-1">
                        <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016A3.001 3.001 0 0021 9.349m-18 0V6a3 3 0 013-3h9a3 3 0 013 3v3.349" />
                        </svg>
                        <span className="truncate">{product.publisher.fullName}</span>
                      </p>
                    )}
                    <p className="text-brand-accent font-bold mt-1 text-xs md:text-sm whitespace-nowrap">Rp {price.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateItem.mutate({ id: item.id, quantity: Math.max(1, item.quantity - 1) })}
                        className="w-6 h-6 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-sm transition-colors"
                      >
                        -
                      </button>
                      <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
                        className="w-6 h-6 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-sm transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm whitespace-nowrap">Rp {(price * item.quantity).toLocaleString()}</p>
                      <button
                        onClick={() => {
                          removeItem.mutate(item.id);
                          addToast('Item dihapus dari keranjang', 'success');
                        }}
                        className="text-semantic-error text-xs mt-1 touch-target rounded-sm"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-[rgb(var(--bg-primary))] p-4 md:p-6 mt-6 md:sticky md:top-20">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg">Total</span>
              <span className="text-xl md:text-2xl font-bold text-brand-accent">Rp {total.toLocaleString()}</span>
            </div>
            <Link
              to="/checkout"
              className="block w-full bg-brand-accent text-white text-center py-3 font-semibold hover:bg-brand-accent-dark active:scale-[0.98] transition-all touch-target rounded-sm"
            >
              Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
