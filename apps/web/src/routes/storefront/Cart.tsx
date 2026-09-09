import { Link } from 'react-router-dom';
import { useCart, useUpdateCartItem, useRemoveFromCart } from '@/features/cart/hooks';

export default function Cart() {
  const { data: items, isLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveFromCart();

  const total = items?.reduce((sum: number, item: any) => {
    const price = item.variant ? Number(item.variant.marketplacePrice) : Number(item.product.marketplacePrice);
    return sum + price * item.quantity;
  }, 0) || 0;

  if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-12 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Shopping Cart</h1>

      {!items || items.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Link to="/products" className="text-brand-accent hover:underline">Browse Products</Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item: any) => {
              const price = item.variant ? Number(item.variant.marketplacePrice) : Number(item.product.marketplacePrice);
              return (
                <div key={item.id} className="bg-white rounded-lg p-4 flex gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                    {item.product.media?.[0]?.url ? (
                      <img src={item.product.media[0].url} alt="" className="w-full h-full object-cover rounded" />
                    ) : <span className="text-gray-400 text-xs">No img</span>}
                  </div>
                  <div className="flex-1">
                    <Link to={`/products/${item.product.slug}`} className="font-medium hover:text-brand-accent">{item.product.name}</Link>
                    {item.variant && <p className="text-sm text-gray-500">{Object.values(item.variant.variantFormData).join(' / ')}</p>}
                    <p className="text-brand-accent font-bold mt-1">Rp {price.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity - 1 })} className="w-8 h-8 border rounded">-</button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button onClick={() => updateItem.mutate({ id: item.id, quantity: item.quantity + 1 })} className="w-8 h-8 border rounded">+</button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">Rp {(price * item.quantity).toLocaleString()}</p>
                    <button onClick={() => removeItem.mutate(item.id)} className="text-red-500 text-sm mt-2">Remove</button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-white rounded-lg p-6 mt-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg">Total</span>
              <span className="text-2xl font-bold text-brand-accent">Rp {total.toLocaleString()}</span>
            </div>
            <Link to="/checkout" className="block w-full bg-brand-accent text-white text-center py-3 rounded-lg font-semibold hover:bg-brand-accent-dark">
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}