import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProductBySlug } from '@/features/storefront/hooks';
import { useAddToWishlist, useRemoveFromWishlist, useWishlist, useWishlistCount } from '@/features/wishlist/hooks';
import { useAddToCart } from '@/features/cart/hooks';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';
import { api } from '@/lib/api';
import SEOHead from '@/components/SEOHead';
import { Skeleton } from '@/components/ui';
import { useState, useMemo, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

type Tab = 'description' | 'reviews' | 'discussions';

interface Review {
  id: string;
  rating: number;
  reviewText: string | null;
  customerName: string;
  createdAt: string;
}

interface Discussion {
  id: string;
  customerName: string;
  question: string;
  answer: string | null;
  answeredBy: string | null;
  createdAt: string;
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: product, isLoading } = useProductBySlug(slug || '');
  const { data: wishlist } = useWishlist();
  const addToWishlist = useAddToWishlist();
  const removeFromWishlist = useRemoveFromWishlist();
  const addToCart = useAddToCart();
  const addToast = useUIStore((s) => s.addToast);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const user = useAuthStore((s) => s.user);

  // Discussion form state
  const [discName, setDiscName] = useState('');
  const [discEmail, setDiscEmail] = useState('');
  const [discQuestion, setDiscQuestion] = useState('');

  // Stable product ID for queries
  const productId = product?.id || '';

  // Fetch reviews
  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['reviews', productId],
    queryFn: () => api.get<Review[]>(`/discussions/products/${productId}/reviews`),
    enabled: !!productId,
  });

  // Fetch discussions
  const { data: discussions = [] } = useQuery<Discussion[]>({
    queryKey: ['discussions', productId],
    queryFn: () => api.get<Discussion[]>(`/discussions/products/${productId}/discussions`),
    enabled: !!productId,
  });

  // Fetch wishlist count for this product
  const { data: wishlistCountData } = useWishlistCount(product?.id || '');
  const wishlistCount = wishlistCountData?.count || 0;

  // Create discussion mutation
  const createDiscussion = useMutation({
    mutationFn: (data: { customerName: string; email: string; question: string }) =>
      api.post(`/discussions/products/${productId}/discussions`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['discussions', productId] });
      setDiscName('');
      setDiscEmail('');
      setDiscQuestion('');
      addToast('Pertanyaan berhasil dikirim', 'success');
    },
    onError: () => addToast('Gagal mengirim pertanyaan', 'error'),
  });

  // Safe access to variants
  const variants = product?.variants || [];
  const hasVariants = variants.length > 0;

  // Extract unique variant options from product variants
  const variantOptions = useMemo(() => {
    if (!hasVariants) return {};
    const options: Record<string, string[]> = {};
    variants.forEach((v: any) => {
      const formData = v.variantFormData || {};
      Object.entries(formData).forEach(([key, value]) => {
        if (!options[key]) options[key] = [];
        if (!options[key].includes(value as string)) {
          options[key].push(value as string);
        }
      });
    });
    return options;
  }, [hasVariants, variants]);

  // Find matching variant based on selected options
  const matchingVariant = useMemo(() => {
    if (!hasVariants || !Object.keys(selectedOptions).length) return null;
    return variants.find((v: any) => {
      const formData = v.variantFormData || {};
      return Object.entries(selectedOptions).every(([key, value]) => formData[key] === value);
    });
  }, [hasVariants, variants, selectedOptions]);

  // Get current price (variant override or product price)
  const currentPrice = matchingVariant?.marketplacePrice || product?.marketplacePrice || 0;
  const currentStock = matchingVariant?.stock ?? product?.stock ?? 0;

  // Sticky tab detection
  const [isTabSticky, setIsTabSticky] = useState(false);
  const tabRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const tabElement = document.getElementById('product-tabs');
      if (tabElement) {
        const rect = tabElement.getBoundingClientRect();
        setIsTabSticky(rect.top <= 56); // 56px = header height
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/2">
            <Skeleton className="aspect-square" />
            <div className="flex gap-2 mt-4">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="w-16 h-16" />
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2 space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20" />
            <div className="flex gap-2">
              <Skeleton className="h-12 flex-1" />
              <Skeleton className="h-12 w-12" />
              <Skeleton className="h-12 w-12" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-2">Produk tidak ditemukan</h1>
        <p className="text-[rgb(var(--text-muted))] mb-4">Produk ini tidak ada atau telah dihapus.</p>
        <Link to="/products" className="text-brand-accent hover:underline">Lihat Produk →</Link>
      </div>
    );
  }

  const isWishlisted = Array.isArray(wishlist) && wishlist.some((w: any) => w.productId === product.id);

  const handleOptionSelect = (key: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleAddToCart = () => {
    if (hasVariants && !matchingVariant) {
      addToast('Silakan pilih varian produk', 'error');
      return;
    }
    addToCart.mutate(
      {
        productId: product.id,
        quantity: 1,
        variantId: matchingVariant?.id,
      },
      {
        onSuccess: () => addToast('Produk ditambahkan ke keranjang', 'success'),
        onError: () => addToast('Gagal menambahkan ke keranjang', 'error'),
      }
    );
  };

  const handleBuyNow = () => {
    if (hasVariants && !matchingVariant) {
      addToast('Silakan pilih varian produk', 'error');
      return;
    }
    addToCart.mutate(
      {
        productId: product.id,
        quantity: 1,
        variantId: matchingVariant?.id,
      },
      {
        onSuccess: () => navigate('/checkout'),
        onError: () => addToast('Gagal menambahkan ke keranjang', 'error'),
      }
    );
  };

  const handleWishlist = () => {
    if (!user) { window.location.href = '/login'; return; }
    isWishlisted ? removeFromWishlist.mutate(product.id) : addToWishlist.mutate(product.id);
  };

  const handleDiscussionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!discName || !discEmail || !discQuestion) {
      addToast('Semua field wajib diisi', 'error');
      return;
    }
    createDiscussion.mutate({
      customerName: discName,
      email: discEmail,
      question: discQuestion,
    });
  };

  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-300'}>★</span>
    ));
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-secondary))]">
      <SEOHead title={product.name} description={product.description?.substring(0, 160)} image={product.media?.[0]?.url} />

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Image Section */}
          <div className="w-full md:w-1/2">
            <div className="bg-[rgb(var(--bg-primary))] overflow-hidden aspect-square flex items-center justify-center">
              {product.media?.[selectedImage]?.url ? (
                <img src={product.media[selectedImage].url} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-[rgb(var(--text-muted))] text-lg">No Image</span>
              )}
            </div>
            {product.media?.length > 1 && (
              <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                {product.media.map((m: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 overflow-hidden flex-shrink-0 border-2 rounded-sm ${selectedImage === i ? 'border-brand-accent' : 'border-transparent'}`}
                  >
                    <img src={m.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="w-full md:w-1/2">
            {/* Category & Brand */}
            <div className="flex items-center gap-2 text-sm text-[rgb(var(--text-muted))] mb-2">
              <Link to={`/products?categoryId=${product.category?.id}`} className="hover:text-brand-accent">
                {product.category?.name}
              </Link>
              {product.brand && (
                <>
                  <span>·</span>
                  <span>{product.brand.name}</span>
                </>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-2xl md:text-3xl font-bold mb-3">{product.name}</h1>

            {/* Rating & Wishlist Count */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-1">
                {renderStars(Math.round(product.avgRating || 0))}
                <span className="text-sm text-[rgb(var(--text-muted))] ml-1">
                  ({product.reviewCount || 0} ulasan)
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-[rgb(var(--text-muted))]">
                <span className="text-red-500">♥</span>
                <span>{wishlistCount} wishlist</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-[rgb(var(--bg-secondary))] p-4 mb-4">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl md:text-3xl font-bold text-brand-accent">
                  Rp {Number(currentPrice).toLocaleString()}
                </span>
                {product.bestPrice !== currentPrice && (
                  <span className="text-lg text-[rgb(var(--text-muted))] line-through">
                    Rp {Number(product.bestPrice).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Variant Selector */}
            {hasVariants && Object.keys(variantOptions).length > 0 && (
              <div className="mb-4 space-y-3">
                <p className="font-medium text-sm">Pilih Varian:</p>
                {Object.entries(variantOptions).map(([key, values]) => (
                  <div key={key}>
                    <p className="text-xs text-[rgb(var(--text-muted))] mb-2 capitalize">{key}:</p>
                    <div className="flex flex-wrap gap-2">
                      {values.map((value) => (
                        <button
                          key={value}
                          onClick={() => handleOptionSelect(key, value)}
                          className={`px-4 py-2 text-sm border transition-colors rounded-sm ${
                            selectedOptions[key] === value
                              ? 'bg-brand-accent text-white border-brand-accent'
                              : 'bg-[rgb(var(--bg-primary))] border-[rgb(var(--border))] hover:border-brand-accent'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {matchingVariant && (
                  <p className="text-xs text-[rgb(var(--text-muted))]">
                    SKU: {matchingVariant.sku}
                  </p>
                )}
              </div>
            )}

            {/* Stock */}
            <div className="mb-4">
              <p className="text-sm text-[rgb(var(--text-muted))]">Stok</p>
              <p className={currentStock > 0 ? 'text-semantic-success font-medium' : 'text-semantic-error font-medium'}>
                {currentStock > 0 ? `${currentStock} tersedia` : 'Habis'}
              </p>
            </div>

            {/* Seller */}
            <div className="bg-[rgb(var(--bg-secondary))] p-3 mb-4">
              <p className="text-xs text-[rgb(var(--text-muted))]">Penjual</p>
              <p className="font-medium text-sm">{product.publisher?.fullName}</p>
              {product.publisher?.cityId && (
                <p className="text-xs text-[rgb(var(--text-muted))] mt-0.5">{product.publisher.cityId}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleBuyNow}
                disabled={currentStock <= 0 || addToCart.isPending}
                className="flex-1 h-12 bg-brand-accent hover:bg-brand-accent-dark text-white font-medium rounded-sm transition-colors disabled:opacity-50"
              >
                Beli
              </button>
              <button
                onClick={handleAddToCart}
                disabled={currentStock <= 0 || addToCart.isPending}
                className="h-12 w-12 flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center rounded-sm transition-colors disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </button>
              <button
                onClick={handleWishlist}
                className="h-12 w-12 flex-shrink-0 border border-[rgb(var(--border))] hover:bg-[rgb(var(--bg-tertiary))] flex items-center justify-center rounded-sm transition-colors text-lg"
              >
                {isWishlisted ? '♥' : '♡'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Tabs Section */}
      <div
        id="product-tabs"
        className={`sticky top-14 z-30 bg-[rgb(var(--bg-primary))] border-b border-[rgb(var(--border))] transition-shadow ${
          isTabSticky ? 'shadow-md' : ''
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-0">
            {(['description', 'reviews', 'discussions'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors rounded-sm ${
                  activeTab === tab
                    ? 'border-brand-accent text-brand-accent'
                    : 'border-transparent text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]'
                }`}
              >
                {tab === 'description' && 'Deskripsi'}
                {tab === 'reviews' && `Ulasan (${reviews.length})`}
                {tab === 'discussions' && `Diskusi (${discussions.length})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Description Tab */}
        {activeTab === 'description' && (
          <div className="bg-[rgb(var(--bg-primary))] p-4 md:p-6 prose max-w-none text-sm md:text-base">
            {product.description}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="bg-[rgb(var(--bg-primary))] p-4 md:p-6">
              <h3 className="font-bold mb-4">Ulasan Produk</h3>
              {reviews.length === 0 ? (
                <p className="text-[rgb(var(--text-muted))] text-sm">Belum ada ulasan. Ulasan hanya dapat diberikan setelah barang diterima melalui halaman tracking.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-[rgb(var(--border))] pb-4 last:border-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">{review.customerName}</span>
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-xs text-[rgb(var(--text-muted))]">
                          {new Date(review.createdAt).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                      {review.reviewText && (
                        <p className="text-sm text-[rgb(var(--text-secondary))]">{review.reviewText}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Discussions Tab */}
        {activeTab === 'discussions' && (
          <div className="space-y-4">
            {/* Discussion List */}
            <div className="bg-[rgb(var(--bg-primary))] p-4 md:p-6">
              <h3 className="font-bold mb-4">Pertanyaan & Jawaban</h3>
              {discussions.length === 0 ? (
                <p className="text-[rgb(var(--text-muted))] text-sm">Belum ada pertanyaan. Jadilah yang pertama bertanya!</p>
              ) : (
                <div className="space-y-4">
                  {discussions.map((disc) => (
                    <div key={disc.id} className="border-b border-[rgb(var(--border))] pb-4 last:border-0">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-accent text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {disc.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{disc.customerName}</span>
                            <span className="text-xs text-[rgb(var(--text-muted))]">
                              {new Date(disc.createdAt).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                          <p className="text-sm text-[rgb(var(--text-secondary))]">{disc.question}</p>
                          
                          {disc.answer && (
                            <div className="mt-3 ml-4 pl-4 border-l-2 border-brand-accent">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-brand-accent">{disc.answeredBy || 'Penjual'}</span>
                              </div>
                              <p className="text-sm text-[rgb(var(--text-secondary))]">{disc.answer}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Question Form */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 border-t border-[rgb(var(--border))]">
        <div className="bg-[rgb(var(--bg-primary))] p-4 md:p-6">
          <h3 className="font-bold mb-4">Tanya Produk</h3>
          <form onSubmit={handleDiscussionSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nama *"
                value={discName}
                onChange={(e) => setDiscName(e.target.value)}
                className="px-4 py-2 border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] text-sm focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
              <input
                type="email"
                placeholder="Email *"
                value={discEmail}
                onChange={(e) => setDiscEmail(e.target.value)}
                className="px-4 py-2 border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] text-sm focus:outline-none focus:ring-1 focus:ring-brand-accent"
              />
            </div>
            <textarea
              placeholder="Tulis pertanyaan Anda tentang produk ini *"
              value={discQuestion}
              onChange={(e) => setDiscQuestion(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] text-sm focus:outline-none focus:ring-1 focus:ring-brand-accent resize-none"
            />
            <button
              type="submit"
              disabled={createDiscussion.isPending}
              className="px-6 py-2 bg-brand-accent hover:bg-brand-accent-dark text-white text-sm font-medium rounded-sm transition-colors disabled:opacity-50"
            >
              {createDiscussion.isPending ? 'Mengirim...' : 'Kirim Pertanyaan'}
            </button>
          </form>
        </div>
      </div>

      {/* Related Products */}
      {product.relatedProducts?.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 border-t border-[rgb(var(--border))]">
          <h2 className="text-xl font-bold mb-4">Produk Terkait</h2>
          <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto pb-4 -mx-4 px-4">
            {product.relatedProducts.map((rp: any) => (
              <Link
                key={rp.id}
                to={`/products/${rp.slug}`}
                className="bg-[rgb(var(--bg-primary))] overflow-hidden hover:shadow-md transition-shadow flex-shrink-0 w-40 md:w-auto rounded-sm"
              >
                <div className="h-32 md:h-40 bg-[rgb(var(--bg-tertiary))] flex items-center justify-center">
                  {rp.media?.[0]?.url ? (
                    <img src={rp.media[0].url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[rgb(var(--text-muted))] text-sm">No Image</span>
                  )}
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
