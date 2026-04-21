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
} from "lucide-react";
import authService from "../../../services/authService";
import SidebarHeader from "./SidebarHeader";

const TeacherSidebar = ({ isOpen, onClose }) => {
  const user = authService.getCurrentUser();
  const navigate = useNavigate();

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
    { to: "/teacher/notifications", icon: Bell, label: "Notifications" },
    { to: "/teacher/settings", icon: Settings, label: "Cài đặt" },
  ];

  const linkClass = ({ isActive }) =>
    `group flex items-center gap-3 px-3 py-2.5 min-h-12 rounded-xl text-[15px] md:text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
    }`;

  const iconClass = (isActive) =>
    isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700";

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
        className={`fixed top-0 left-0 bottom-0 h-screen w-[82vw] max-w-72 md:w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 md:translate-x-0 ${
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

export default TeacherSidebar;
