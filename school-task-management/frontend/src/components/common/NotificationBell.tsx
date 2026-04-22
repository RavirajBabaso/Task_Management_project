import { useEffect, useRef, useState } from 'react';
import { markAllRead } from '../../store/notificationSlice';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

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
  const dispatch = useAppDispatch();
  const { notifications, unreadCount } = useAppSelector((state) => state.notifications);
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

  const handleOpen = () => {
    const nextValue = !isOpen;
    setIsOpen(nextValue);

    if (nextValue && unreadCount > 0) {
      dispatch(markAllRead());
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        aria-label="Open notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#EFF2F6] bg-white text-[#36506C] transition hover:bg-[#F8F9FC]"
        onClick={handleOpen}
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
        <div className="absolute right-0 top-11 z-30 w-[300px] rounded-[16px] border border-[#EFF2F6] bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="text-sm font-semibold text-[#1E293B]">Notifications</h3>
            <span className="text-[11px] text-[#8A99B0]">Latest 5</span>
          </div>
          <div className="max-h-[320px] overflow-y-auto">
            {latestNotifications.length > 0 ? (
              latestNotifications.map((notification) => (
                <div
                  className="rounded-[12px] px-3 py-2.5 transition hover:bg-[#F8F9FC]"
                  key={notification.id}
                >
                  <p className="text-[12px] font-medium leading-5 text-[#1E293B]">
                    {notification.message}
                  </p>
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
        </div>
      ) : null}
    </div>
  );
}

export default NotificationBell;
