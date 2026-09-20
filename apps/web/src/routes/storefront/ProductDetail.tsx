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
import {
  Star, Heart, Store, MapPin, Package,
  MessageCircle, ChevronRight, Send, PackageCheck, ShieldCheck, Truck
} from 'lucide-react';

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

  const [discName, setDiscName] = useState('');
  const [discEmail, setDiscEmail] = useState('');
  const [discQuestion, setDiscQuestion] = useState('');

  const productId = product?.id || '';

  const { data: reviews = [] } = useQuery<Review[]>({
    queryKey: ['reviews', productId],
    queryFn: () => api.get<Review[]>(`/discussions/products/${productId}/reviews`),
    enabled: !!productId,
  });

  const { data: discussions = [] } = useQuery<Discussion[]>({
    queryKey: ['discussions', productId],
    queryFn: () => api.get<Discussion[]>(`/discussions/products/${productId}/discussions`),
    enabled: !!productId,
  });

  const { data: wishlistCountData } = useWishlistCount(product?.id || '');
  const wishlistCount = wishlistCountData?.count || 0;

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

  const variants = product?.variants || [];
  const hasVariants = variants.length > 0;

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

  const matchingVariant = useMemo(() => {
    if (!hasVariants || !Object.keys(selectedOptions).length) return null;
    return variants.find((v: any) => {
      const formData = v.variantFormData || {};
      return Object.entries(selectedOptions).every(([key, value]) => formData[key] === value);
    });
  }, [hasVariants, variants, selectedOptions]);

  const currentPrice = matchingVariant?.marketplacePrice || product?.marketplacePrice || 0;
  const currentStock = matchingVariant?.stock ?? product?.stock ?? 0;

  const [isTabSticky, setIsTabSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const tabElement = document.getElementById('product-tabs');
      if (tabElement) {
        const rect = tabElement.getBoundingClientRect();
        setIsTabSticky(rect.top <= 56);
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
            <Skeleton className="aspect-square rounded-lg" />
            <div className="flex gap-2 mt-4">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="w-16 h-16 rounded-md" />
              ))}
            </div>
          </div>
          <div className="w-full md:w-1/2 space-y-4">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-16 w-full rounded-lg" />
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
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[rgb(var(--bg-tertiary))] flex items-center justify-center">
          <Package className="w-8 h-8 text-[rgb(var(--text-muted))]" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Produk tidak ditemukan</h1>
        <p className="text-[rgb(var(--text-muted))] mb-4">Produk ini tidak ada atau telah dihapus.</p>
        <Link to="/products" className="inline-flex items-center gap-2 text-brand-accent hover:underline font-medium">
          Lihat Produk <ChevronRight className="w-4 h-4" />
        </Link>
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
      { productId: product.id, quantity: 1, variantId: matchingVariant?.id },
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
      { productId: product.id, quantity: 1, variantId: matchingVariant?.id },
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
    createDiscussion.mutate({ customerName: discName, email: discEmail, question: discQuestion });
  };

  const renderStars = (rating: number, size = 'sm') => {
    const sizeClass = size === 'lg' ? 'w-5 h-5' : 'w-3.5 h-3.5';
    return Array(5).fill(0).map((_, i) => (
      <Star key={i} className={`${sizeClass} ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-secondary))]">
      <SEOHead title={product.name} description={product.description?.substring(0, 160)} image={product.media?.[0]?.url} />

      {/* Breadcrumb */}
      <div className="bg-[rgb(var(--bg-primary))] border-b border-[rgb(var(--border))]">
        <div className="max-w-7xl mx-auto px-4 py-2.5">
          <div className="flex items-center gap-1.5 text-xs text-[rgb(var(--text-muted))]">
            <Link to="/" className="hover:text-brand-accent transition-colors">Beranda</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/products" className="hover:text-brand-accent transition-colors">Produk</Link>
            {product.category && (
              <>
                <ChevronRight className="w-3 h-3" />
                <Link to={`/products?categoryId=${product.category.id}`} className="hover:text-brand-accent transition-colors">{product.category.name}</Link>
              </>
            )}
            <ChevronRight className="w-3 h-3" />
            <span className="text-[rgb(var(--text-primary))] font-medium truncate max-w-[200px]">{product.name}</span>
          </div>
        </div>
      </div>

      {/* Main Product Section */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Image Section */}
          <div className="w-full md:w-[45%]">
            <div className="bg-[rgb(var(--bg-primary))] rounded-lg overflow-hidden shadow-sm border border-[rgb(var(--border))] aspect-square flex items-center justify-center">
              {product.media?.[selectedImage]?.url ? (
                <img src={product.media[selectedImage].url} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-[rgb(var(--text-muted))]">
                  <Package className="w-12 h-12" />
                  <span className="text-sm">No Image</span>
                </div>
              )}
            </div>
            {product.media?.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                {product.media.map((m: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 overflow-hidden flex-shrink-0 rounded-md border-2 transition-all ${
                      selectedImage === i
                        ? 'border-brand-accent shadow-md ring-1 ring-brand-accent/30'
                        : 'border-[rgb(var(--border))] hover:border-brand-accent/50 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={m.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info Section */}
          <div className="w-full md:w-[55%]">
            {/* Category & Brand */}
            <div className="flex items-center gap-2 text-xs text-[rgb(var(--text-muted))] mb-3">
              <Link to={`/products?categoryId=${product.category?.id}`} className="px-2 py-0.5 bg-brand-accent/10 text-brand-accent rounded-full font-medium hover:bg-brand-accent/20 transition-colors">
                {product.category?.name}
              </Link>
              {product.brand && (
                <span className="px-2 py-0.5 bg-[rgb(var(--bg-tertiary))] rounded-full">{product.brand.name}</span>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-2xl md:text-3xl font-bold mb-3 leading-tight">{product.name}</h1>

            {/* Rating & Stats */}
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-[rgb(var(--border))]">
              <div className="flex items-center gap-1.5">
                <div className="flex">{renderStars(Math.round(product.avgRating || 0))}</div>
                <span className="text-sm font-medium">{Number(product.avgRating || 0).toFixed(1)}</span>
                <span className="text-sm text-[rgb(var(--text-muted))]">({product.reviewCount || 0})</span>
              </div>
              <div className="w-px h-4 bg-[rgb(var(--border))]" />
              <div className="flex items-center gap-1.5 text-sm text-[rgb(var(--text-muted))]">
                <Heart className="w-4 h-4 text-red-400" />
                <span>{wishlistCount} wishlist</span>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gradient-to-r from-brand-accent/10 to-orange-50 dark:from-brand-accent/20 dark:to-orange-900/20 p-5 rounded-lg mb-5">
              <p className="text-xs text-[rgb(var(--text-muted))] mb-1 font-medium uppercase tracking-wider">Harga</p>
              <span className="text-3xl md:text-4xl font-bold text-brand-accent">
                Rp {Number(currentPrice).toLocaleString()}
              </span>
            </div>

            {/* Variant Selector */}
            {hasVariants && Object.keys(variantOptions).length > 0 && (
              <div className="mb-5 space-y-3">
                <p className="font-semibold text-sm">Pilih Varian</p>
                {Object.entries(variantOptions).map(([key, values]) => (
                  <div key={key}>
                    <p className="text-xs text-[rgb(var(--text-muted))] mb-2 font-medium uppercase tracking-wide">{key}</p>
                    <div className="flex flex-wrap gap-2">
                      {values.map((value) => (
                        <button
                          key={value}
                          onClick={() => handleOptionSelect(key, value)}
                          className={`px-4 py-2 text-sm border-2 transition-all rounded-md font-medium ${
                            selectedOptions[key] === value
                              ? 'bg-brand-accent text-white border-brand-accent shadow-md'
                              : 'bg-[rgb(var(--bg-primary))] border-[rgb(var(--border))] hover:border-brand-accent/50'
                          }`}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {matchingVariant && (
                  <p className="text-xs text-[rgb(var(--text-muted))] font-mono">SKU: {matchingVariant.sku}</p>
                )}
              </div>
            )}

            {/* Stock */}
            <div className="flex items-center gap-3 mb-5 p-3 rounded-lg bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))]">
              <Package className={`w-5 h-5 ${currentStock > 0 ? 'text-semantic-success' : 'text-semantic-error'}`} />
              <div>
                <p className="text-xs text-[rgb(var(--text-muted))]">Stok</p>
                <p className={`text-sm font-semibold ${currentStock > 0 ? 'text-semantic-success' : 'text-semantic-error'}`}>
                  {currentStock > 0 ? `${currentStock} tersedia` : 'Habis'}
                </p>
              </div>
            </div>

            {/* Seller */}
            <div className="flex items-center gap-3 mb-5 p-3 rounded-lg bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))]">
              <div className="w-10 h-10 rounded-full bg-brand-accent/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-brand-accent" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-[rgb(var(--text-muted))]">Penjual</p>
                <p className="font-semibold text-sm">{product.publisher?.fullName}</p>
              </div>
              {product.publisher?.cityId && (
                <div className="flex items-center gap-1 text-xs text-[rgb(var(--text-muted))]">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{product.publisher.cityId}</span>
                </div>
              )}
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              {[
                { icon: ShieldCheck, label: 'Garansi' },
                { icon: Truck, label: 'Kirim Cepat' },
                { icon: PackageCheck, label: 'Dicek' },
              ].map(({ icon: Icon, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 p-2 rounded-lg bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))]">
                  <Icon className="w-4 h-4 text-semantic-success" />
                  <span className="text-[10px] font-medium text-[rgb(var(--text-muted))]">{label}</span>
                </div>
              ))}
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
                className={`px-5 py-4 text-sm font-medium border-b-2 transition-colors rounded-sm ${
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
          <div className="bg-[rgb(var(--bg-primary))] p-5 md:p-8 rounded-lg border border-[rgb(var(--border))] prose max-w-none text-sm md:text-base leading-relaxed">
            {product.description}
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="space-y-4">
            <div className="bg-[rgb(var(--bg-primary))] p-5 md:p-8 rounded-lg border border-[rgb(var(--border))]">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                <h3 className="font-bold text-lg">Ulasan Produk</h3>
              </div>
              {reviews.length === 0 ? (
                <div className="text-center py-8">
                  <Star className="w-10 h-10 mx-auto mb-3 text-[rgb(var(--text-muted))] opacity-40" />
                  <p className="text-[rgb(var(--text-muted))] text-sm">Belum ada ulasan.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b border-[rgb(var(--border))] pb-4 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 rounded-full bg-brand-accent/10 flex items-center justify-center text-sm font-bold text-brand-accent">
                          {review.customerName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-medium text-sm block">{review.customerName}</span>
                          <div className="flex items-center gap-2">
                            <div className="flex">{renderStars(review.rating)}</div>
                            <span className="text-xs text-[rgb(var(--text-muted))]">
                              {new Date(review.createdAt).toLocaleDateString('id-ID')}
                            </span>
                          </div>
                        </div>
                      </div>
                      {review.reviewText && (
                        <p className="text-sm text-[rgb(var(--text-secondary))] ml-11">{review.reviewText}</p>
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
            <div className="bg-[rgb(var(--bg-primary))] p-5 md:p-8 rounded-lg border border-[rgb(var(--border))]">
              <div className="flex items-center gap-3 mb-6">
                <MessageCircle className="w-5 h-5 text-brand-accent" />
                <h3 className="font-bold text-lg">Pertanyaan & Jawaban</h3>
              </div>
              {discussions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-10 h-10 mx-auto mb-3 text-[rgb(var(--text-muted))] opacity-40" />
                  <p className="text-[rgb(var(--text-muted))] text-sm">Belum ada pertanyaan. Jadilah yang pertama bertanya!</p>
                </div>
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
                            <div className="mt-3 ml-2 pl-4 border-l-2 border-brand-accent bg-brand-accent/5 p-3 rounded-r-lg">
                              <div className="flex items-center gap-2 mb-1">
                                <Store className="w-3.5 h-3.5 text-brand-accent" />
                                <span className="text-xs font-semibold text-brand-accent">{disc.answeredBy || 'Penjual'}</span>
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
        <div className="bg-[rgb(var(--bg-primary))] p-5 md:p-8 rounded-lg border border-[rgb(var(--border))]">
          <div className="flex items-center gap-3 mb-5">
            <MessageCircle className="w-5 h-5 text-brand-accent" />
            <h3 className="font-bold text-lg">Tanya Produk</h3>
          </div>
          <form onSubmit={handleDiscussionSubmit} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Nama *"
                value={discName}
                onChange={(e) => setDiscName(e.target.value)}
                className="px-4 py-2.5 border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-all"
              />
              <input
                type="email"
                placeholder="Email *"
                value={discEmail}
                onChange={(e) => setDiscEmail(e.target.value)}
                className="px-4 py-2.5 border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent transition-all"
              />
            </div>
            <textarea
              placeholder="Tulis pertanyaan Anda tentang produk ini *"
              value={discQuestion}
              onChange={(e) => setDiscQuestion(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-[rgb(var(--border))] bg-[rgb(var(--bg-secondary))] text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-brand-accent/30 focus:border-brand-accent resize-none transition-all"
            />
            <button
              type="submit"
              disabled={createDiscussion.isPending}
              className="px-6 py-2.5 bg-brand-accent hover:bg-brand-accent-dark text-white text-sm font-semibold rounded-md transition-all disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {createDiscussion.isPending ? 'Mengirim...' : 'Kirim Pertanyaan'}
            </button>
          </form>
        </div>
      </div>

      {/* Related Products */}
      {product.relatedProducts?.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 border-t border-[rgb(var(--border))]">
          <h2 className="text-xl font-bold mb-5">Produk Terkait</h2>
          <div className="flex md:grid md:grid-cols-4 gap-4 overflow-x-auto pb-4 -mx-4 px-4">
            {product.relatedProducts.map((rp: any) => (
              <Link
                key={rp.id}
                to={`/products/${rp.slug}`}
                className="bg-[rgb(var(--bg-primary))] overflow-hidden hover:shadow-lg transition-all flex-shrink-0 w-40 md:w-auto rounded-lg border border-[rgb(var(--border))] group"
              >
                <div className="h-32 md:h-40 bg-[rgb(var(--bg-tertiary))] flex items-center justify-center overflow-hidden">
                  {rp.media?.[0]?.url ? (
                    <img src={rp.media[0].url} alt="" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <Package className="w-8 h-8 text-[rgb(var(--text-muted))]" />
                  )}
                </div>
                <div className="p-3">
                  <p className="font-medium text-sm truncate group-hover:text-brand-accent transition-colors">{rp.name}</p>
                  <p className="text-brand-accent font-bold text-sm mt-1">Rp {Number(rp.marketplacePrice).toLocaleString()}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
