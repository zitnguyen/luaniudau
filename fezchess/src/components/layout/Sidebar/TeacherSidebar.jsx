import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BookOpen, Calendar, Users, BarChart2, LogOut } from 'lucide-react';
import authService from '../../../services/authService';


const TeacherSidebar = () => {
  const user = authService.getCurrentUser();
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo-icon">📦</div>
        <div>
           <div className="logo-title">Z CHESS</div>
           <div className="logo-subtitle">{user?.fullName || "Teacher Portal"}</div>
        </div>
      </div>
      
      <nav className="sidebar-nav">
        <NavLink to="/teacher/dashboard" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Tổng quan</span>
        </NavLink>
        <NavLink to="/teacher/classes" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BookOpen size={20} />
          <span>Lớp học của tôi</span>
        </NavLink>
        <NavLink to="/teacher/assessments" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BarChart2 size={20} />
          <span>Đánh giá học viên</span>
        </NavLink>
        <NavLink to="/teacher/payroll" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Calendar size={20} />
          <span>Bảng lương</span>
        </NavLink>
        <NavLink to="/teacher/schedule" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <BookOpen size={20} />
          <span>Lịch dạy</span>
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
          <div style={{fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: '8px', paddingLeft: '12px'}}>HỆ THỐNG</div>
          <NavLink to="/teacher/settings" className="nav-item">
            <span style={{marginRight: '8px'}}>⚙️</span>
            <span>Cài đặt</span>
          </NavLink>
          
          <button onClick={handleLogout} className="nav-item logout" style={{width: '100%', background: 'none', border: 'none', cursor: 'pointer', justifyContent: 'flex-start'}}>
            <LogOut size={20} />
            <span>Đăng xuất</span>
          </button>
      </div>
    </div>
  );
};

export default TeacherSidebar;
