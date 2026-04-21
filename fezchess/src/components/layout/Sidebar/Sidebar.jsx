import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarRange,
  BookOpen,
  ClipboardCheck,
  LogOut,
  Wallet,
  Bell,
  Settings,
} from "lucide-react";
import authService from "../../../services/authService";
import SidebarHeader from "./SidebarHeader";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const items = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
    { to: "/students", icon: Users, label: "Học viên" },
    { to: "/parents", icon: Users, label: "Phụ huynh" },
    { to: "/classes", icon: BookOpen, label: "Lớp học" },
    { to: "/enrollments", icon: BookOpen, label: "Ghi danh" },
    { to: "/attendance", icon: Calendar, label: "Điểm danh" },
    { to: "/schedule", icon: CalendarRange, label: "Lịch học" },
    { to: "/admin/courses", icon: BookOpen, label: "Khóa học" },
    { to: "/progress", icon: ClipboardCheck, label: "Phiếu học tập" },
    { to: "/finance", icon: Wallet, label: "Tài chính" },
    { to: "/admin/payroll", icon: Wallet, label: "Payroll" },
    { to: "/admin/notifications/new", icon: Bell, label: "Notifications" },
    { to: "/admin/settings", icon: Settings, label: "System Settings" },
    {
      to: "/cms/posts",
      icon: null,
      label: "Tin tức (CMS)",
      customIcon: (
        <span className="font-bold text-lg w-5 flex justify-center">N</span>
      ),
    },
    {
      to: "/cms/hero",
      icon: null,
      label: "Public CMS",
      customIcon: (
        <span className="font-bold text-lg w-5 flex justify-center">H</span>
      ),
    },
    {
      to: "/crm/inquiries",
      icon: null,
      label: "Liên hệ",
      customIcon: (
        <span className="font-bold text-lg w-5 flex justify-center">L</span>
      ),
    },
    {
      to: "/admin/teachers",
      icon: null,
      label: "Giáo viên",
      customIcon: (
        <span className="font-bold text-lg w-5 flex justify-center">T</span>
      ),
    },
  ];

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      ></div>

      <div
        className={`fixed top-0 left-0 bottom-0 h-screen w-[82vw] max-w-72 md:w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 z-50 transform transition-transform duration-300 md:translate-x-0 flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <SidebarHeader user={user} onClose={onClose} className="mb-2" />

        <nav className="flex-1 min-h-0 overflow-y-auto py-3 px-2 md:px-3 space-y-1 pb-6">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 min-h-12 rounded-xl text-[15px] md:text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-gray-600 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                }`
              }
              onClick={onClose}
            >
              {({ isActive }) => (
                <>
                  {item.icon ? (
                    <span className="w-5 h-5 shrink-0 flex items-center justify-center">
                      <item.icon
                        size={20}
                        className={
                          isActive
                            ? "text-white"
                            : "text-gray-500 dark:text-slate-400 group-hover:text-gray-700 dark:group-hover:text-white"
                        }
                      />
                    </span>
                  ) : (
                    <span className="w-5 h-5 shrink-0 flex items-center justify-center">
                      {item.customIcon}
                    </span>
                  )}
                  <span className="truncate leading-none">{item.label}</span>
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

export default Sidebar;
