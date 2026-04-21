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
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">♟️</div>
        <div>
           <div className="logo-title">Z CHESS</div>
           <div className="logo-subtitle">{user?.fullName || getRoleLabel(user?.role) || "User"}</div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/student/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Tổng quan</span>
        </NavLink>
        <NavLink to="/student/schedule" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Calendar size={20} />
          <span>Lịch học</span>
        </NavLink>
        <NavLink to="/student/courses" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BookOpen size={20} />
          <span>Khoá học của tôi</span>
        </NavLink>
        <NavLink to="/student/assignments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BookOpen size={20} />
          <span>Bài tập</span>
        </NavLink>
        <NavLink to="/student/tuition" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Wallet size={20} />
          <span>Học phí</span>
        </NavLink>
        <NavLink to="/student/profile" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <UserCircle size={20} />
          <span>Hồ sơ</span>
        </NavLink>
        <NavLink to="/student/notifications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Bell size={20} />
          <span>Notifications</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item logout" style={{width: '100%', background: 'none', border: 'none', cursor: 'pointer', justifyContent: 'flex-start'}}>
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
      </div>
    </div>
  );
};

export default StudentSidebar;
