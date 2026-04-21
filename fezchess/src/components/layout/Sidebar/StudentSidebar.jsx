import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, BookOpen, Wallet, UserCircle, LogOut, Bell } from 'lucide-react';
import authService from '../../../services/authService';
import { getRoleLabel } from '../../../constants/roleLabel';


const StudentSidebar = () => {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-gray-200 dark:border-slate-700 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-primary/10 dark:bg-white/10 flex items-center justify-center">♟️</div>
        <div>
           <div className="font-bold text-gray-900 dark:text-white">Z CHESS</div>
           <div className="text-xs text-gray-500 dark:text-slate-300">{user?.fullName || getRoleLabel(user?.role) || "User"}</div>
        </div>
      </div>
      
      <nav className="flex-1 p-3 space-y-1">
        <NavLink to="/student/dashboard" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-blue-50 dark:bg-slate-800 text-primary' : 'text-gray-600 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
          <LayoutDashboard size={20} />
          <span>Tổng quan</span>
        </NavLink>
        <NavLink to="/student/schedule" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-blue-50 dark:bg-slate-800 text-primary' : 'text-gray-600 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
          <Calendar size={20} />
          <span>Lịch học</span>
        </NavLink>
        <NavLink to="/student/courses" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-blue-50 dark:bg-slate-800 text-primary' : 'text-gray-600 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
          <BookOpen size={20} />
          <span>Khoá học của tôi</span>
        </NavLink>
        <NavLink to="/student/assignments" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-blue-50 dark:bg-slate-800 text-primary' : 'text-gray-600 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
          <BookOpen size={20} />
          <span>Bài tập</span>
        </NavLink>
        <NavLink to="/student/tuition" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-blue-50 dark:bg-slate-800 text-primary' : 'text-gray-600 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
          <Wallet size={20} />
          <span>Học phí</span>
        </NavLink>
        <NavLink to="/student/profile" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-blue-50 dark:bg-slate-800 text-primary' : 'text-gray-600 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
          <UserCircle size={20} />
          <span>Hồ sơ</span>
        </NavLink>
        <NavLink to="/student/notifications" className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-lg ${isActive ? 'bg-blue-50 dark:bg-slate-800 text-primary' : 'text-gray-600 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
          <Bell size={20} />
          <span>Notifications</span>
        </NavLink>
      </nav>
      
      <div className="p-4 border-t border-gray-200 dark:border-slate-700">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border-0 bg-transparent text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/30">
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
      </div>
    </div>
  );
};

export default StudentSidebar;
