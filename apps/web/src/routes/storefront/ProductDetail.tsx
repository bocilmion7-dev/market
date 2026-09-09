import { useParams, Link } from 'react-router-dom';
import { useProductBySlug } from '@/features/storefront/hooks';
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from '@/features/wishlist/hooks';
import { useAddToCart } from '@/features/cart/hooks';
import { useAuthStore } from '@/stores/auth';
import SEOHead from '@/components/SEOHead';
import { Skeleton, Badge, Button } from '@/components/ui';
import { useState } from 'react';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProductBySlug(slug || '');
  const { data: wishlist } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();
  const [selectedImage, setSelectedImage] = useState(0);
  const user = useAuthStore((s) => s.user);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2"><Skeleton className="aspect-square rounded-lg" /></div>
          <div className="w-full md:w-1/2 space-y-4">
            <Skeleton className="h-4 w-1/4" /><Skeleton className="h-8 w-3/4" /><Skeleton className="h-6 w-1/3" /><Skeleton className="h-20" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-2">Product not found</h1>
        <p className="text-[rgb(var(--text-muted))] mb-4">This product doesn't exist or was removed.</p>
        <Link to="/products" className="text-brand-accent hover:underline">Browse Products →</Link>
      </div>
    );
  }

  const isWishlisted = Array.isArray(wishlist) && wishlist.some((w: any) => w.productId === product.id);

  const handleAddToCart = () => {
    addToCart.mutate({ productId: product.id, quantity: 1 });
  };

  const handleWishlist = () => {
    if (!user) { window.location.href = '/login'; return; }
    isWishlisted ? removeFromWishlist.mutate(product.id) : addToWishlist.mutate(product.id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
      <SEOHead title={product.name} description={product.description?.substring(0, 160)} image={product.media?.[0]?.url} />

      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <div className="w-full md:w-1/2">
          <div className="bg-[rgb(var(--bg-primary))] rounded-lg overflow-hidden aspect-square flex items-center justify-center">
            {product.media?.[selectedImage]?.url ? (
              <img src={product.media[selectedImage].url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-[rgb(var(--text-muted))] text-lg">No Image</span>
            )}
          </div>
          {product.media?.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
              {product.media.map((m: any, i: number) => (
                <button key={i} onClick={() => setSelectedImage(i)} className={`w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 ${selectedImage === i ? 'border-brand-accent' : 'border-transparent'}`}>
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2">
          <p className="text-sm text-[rgb(var(--text-muted))] mb-2">
            <Link to={`/products?categoryId=${product.category?.id}`} className="hover:text-brand-accent">{product.category?.name}</Link>
            {product.brand && <span> · {product.brand.name}</span>}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-2xl md:text-3xl font-bold text-brand-accent">Rp {Number(product.marketplacePrice).toLocaleString()}</span>
            {product.bestPrice !== product.marketplacePrice && (
              <span className="text-lg text-[rgb(var(--text-muted))] line-through">Rp {Number(product.bestPrice).toLocaleString()}</span>
            )}
          </div>

          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1">
              {Array(5).fill(0).map((_, i) => (
                <span key={i} className={i < Math.round(product.avgRating || 0) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
              ))}
              <span className="text-sm text-[rgb(var(--text-muted))] ml-1">({product.reviewCount || 0})</span>
            </div>
          </div>

          <div className="bg-[rgb(var(--bg-secondary))] rounded-lg p-4 mb-6">
            <p className="text-sm text-[rgb(var(--text-muted))]">Seller</p>
            <p className="font-medium">{product.publisher?.fullName}</p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <p className="text-sm text-[rgb(var(--text-muted))]">Stock</p>
              <p className={product.stock > 0 ? 'text-semantic-success' : 'text-semantic-error'}>
                {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
              </p>
            </div>
            {product.variants?.length > 0 && (
              <div>
                <p className="text-sm text-[rgb(var(--text-muted))] mb-2">Variants ({product.variants.length})</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <Badge key={v.id} variant="default">
                      {Object.values(v.variantFormData).join(' / ')} — Rp {Number(v.marketplacePrice).toLocaleString()}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <Button disabled={product.stock <= 0 || addToCart.isPending} className="flex-1" onClick={handleAddToCart}>
              {addToCart.isPending ? 'Adding...' : product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            <Button variant="outline" onClick={handleWishlist}>
              {isWishlisted ? '♥' : '♡'}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8 md:mt-12">
        <h2 className="text-xl font-bold mb-4">Description</h2>
        <div className="bg-[rgb(var(--bg-primary))] rounded-lg p-4 md:p-6 prose max-w-none text-sm md:text-base">{product.description}</div>
      </div>

      {product.relatedProducts?.length > 0 && (
        <div className="mt-8 md:mt-12">
          <h2 className="text-xl font-bold mb-4">Related Products</h2>
          <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto pb-4 -mx-4 px-4">
            {product.relatedProducts.map((rp: any) => (
              <Link key={rp.id} to={`/products/${rp.slug}`} className="bg-[rgb(var(--bg-primary))] rounded-lg overflow-hidden hover:shadow-md transition-shadow flex-shrink-0 w-40 md:w-auto">
                <div className="h-32 md:h-40 bg-[rgb(var(--bg-tertiary))] flex items-center justify-center">
                  {rp.media?.[0]?.url ? <img src={rp.media[0].url} alt="" className="h-full w-full object-cover" /> : <span className="text-[rgb(var(--text-muted))] text-sm">No Image</span>}
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm truncate">{rp.name}</p>
                  <p className="text-brand-accent font-bold text-sm">Rp {Number(rp.marketplacePrice).toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
