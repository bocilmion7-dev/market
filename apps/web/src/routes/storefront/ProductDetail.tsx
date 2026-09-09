import { useParams, Link } from 'react-router-dom';
import { useProductBySlug } from '@/features/storefront/hooks';
import { useAddToWishlist, useRemoveFromWishlist, useWishlist } from '@/features/wishlist/hooks';
import SEOHead from '@/components/SEOHead';

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProductBySlug(slug || '');
  const { data: wishlist } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 py-12 text-center">Loading...</div>;
  if (!product) return <div className="max-w-7xl mx-auto px-4 py-12 text-center text-gray-500">Product not found</div>;

  const isWishlisted = Array.isArray(wishlist) && wishlist.some((w: any) => w.productId === product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEOHead
        title={product.name}
        description={product.description?.substring(0, 160)}
        image={product.media?.[0]?.url}
      />
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2">
          <div className="bg-white rounded-lg overflow-hidden aspect-square flex items-center justify-center">
            {product.media?.[0]?.url ? (
              <img src={product.media[0].url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-lg">No Image</span>
            )}
          </div>
          {product.media?.length > 1 && (
            <div className="flex gap-2 mt-4">
              {product.media.map((m: any, i: number) => (
                <div key={i} className="w-16 h-16 bg-white rounded border-2 border-brand-accent overflow-hidden">
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-full md:w-1/2">
          <p className="text-sm text-gray-500 mb-2">
            <Link to={`/products?categoryId=${product.category?.id}`} className="hover:text-brand-accent">{product.category?.name}</Link>
            {product.brand && <span> · {product.brand.name}</span>}
          </p>
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>

          <div className="flex items-center gap-4 mb-4">
            <span className="text-3xl font-bold text-brand-accent">Rp {Number(product.marketplacePrice).toLocaleString()}</span>
            {product.bestPrice !== product.marketplacePrice && (
              <span className="text-lg text-gray-400 line-through">Rp {Number(product.bestPrice).toLocaleString()}</span>
            )}
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              {Array(5).fill(0).map((_, i) => (
                <span key={i} className={i < Math.round(product.avgRating || 0) ? 'text-yellow-400' : 'text-gray-300'}>★</span>
              ))}
              <span className="text-sm text-gray-500 ml-1">({product.reviewCount || 0})</span>
            </div>
          </div>

          <div className="bg-brand-muted rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">Seller</p>
            <p className="font-medium">{product.publisher?.fullName}</p>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <p className="text-sm text-gray-500">Stock</p>
              <p className={product.stock > 0 ? 'text-green-600' : 'text-red-500'}>
                {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
              </p>
            </div>
            {product.variants?.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Variants ({product.variants.length})</p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <span key={v.id} className="px-3 py-1 bg-white border rounded-full text-sm">
                      {Object.values(v.variantFormData).join(' / ')} — Rp {Number(v.marketplacePrice).toLocaleString()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <button disabled={product.stock <= 0} className="flex-1 bg-brand-accent text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-accent-dark transition-colors">
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
            <button
              onClick={() => isWishlisted ? removeFromWishlist.mutate(product.id) : addToWishlist.mutate(product.id)}
              className="border px-4 py-3 rounded-lg hover:bg-gray-50"
            >
              {isWishlisted ? '♥ Wishlisted' : '♡ Add to Wishlist'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-bold mb-4">Description</h2>
        <div className="bg-white rounded-lg p-6 prose max-w-none">
          {product.description}
        </div>
      </div>

      {product.relatedProducts?.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-4">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {product.relatedProducts.map((rp: any) => (
              <Link key={rp.id} to={`/products/${rp.slug}`} className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-gray-200 flex items-center justify-center">
                  {rp.media?.[0]?.url ? <img src={rp.media[0].url} alt="" className="h-full w-full object-cover" /> : <span className="text-gray-400">No Image</span>}
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
