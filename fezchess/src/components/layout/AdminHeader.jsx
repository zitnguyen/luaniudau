import React from 'react';
import { Bell, HelpCircle, User, LogOut } from 'lucide-react';
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
    const isRoleAllowedForSound = () => {
      const role = String(currentUser?.role || '').toLowerCase();
      return role === 'teacher' || role === 'parent' || role === 'student';
    };
    const shouldPlaySound = () =>
      document.visibilityState === 'visible' &&
      document.hasFocus() &&
      Boolean(currentUser?._id || currentUser?.userId) &&
      isRoleAllowedForSound();

    const fetchUnreadCount = async () => {
      try {
        const data = await notificationService.getMine();
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
      } catch {
        if (isMounted) setUnreadCount(0);
      }
    };
    fetchUnreadCount();
    const timer = setInterval(fetchUnreadCount, 12000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [currentUser?._id, currentUser?.userId, currentUser?.role]);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const getNotificationPath = () => {
    const role = String(currentUser?.role || '').toLowerCase();
    if (role === 'admin') return '/admin/notifications/new';
    if (role === 'teacher') return '/teacher/notifications';
    if (role === 'parent') return '/parent/notifications';
    if (role === 'student') return '/student/notifications';
    return '/';
  };

  return (
    <div className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-end gap-4 sticky top-0 z-20">
        <ThemeToggle />
        <button
          onClick={() => navigate(getNotificationPath())}
          onDoubleClick={() => {
            debugPlayNotificationSound().then((ok) => {
              if (!ok) {
                // eslint-disable-next-line no-alert
                alert('Trình duyệt đang chặn âm thanh. Hãy click bất kỳ vào trang rồi thử lại.');
              }
            });
          }}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors relative"
          title="Notifications (double-click để test âm thanh)"
        >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] rounded-full border border-white flex items-center justify-center">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
        </button>
        <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>
        <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900">
                  {currentUser?.fullName || currentUser?.username || "User"}
                </div>
                <div className="text-xs text-gray-500">
                  {getRoleLabel(currentUser?.role)}
                </div>
            </div>
            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <User size={20} />
            </div>
            <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors ml-1"
                title="Đăng xuất"
            >
                <LogOut size={18} />
            </button>
        </div>
    </div>
  );
};

export default AdminHeader;
