import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { Bell, Home } from "lucide-react";
import { useSystemSettings } from "../../context/SystemSettingsContext";
import ThemeToggle from "../common/ThemeToggle";
import authService from "../../services/authService";
import { getDashboardPathByRole } from "../../constants/roleRoutes";
import notificationService from "../../services/notificationService";
import AnnouncementBar from "../common/AnnouncementBar";

const navLinks = [
  { name: "Trang chủ", path: "/" },
  { name: "Khóa học", path: "/courses" },
  { name: "Giáo viên", path: "/teachers" },
  { name: "Tin tức", path: "/news" },
  { name: "Liên hệ", path: "/contact" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { settings } = useSystemSettings();
  const currentUser = authService.getCurrentUser();
  const notificationRef = useRef(null);

  const getNotificationPath = () => {
    const role = String(currentUser?.role || "").toLowerCase();
    if (role === "admin") return "/admin/notifications";
    if (role === "teacher") return "/teacher/notifications";
    if (role === "parent") return "/parent/notifications";
    if (role === "student") return "/student/notifications";
    return "/";
  };

  useEffect(() => {
    let mounted = true;
    const fetchUnread = async () => {
      if (!currentUser?._id && !currentUser?.userId) {
        setUnreadCount(0);
        return;
      }
      try {
        const data = await notificationService.getMine();
        if (mounted) {
          setUnreadCount(Number(data?.unreadCount || 0));
        }
      } catch {
        if (mounted) setUnreadCount(0);
      }
    };
    fetchUnread();
    const unsubscribeRealtime = notificationService.subscribeRealtime(() => {
      fetchUnread();
      if (showNotifications) {
        fetchNotifications();
      }
    });
    return () => {
      mounted = false;
      unsubscribeRealtime();
    };
  }, [currentUser?._id, currentUser?.userId, showNotifications]);

  useEffect(() => {
    if (!showNotifications) return undefined;
    const onClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [showNotifications]);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const data = await notificationService.getMine({ force: true });
      const list =
        data?.notifications ||
        data?.items ||
        data?.data ||
        [];
      setNotifications(Array.isArray(list) ? list.slice(0, 8) : []);
      setUnreadCount(Number(data?.unreadCount || 0));
    } catch {
      setNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleToggleNotifications = async () => {
    const next = !showNotifications;
    setShowNotifications(next);
    if (next) {
      await fetchNotifications();
    }
  };

  const handleGoHome = () => {
    navigate("/");
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/");
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border flex flex-col">
      <div className="container mx-auto px-4 sm:px-6">
        <nav className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <button onClick={handleGoHome} className="flex items-center gap-2 md:gap-3">
            {settings?.logoUrl ? (
              <motion.img
                whileHover={{ rotate: 8 }}
                transition={{ duration: 0.3 }}
                src={settings.logoUrl}
                alt="Center logo"
                className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-xl object-cover border border-border"
              />
            ) : (
              <motion.div
                whileHover={{ rotate: 15 }}
                transition={{ duration: 0.3 }}
                className="w-8 h-8 md:w-12 md:h-12 bg-secondary rounded-lg md:rounded-xl flex items-center justify-center"
              >
                <span className="text-xl md:text-2xl">♔</span>
              </motion.div>
            )}
            <div className="text-left">
              <h1 className="font-display text-lg md:text-xl font-bold">
                {settings?.centerName || "Z Chess"}
              </h1>
              <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">Trung tâm Cờ Vua</p>
            </div>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative py-2 font-medium transition-colors ${
                  location.pathname === link.path
                    ? "text-primary dark:text-white"
                    : "text-foreground dark:text-slate-200 hover:text-primary dark:hover:text-white"
                }`}
              >
                {link.name}
                {location.pathname === link.path && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary dark:bg-white rounded-full"
                  />
                )}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {currentUser ? (
              <>
                <Link
                  to={getDashboardPathByRole(currentUser.role)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="Vào dashboard"
                  aria-label="Vào dashboard"
                >
                  <Home size={20} />
                </Link>
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={handleToggleNotifications}
                    className="relative p-2 rounded-lg hover:bg-muted transition-colors"
                    title="Thông báo"
                    aria-label="Thông báo"
                  >
                    <Bell size={20} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] rounded-full border border-white dark:border-slate-900 flex items-center justify-center">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </button>
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-[360px] max-w-[90vw] bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl shadow-xl z-[60] overflow-hidden">
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Thông báo</span>
                        <button
                          onClick={() => navigate(getNotificationPath())}
                          className="text-xs text-primary hover:underline"
                        >
                          Xem tất cả
                        </button>
                      </div>
                      <div className="max-h-[360px] overflow-y-auto">
                        {loadingNotifications ? (
                          <div className="px-4 py-6 text-sm text-gray-500 dark:text-slate-300">
                            Đang tải thông báo...
                          </div>
                        ) : notifications.length > 0 ? (
                          notifications.map((item) => (
                            <button
                              key={item?._id || item?.id}
                              onClick={() => {
                                setShowNotifications(false);
                                navigate(getNotificationPath());
                              }}
                              className="w-full text-left px-4 py-3 border-b border-gray-100 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-slate-800"
                            >
                              <div className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                                {item?.title || "Thông báo mới"}
                              </div>
                              <div className="text-xs text-gray-500 dark:text-slate-300 mt-1 line-clamp-2">
                                {item?.message || item?.content || "Nhấn để xem chi tiết"}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-6 text-sm text-gray-500 dark:text-slate-300">
                            Chưa có thông báo nào.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="font-medium hover:text-primary">
                  Đăng nhập
                </Link>
                <Link to="/signup">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg"
                  >
                    Đăng ký
                  </motion.button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-muted"
            >
              {isOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block py-3 px-4 rounded-xl font-medium ${
                      location.pathname === link.path
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                <div className="pt-2 border-t border-border mt-2 space-y-2">
                  {currentUser ? (
                    <>
                      <button
                        onClick={() => {
                          navigate(getNotificationPath());
                          setIsOpen(false);
                        }}
                        className="w-full flex items-center gap-2 py-3 px-4 rounded-xl font-medium hover:bg-muted"
                      >
                        <Bell size={18} />
                        <span>Thông báo</span>
                        {unreadCount > 0 ? (
                          <span className="ml-auto min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        ) : null}
                      </button>
                      <Link
                        to={getDashboardPathByRole(currentUser.role)}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 py-3 px-4 rounded-xl font-medium hover:bg-muted"
                      >
                        <Home size={18} />
                        <span>Vào dashboard</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left py-3 px-4 rounded-xl font-medium hover:bg-muted"
                      >
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsOpen(false)}
                        className="block py-3 px-4 rounded-xl font-medium hover:bg-muted"
                      >
                        Đăng nhập
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setIsOpen(false)}
                        className="block py-3 px-4 rounded-xl font-medium hover:bg-muted"
                      >
                        Đăng ký
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnnouncementBar />
    </header>
  );
};

export default Header;
