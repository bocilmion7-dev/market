import { useState } from 'react';
import { usePendingProducts, useApproveProduct, useRejectProduct } from '@/features/admin/hooks';

export default function Approvals() {
  const [page, setPage] = useState(1);
  const [rejectModal, setRejectModal] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const { data, isLoading } = usePendingProducts(page);
  const approveProduct = useApproveProduct();
  const rejectProduct = useRejectProduct();

  const handleApprove = (id: string) => {
    approveProduct.mutate(id);
  };

  const handleReject = () => {
    if (!rejectModal || !rejectReason) return;
    rejectProduct.mutate({ id: rejectModal, reason: rejectReason }, {
      onSuccess: () => { setRejectModal(null); setRejectReason(''); },
    });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Product Approvals</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-brand-dark text-white">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">Publisher</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Submitted</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr>
            ) : data?.products?.length === 0 ? (
              <tr><td colSpan={6} className="p-4 text-center text-gray-500">No pending products</td></tr>
            ) : (
              data?.products?.map((p: any) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.sku}</p>
                    </div>
                  </td>
                  <td className="p-3 text-sm">{p.publisher?.businessName || p.publisher?.fullName}</td>
                  <td className="p-3 text-sm">{p.category?.name}</td>
                  <td className="p-3 text-sm">Rp {Number(p.marketplacePrice).toLocaleString()}</td>
                  <td className="p-3 text-sm text-gray-500">{new Date(p.updatedAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleApprove(p.id)} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600">
                        Approve
                      </button>
                      <button onClick={() => setRejectModal(p.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1">Page {page} of {data.totalPages}</span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page >= data.totalPages}
            className="px-3 py-1 rounded border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Reject Product</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Provide a reason for rejection..."
              className="w-full border rounded-lg px-3 py-2 h-24 mb-4"
              required
            />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }} className="border px-4 py-2 rounded-lg">Cancel</button>
              <button onClick={handleReject} disabled={!rejectReason} className="bg-red-500 text-white px-4 py-2 rounded-lg disabled:opacity-50">Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
