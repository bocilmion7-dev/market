import { Link } from 'react-router-dom';
import { useHomepage } from '@/features/storefront/hooks';
import SEOHead from '@/components/SEOHead';

export default function Home() {
  const { data, isLoading } = useHomepage();

  return (
    <div>
      <SEOHead title="Home" description="Discover products from multiple publishers at great prices" />
      <section className="bg-gradient-to-r from-brand-dark to-brand-accent text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-2xl md:text-4xl font-bold mb-4">Welcome to Marketplace</h1>
          <p className="text-lg mb-8 text-gray-200">Discover products from multiple publishers</p>
          <Link to="/products" className="bg-white text-brand-dark px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
            Browse Products
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data?.categories?.map((cat: any) => (
            <Link key={cat.id} to={`/products?categoryId=${cat.id}`} className="bg-white rounded-lg p-4 text-center hover:shadow-md transition-shadow">
              <p className="font-medium">{cat.name}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Latest Products</h2>
          <Link to="/products" className="text-brand-accent hover:underline">View All →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {isLoading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-lg h-64 animate-pulse" />
            ))
          ) : (
            data?.featuredProducts?.map((product: any) => (
              <Link key={product.id} to={`/products/${product.slug}`} className="bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  {product.media?.[0]?.url ? (
                    <img src={product.media[0].url} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-gray-400">No Image</span>
                  )}
                </div>
                <div className="p-4">
                  <p className="text-sm text-gray-500">{product.category?.name}</p>
                  <p className="font-medium truncate">{product.name}</p>
                  <p className="text-brand-accent font-bold mt-1">Rp {Number(product.marketplacePrice).toLocaleString()}</p>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
