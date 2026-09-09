import { useState } from 'react';
import { useNotifications, useMarkNotificationRead, useMarkAllRead } from '@/features/notifications/hooks';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = useNotifications(1);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllRead();

  const unreadCount = data?.unreadCount || 0;

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 text-gray-400 hover:text-white">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="flex justify-between items-center p-3 border-b">
            <span className="font-bold">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={() => markAllRead.mutate()} className="text-xs text-brand-accent">Mark all read</button>
            )}
          </div>
          {!data?.notifications || data.notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">No notifications</div>
          ) : (
            data.notifications.map((n: any) => (
              <div key={n.id} onClick={() => markRead.mutate(n.id)} className={`p-3 border-b cursor-pointer hover:bg-gray-50 ${!n.isRead ? 'bg-blue-50' : ''}`}>
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
