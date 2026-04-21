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
import { getRoleLabel } from "../../../constants/roleLabel";
import { useSystemSettings } from "../../../context/SystemSettingsContext";

const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const { settings } = useSystemSettings();

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const items = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
    { to: "/admin/students", icon: Users, label: "Học viên" },
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
        className={`fixed top-0 left-0 bottom-0 h-screen w-[82vw] max-w-72 md:w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 md:translate-x-0 flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="h-16 flex items-center px-4 md:px-6 border-b border-gray-100 mb-2">
          {settings?.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="Center logo"
              className="w-9 h-9 rounded-lg object-cover border border-gray-200 mr-3"
            />
          ) : (
            <div className="text-2xl mr-3">♟️</div>
          )}
          <div>
            <div className="font-bold text-gray-900 leading-tight text-base md:text-sm">
              {settings?.centerName || "Z CHESS"}
            </div>
            <div className="text-xs text-gray-500 font-medium truncate max-w-[130px] md:max-w-[150px]">
              {user?.fullName || getRoleLabel(user?.role) || "User"}
            </div>
          </div>
          <button
            onClick={onClose}
            className="ml-auto md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded"
          >
            ✕
          </button>
        </div>

        <nav className="flex-1 min-h-0 overflow-y-auto py-3 px-2 md:px-3 space-y-1 pb-6">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[15px] md:text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`
              }
              onClick={onClose}
            >
              {({ isActive }) => (
                <>
                  {item.icon ? (
                    <item.icon
                      size={20}
                      className={
                        isActive
                          ? "text-white"
                          : "text-gray-500 group-hover:text-gray-700"
                      }
                    />
                  ) : (
                    item.customIcon
                  )}
                  <span className="truncate">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors group"
          >
            <LogOut
              size={20}
              className="text-gray-500 group-hover:text-red-500"
            />
            <span>Đăng xuất</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
