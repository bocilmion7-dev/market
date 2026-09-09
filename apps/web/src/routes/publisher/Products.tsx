import { useState } from 'react';
import { Link } from 'react-router-dom';
import { usePublisherProducts } from '@/features/products/hooks';

export default function PublisherProducts() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = usePublisherProducts(page);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Products</h1>
        <Link to="/publisher/products/new" className="bg-brand-accent text-white px-4 py-2 rounded-lg hover:bg-brand-accent-dark">
          Add Product
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-brand-dark text-white">
            <tr>
              <th className="p-3 text-left">Product</th>
              <th className="p-3 text-left">SKU</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Price</th>
              <th className="p-3 text-left">Stock</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={7} className="p-4 text-center">Loading...</td></tr>
            ) : !data?.products?.length ? (
              <tr><td colSpan={7} className="p-4 text-center text-gray-500">No products yet</td></tr>
            ) : (
              data.products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">{p.name}</td>
                  <td className="p-3 text-sm text-gray-500">{p.sku}</td>
                  <td className="p-3">{p.category?.name}</td>
                  <td className="p-3">Rp {Number(p.marketplacePrice).toLocaleString()}</td>
                  <td className="p-3">{p.stock}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-sm ${
                      p.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                      p.status === 'PENDING_APPROVAL' ? 'bg-yellow-100 text-yellow-700' :
                      p.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{p.status}</span>
                  </td>
                  <td className="p-3">
                    <Link to={`/publisher/products/${p.id}`} className="text-brand-accent hover:underline text-sm">Edit</Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
