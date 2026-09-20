import { useState } from 'react';
import { usePublisherDiscussions, useReplyDiscussion } from '@/features/publisher/hooks';
import { Button, Input, Skeleton } from '@/components/ui';

export default function PublisherDiscussions() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filter, setFilter] = useState('');
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const { data, isLoading } = usePublisherDiscussions(page, search, filter);
  const replyDiscussion = useReplyDiscussion();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const handleReply = (id: string) => {
    if (!replyText.trim()) return;
    replyDiscussion.mutate({ id, answer: replyText }, {
      onSuccess: () => {
        setReplyingId(null);
        setReplyText('');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
      </div>
    );
  }

  const discussions = data?.discussions || [];
  const totalPages = data?.totalPages || 0;
  const total = data?.total || 0;
  const unansweredCount = discussions.filter((d: any) => !d.answer).length;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Diskusi Produk</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => { setFilter(''); setPage(1); }}
          className={`px-3 py-1.5 text-sm rounded-sm border ${!filter ? 'bg-brand-accent text-white border-brand-accent' : 'border-[rgb(var(--border))] hover:border-brand-accent'}`}
        >
          Semua ({total})
        </button>
        <button
          onClick={() => { setFilter('unanswered'); setPage(1); }}
          className={`px-3 py-1.5 text-sm rounded-sm border ${filter === 'unanswered' ? 'bg-brand-accent text-white border-brand-accent' : 'border-[rgb(var(--border))] hover:border-brand-accent'}`}
        >
          Belum Dijawab ({discussions.filter((d: any) => !d.answer).length})
        </button>
        <button
          onClick={() => { setFilter('answered'); setPage(1); }}
          className={`px-3 py-1.5 text-sm rounded-sm border ${filter === 'answered' ? 'bg-brand-accent text-white border-brand-accent' : 'border-[rgb(var(--border))] hover:border-brand-accent'}`}
        >
          Sudah Dijawab ({discussions.filter((d: any) => d.answer).length})
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Cari nama atau pertanyaan..."
          className="flex-1"
        />
        <Button type="submit" variant="secondary">Cari</Button>
      </form>

      {discussions.length === 0 ? (
        <div className="text-center py-12 text-[rgb(var(--text-muted))]">
          {search || filter ? 'Tidak ada diskusi yang cocok.' : 'Belum ada diskusi.'}
        </div>
      ) : (
        <div className="space-y-4">
          {discussions.map((discussion: any) => (
            <div key={discussion.id} className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border))] rounded-sm p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-medium">{discussion.customerName}</p>
                  <p className="text-xs text-[rgb(var(--text-muted))]">{discussion.product?.name}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-sm ${discussion.answer ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {discussion.answer ? 'Dijawab' : 'Menunggu'}
                </span>
              </div>

              <div className="bg-[rgb(var(--bg-secondary))] rounded-sm p-3 mb-3">
                <p className="text-sm font-medium mb-1">Pertanyaan:</p>
                <p className="text-sm text-[rgb(var(--text-secondary))]">{discussion.question}</p>
              </div>

              {discussion.answer && (
                <div className="bg-blue-50 border-l-4 border-blue-400 rounded-sm p-3 mb-3">
                  <p className="text-sm font-medium mb-1">Balasan:</p>
                  <p className="text-sm text-[rgb(var(--text-secondary))]">{discussion.answer}</p>
                  {discussion.answeredBy && (
                    <p className="text-xs text-[rgb(var(--text-muted))] mt-1">— {discussion.answeredBy}</p>
                  )}
                </div>
              )}

              <p className="text-xs text-[rgb(var(--text-muted))] mb-3">
                {new Date(discussion.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>

              {!discussion.answer && (
                <div>
                  {replyingId === discussion.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Tulis balasan..."
                        className="w-full border border-[rgb(var(--border))] px-3 py-2 text-sm rounded-sm focus:outline-none focus:border-brand-accent"
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleReply(discussion.id)}
                          disabled={replyDiscussion.isPending || !replyText.trim()}
                        >
                          {replyDiscussion.isPending ? 'Mengirim...' : 'Kirim Balasan'}
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => { setReplyingId(null); setReplyText(''); }}>
                          Batal
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="secondary" onClick={() => { setReplyingId(discussion.id); setReplyText(''); }}>
                      Balas
                    </Button>
                  )}
                </div>
              )}
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
