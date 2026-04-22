import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

function formatTimestamp(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Just now';
  }

  return date.toLocaleString('en-IN', {
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    month: 'short'
  });
}

function NotificationBell() {
  const { notifications, unreadCount, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const latestNotifications = notifications.slice(0, 5);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    await markAllAsRead();
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-label="Open notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#EFF2F6] bg-white text-[#36506C] transition hover:bg-[#F8F9FC]"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24">
          <path
            d="M15 17H9M18 17V11C18 7.686 15.314 5 12 5C8.686 5 6 7.686 6 11V17L4 19H20L18 17ZM13.73 21C13.554 21.303 13.301 21.555 12.997 21.73C12.693 21.905 12.348 21.997 12 21.997C11.652 21.997 11.307 21.905 11.003 21.73C10.699 21.555 10.446 21.303 10.27 21"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex min-h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#D64545] px-1 text-[10px] font-semibold leading-none text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        ) : null}
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-11 z-30 w-[320px] rounded-[16px] border border-[#EFF2F6] bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
          <div className="flex items-center justify-between px-3 py-2">
            <div>
              <h3 className="text-sm font-semibold text-[#1E293B]">Notifications</h3>
              <p className="text-[11px] text-[#8A99B0]">Latest 5</p>
            </div>
            <button
              className="text-[11px] font-semibold text-[#185FA5] transition hover:text-[#144f89]"
              onClick={() => void handleMarkAllRead()}
              type="button"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-[320px] overflow-y-auto">
            {latestNotifications.length > 0 ? (
              latestNotifications.map((notification) => (
                <div
                  className="rounded-[12px] border border-transparent px-3 py-2.5 transition hover:border-[#E8EDF3] hover:bg-[#F8F9FC]"
                  key={`${notification.type}-${notification.id}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[12px] font-medium leading-5 text-[#1E293B]">
                      {notification.message}
                    </p>
                    {!notification.is_read ? (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#185FA5]" />
                    ) : null}
                  </div>
                  <p className="mt-1 text-[11px] text-[#8A99B0]">
                    {formatTimestamp(notification.created_at)}
                  </p>
                </div>
              ))
            ) : (
              <div className="px-3 py-6 text-center text-sm text-[#8A99B0]">
                No notifications yet.
              </div>
            )}
          </div>

          <div className="mt-2 flex items-center justify-end px-3 pb-2 pt-1">
            <Link
              className="text-[11px] font-semibold text-[#185FA5] transition hover:text-[#144f89]"
              onClick={() => setIsOpen(false)}
              to="/notifications"
            >
              View all
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default NotificationBell;
