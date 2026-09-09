import { useState } from 'react';
import { useAuditLogs } from '@/features/admin/reportHooks';

export default function AuditLogs() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [entityType, setEntityType] = useState('');
  const { data, isLoading } = useAuditLogs(page, {
    action: action || undefined,
    entityType: entityType || undefined,
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>

      <div className="flex gap-4 mb-6">
        <input
          value={action}
          onChange={(e) => setAction(e.target.value)}
          placeholder="Filter by action..."
          className="border px-3 py-2 text-sm"
        />
        <input
          value={entityType}
          onChange={(e) => setEntityType(e.target.value)}
          placeholder="Filter by entity type..."
          className="border px-3 py-2 text-sm"
        />
      </div>

      <div className="bg-white shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-brand-dark text-white">
            <tr>
              <th className="p-3 text-left text-sm">Timestamp</th>
              <th className="p-3 text-left text-sm">User</th>
              <th className="p-3 text-left text-sm">Action</th>
              <th className="p-3 text-left text-sm">Entity</th>
              <th className="p-3 text-left text-sm">Entity ID</th>
              <th className="p-3 text-left text-sm">IP</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : data?.logs?.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-4 text-center text-gray-500">
                  No audit logs
                </td>
              </tr>
            ) : (
              data?.logs?.map((log: any) => (
                <tr key={log.id} className="border-t">
                  <td className="p-3 text-sm">{new Date(log.createdAt).toLocaleString()}</td>
                  <td className="p-3 text-sm">{log.actor?.email || log.actorUserId}</td>
                  <td className="p-3 text-sm font-mono">{log.action}</td>
                  <td className="p-3 text-sm">{log.entityType}</td>
                  <td className="p-3 text-sm font-mono text-xs">
                    {log.entityId?.substring(0, 8)}...
                  </td>
                  <td className="p-3 text-sm text-gray-500">{log.ipAddress}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-1 text-sm">
            Page {page} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page === data.totalPages}
            className="px-3 py-1 border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
