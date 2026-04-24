import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  ClipboardCheck,
  BarChart2,
  LogOut,
  Settings,
  Bell,
  MessageCircle,
} from "lucide-react";
import authService from "../../../services/authService";
import SidebarHeader from "./SidebarHeader";
import chatService from "../../../services/chatService";

const TeacherSidebar = ({ isOpen, onClose }) => {
  const user = authService.getCurrentUser();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    let mounted = true;
    const loadUnread = async () => {
      try {
        const data = await chatService.getUnreadSummary();
        if (!mounted) return;
        setUnreadCount(Number(data?.totalUnread || 0));
      } catch {
        if (mounted) setUnreadCount(0);
      }
    };
    loadUnread();
    const timer = window.setInterval(loadUnread, 10000);
    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const items = [
    { to: "/teacher/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
    { to: "/teacher/classes", icon: BookOpen, label: "Lớp học của tôi" },
    { to: "/teacher/assessments", icon: BarChart2, label: "Đánh giá học viên" },
    { to: "/teacher/attendance", icon: ClipboardCheck, label: "Điểm danh" },
    { to: "/teacher/payroll", icon: Calendar, label: "Ca dạy" },
    { to: "/teacher/schedule", icon: BookOpen, label: "Lịch dạy" },
    { to: "/teacher/notifications", icon: Bell, label: "Thông báo" },
    { to: "/teacher/chat", icon: MessageCircle, label: "Chat với Admin" },
    { to: "/teacher/settings", icon: Settings, label: "Cài đặt" },
  ];

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-3 py-2.5 min-h-12 rounded-xl text-[15px] md:text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
        : "text-gray-600 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
    }`;

  const iconClass = (isActive) =>
    isActive ? "text-white" : "text-gray-500 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-white";

  const handleClose = () => {
    if (onClose) onClose();
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={handleClose}
      ></div>

      <div
        className={`fixed top-0 left-0 bottom-0 h-screen w-[82vw] max-w-72 md:w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 z-50 transform transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col`}
      >
        <SidebarHeader user={user} onClose={handleClose} className="mb-2" />

        <nav className="flex-1 min-h-0 overflow-y-auto py-3 px-2 md:px-3 space-y-1 pb-6">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
              onClick={handleClose}
            >
              {({ isActive }) => (
                <>
                  <span className="w-5 h-5 shrink-0 flex items-center justify-center">
                    <item.icon size={20} className={iconClass(isActive)} />
                  </span>
                  <span className="truncate leading-none">{item.label}</span>
                  {item.to === "/teacher/chat" && unreadCount > 0 && (
                    <span className="ml-auto text-[11px] px-1.5 py-0.5 rounded-full bg-red-500 text-white min-w-[20px] text-center">
                      +{unreadCount}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-slate-700 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 rounded-xl transition-colors group"
          >
            <LogOut
              size={20}
              className="text-gray-500 dark:text-slate-400 group-hover:text-red-500"
            />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default TeacherSidebar;
