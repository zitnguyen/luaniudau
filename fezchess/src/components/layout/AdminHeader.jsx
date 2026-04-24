import React from 'react';
import { Bell, Home, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { getRoleLabel } from '../../constants/roleLabel';
import notificationService from '../../services/notificationService';
import { debugPlayNotificationSound, initNotificationSound, playNotificationSound } from '../../utils/notificationSound';
import ThemeToggle from "../common/ThemeToggle";

const AdminHeader = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [unreadCount, setUnreadCount] = React.useState(0);
  const previousUnreadRef = React.useRef(null);
  const initializedRef = React.useRef(false);
  const previousLatestUnreadRef = React.useRef(null);

  React.useEffect(() => {
    initNotificationSound();
  }, []);

  React.useEffect(() => {
    let isMounted = true;
    const getCurrentRole = () => {
      const role = String(currentUser?.role || '').toLowerCase();
      return role;
    };
    const isRoleAllowedForSound = () => {
      const role = getCurrentRole();
      return role === 'teacher' || role === 'parent' || role === 'student';
    };
    const shouldPlaySound = () =>
      document.visibilityState === 'visible' &&
      document.hasFocus() &&
      Boolean(currentUser?._id || currentUser?.userId) &&
      isRoleAllowedForSound();

    const fetchUnreadCount = async () => {
      try {
        const data = await notificationService.getMine({ force: true });
        if (!isMounted) return;

        const currentUnread = Number(data?.unreadCount || 0);
        const latestUnreadCreatedAt = data?.latestUnreadCreatedAt || null;
        setUnreadCount(currentUnread);

        if (!initializedRef.current) {
          initializedRef.current = true;
          previousUnreadRef.current = currentUnread;
          previousLatestUnreadRef.current = latestUnreadCreatedAt;
          return;
        }

        const previousUnread = Number(previousUnreadRef.current || 0);
        const isNewUnread =
          currentUnread > previousUnread ||
          (latestUnreadCreatedAt &&
            previousLatestUnreadRef.current &&
            new Date(latestUnreadCreatedAt).getTime() >
              new Date(previousLatestUnreadRef.current).getTime());

        if (isNewUnread && shouldPlaySound()) {
          playNotificationSound();
        }

        previousUnreadRef.current = currentUnread;
        previousLatestUnreadRef.current = latestUnreadCreatedAt;
        return null;
      } catch (error) {
        return error?.response?.status || null;
      }
    };

    const userId = currentUser?._id || currentUser?.userId;
    if (!userId) {
      setUnreadCount(0);
      return () => {
        isMounted = false;
      };
    }

    let timer = null;
    let stopped = false;
    const POLL_FOREGROUND_MS = 3000;
    const POLL_BACKGROUND_MS = 15000;
    const POLL_RATE_LIMIT_MS = 60000;

    const schedule = (delay) => {
      if (stopped) return;
      timer = window.setTimeout(tick, delay);
    };

    const tick = async () => {
      const status = await fetchUnreadCount();
      const isForeground = document.visibilityState === 'visible' && document.hasFocus();
      const shouldPollSlowly = !isForeground;
      if (status === 429) {
        schedule(POLL_RATE_LIMIT_MS);
      } else if (shouldPollSlowly) {
        schedule(POLL_BACKGROUND_MS);
      } else {
        schedule(POLL_FOREGROUND_MS);
      }
    };

    tick();

    const handleWakeUp = () => {
      if (stopped) return;
      // Fetch immediately when user comes back to tab/window.
      fetchUnreadCount();
    };
    document.addEventListener("visibilitychange", handleWakeUp);
    window.addEventListener("focus", handleWakeUp);
    const unsubscribeRealtime = notificationService.subscribeRealtime(() => {
      fetchUnreadCount();
    });

    return () => {
      isMounted = false;
      stopped = true;
      if (timer) {
        window.clearTimeout(timer);
      }
      document.removeEventListener("visibilitychange", handleWakeUp);
      window.removeEventListener("focus", handleWakeUp);
      unsubscribeRealtime();
    };
  }, [currentUser?._id, currentUser?.userId, currentUser?.role]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getNotificationPath = () => {
    const role = String(currentUser?.role || '').toLowerCase();
    if (role === 'admin') return '/admin/notifications';
    if (role === 'teacher') return '/teacher/notifications';
    if (role === 'parent') return '/parent/notifications';
    if (role === 'student') return '/student/notifications';
    return '/';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 h-16 px-3 sm:px-6 flex items-center justify-end gap-2 sm:gap-4 sticky top-0 z-20">
        <ThemeToggle />
        <button
          onClick={() => navigate('/')}
          className="p-2 text-gray-400 dark:text-slate-300 hover:text-gray-600 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          title="Về trang chủ website"
        >
          <Home size={20} />
        </button>
        <button
          onClick={() => navigate(getNotificationPath())}
          onDoubleClick={() => {
            debugPlayNotificationSound().then((ok) => {
              if (!ok) {
                alert('Trình duyệt đang chặn âm thanh. Hãy click bất kỳ vào trang rồi thử lại.');
              }
            });
          }}
          className="p-2 text-gray-400 dark:text-slate-300 hover:text-gray-600 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors relative"
          title="Notifications (double-click để test âm thanh)"
        >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] rounded-full border border-white dark:border-slate-900 flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
        </button>
        <div className="h-8 w-[1px] bg-gray-200 dark:bg-slate-700 mx-0 sm:mx-1"></div>
        <div className="flex items-center gap-1 sm:gap-3">
            <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {currentUser?.fullName || currentUser?.username || "User"}
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-300">
                  {getRoleLabel(currentUser?.role)}
                </div>
            </div>
            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <User size={20} />
            </div>
            <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 dark:text-slate-300 hover:text-red-600 rounded-full hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors ml-1"
                title="Đăng xuất"
            >
                <LogOut size={18} />
            </button>
        </div>
    </div>
  );
};

export default AdminHeader;
