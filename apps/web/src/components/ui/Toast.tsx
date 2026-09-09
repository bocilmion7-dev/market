import { useUIStore } from '@/stores/ui';
import { cn } from '@/lib/cn';

const typeStyles = {
  success: 'bg-semantic-success text-white',
  error: 'bg-semantic-error text-white',
  info: 'bg-semantic-info text-white',
};

export default function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={cn(
            'flex items-center justify-between p-3 rounded-lg shadow-lg animate-slide-in-right',
            typeStyles[toast.type]
          )}
        >
          <p className="text-sm font-medium">{toast.message}</p>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-3 p-1 hover:opacity-80 touch-target"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
