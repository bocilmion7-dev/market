import { useState } from 'react';
import { usePublisherReviews } from '@/features/publisher/hooks';
import { Button, Input, Skeleton } from '@/components/ui';

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star} className={`text-sm ${star <= rating ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
      ))}
    </div>
  );
}

export default function PublisherReviews() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading } = usePublisherReviews(page, search);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  const reviews = data?.reviews || [];
  const totalPages = data?.totalPages || 0;
  const total = data?.total || 0;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Ulasan Produk</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cari nama reviewer atau isi ulasan..."
          className="flex-1"
        />
        <Button type="submit" variant="secondary">Cari</Button>
      </form>

      <p className="text-sm text-[rgb(var(--text-muted))] mb-4">{total} ulasan ditemukan</p>

      {reviews.length === 0 ? (
        <div className="text-center py-12 text-[rgb(var(--text-muted))]">
          {search ? 'Tidak ada ulasan yang cocok dengan pencarian.' : 'Belum ada ulasan.'}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => (
            <div key={review.id} className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium">{review.customerName}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{review.product?.name}</p>
                </div>
                <StarRating rating={review.rating} />
              </div>
              {review.reviewText && (
                <p className="text-sm text-[rgb(var(--text-secondary))] mb-2">{review.reviewText}</p>
              )}
              <p className="text-xs text-[rgb(var(--text-muted))]">
                {new Date(review.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
          <span className="py-2 px-4 text-sm">Halaman {page} dari {totalPages}</span>
          <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
