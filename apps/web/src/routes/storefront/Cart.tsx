import { Link } from 'react-router-dom';
import { useCart, useUpdateCartItem, useRemoveFromCart } from '@/features/cart/hooks';
import { useUIStore } from '@/stores/ui';
import { Skeleton, EmptyState, Button } from '@/components/ui';

export default function Cart() {
  const { data: items, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();
  const addToast = useUIStore((s) => s.addToast);

  const total = items?.reduce((sum: number, item: any) => {
    const price = item.variant ? Number(item.variant.marketplacePrice) : Number(item.product.marketplacePrice);
    return sum + price * item.quantity;
  }, 0) || 0;

  if (isLoading) {
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
      <h1 className="text-xl md:text-2xl font-bold mb-6">Shopping Cart</h1>

      {!items || items.length === 0 ? (
        <div className="bg-[rgb(var(--bg-primary))]">
          <EmptyState
            title="Your cart is empty"
            description="Add some products to get started"
            action={{ label: "Browse Products", onClick: () => window.location.href = '/products' }}
          />
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item: any) => {
              const price = item.variant ? Number(item.variant.marketplacePrice) : Number(item.product.marketplacePrice);
              return (
                <div key={item.id} className="bg-[rgb(var(--bg-primary))] p-4 flex gap-4">
                  <div className="w-16 h-16 md:w-20 md:h-20 bg-[rgb(var(--bg-tertiary))] flex-shrink-0 flex items-center justify-center">
                    {item.product.media?.[0]?.url ? (
                      <img src={item.product.media[0].url} alt="" className="w-full h-full object-cover" />
                    ) : <span className="text-[rgb(var(--text-muted))] text-xs">No img</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/products/${item.product.slug}`} className="font-medium hover:text-brand-accent text-sm md:text-base truncate block">
                      {item.product.name}
                    </Link>
                    {item.variant && <p className="text-xs text-[rgb(var(--text-muted))]">{Object.values(item.variant.variantFormData).join(' / ')}</p>}
                    <p className="text-brand-accent font-bold mt-1 text-sm md:text-base">Rp {price.toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity - 1 })}
                        className="w-8 h-8 border border-[rgb(var(--border))] flex items-center justify-center hover:bg-[rgb(var(--bg-tertiary))] touch-target"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })}
                        className="w-8 h-8 border border-[rgb(var(--border))] flex items-center justify-center hover:bg-[rgb(var(--bg-tertiary))] touch-target"
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">Rp {(price * item.quantity).toLocaleString()}</p>
                      <button
                        onClick={() => {
                          removeItem.mutate(item.id);
                          addToast('Item removed from cart', 'success');
                        }}
                        className="text-semantic-error text-xs mt-1 touch-target"
                      >
                        Remove
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
              className="block w-full bg-brand-accent text-white text-center py-3 font-semibold hover:bg-brand-accent-dark active:scale-[0.98] transition-all touch-target"
            >
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
