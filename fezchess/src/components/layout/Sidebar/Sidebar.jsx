import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, 
  CalendarRange, 
  BookOpen,
  ClipboardCheck,  LogOut, UserPlus, MonitorPlay, Wallet } from 'lucide-react';
import authService from '../../../services/authService';


const Sidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      ></div>
      
      <div className={`fixed top-0 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 transform transition-transform duration-300 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100 mb-2">
          <div className="text-2xl mr-3">♟️</div>
          <div>
             <div className="font-bold text-gray-900 leading-tight">Z CHESS</div>
             <div className="text-xs text-gray-500 font-medium">{user?.fullName || "Admin"}</div>
          </div>
          {/* Close button for mobile */}
          <button 
            onClick={onClose}
            className="ml-auto md:hidden p-1 text-gray-500 hover:bg-gray-100 rounded"
          >
            ✕
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {[
            { to: "/dashboard", icon: LayoutDashboard, label: "Tổng quan" },
            { to: "/students", icon: Users, label: "Học viên" },
            { to: "/parents", icon: Users, label: "Phụ huynh" },
            { to: "/attendance", icon: Calendar, label: "Điểm danh" },
            { to: "/schedule", icon: CalendarRange, label: "Lịch học" },
            { to: "/admin/courses", icon: BookOpen, label: "Khóa học" },
            { to: "/progress", icon: ClipboardCheck, label: "Phiếu học tập" },
            { to: "/finance", icon: Wallet, label: "Tài chính" },
            { to: "/cms/posts", icon: null, label: "Tin tức", customIcon: <span className="font-bold text-lg w-5 flex justify-center">N</span> },
            { to: "/crm/inquiries", icon: null, label: "Liên hệ", customIcon: <span className="font-bold text-lg w-5 flex justify-center">L</span> },
            { to: "/teachers", icon: null, label: "Giáo viên", customIcon: <span className="font-bold text-lg w-5 flex justify-center">T</span> },
          ].map((item, index) => (
            <NavLink 
              key={index}
              to={item.to} 
              className={({ isActive }) => `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive 
                  ? 'bg-primary text-primary-foreground shadow-md shadow-primary/25' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={onClose}
            >
              {({ isActive }) => (
                <>
                  {item.icon ? (
                      <item.icon size={20} className={isActive ? "text-white" : "text-gray-500 group-hover:text-gray-700"} />
                  ) : (
                      <span className="font-bold text-lg w-5 flex justify-center">T</span>
                  )}
                  <span>{item.label}</span>
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
              <LogOut size={20} className="text-gray-500 group-hover:text-red-500" />
              <span>Đăng xuất</span>
            </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
