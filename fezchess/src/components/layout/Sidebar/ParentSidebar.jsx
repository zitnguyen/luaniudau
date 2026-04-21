import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, User, LogOut, MonitorPlay, TrendingUp, Bell } from 'lucide-react';
import authService from '../../../services/authService';

const ParentSidebar = () => {
    const navItems = [
        { path: '/parent/dashboard', label: 'Tổng quan', icon: <Home size={20} /> },
        { path: '/parent/schedule', label: 'Lịch học con', icon: <Calendar size={20} /> },
        { path: '/parent/notifications', label: 'Notifications', icon: <Bell size={20} /> },
    ];

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/login';
    };

    return (
        <div style={{ width: '250px', background: 'white', borderRight: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0 }}>
            <div style={{ padding: '24px', borderBottom: '1px solid #E5E7EB' }}>
               <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563EB', margin: 0 }}>ZChess Parent</h2>
            </div>
            
            <nav style={{ flex: 1, padding: '12px' }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 16px',
                            borderRadius: '8px',
                            color: isActive ? '#2563EB' : '#4B5563',
                            background: isActive ? '#EFF6FF' : 'transparent',
                            textDecoration: 'none',
                            marginBottom: '4px',
                            fontWeight: isActive ? 500 : 400
                        })}
                    >
                        {item.icon}
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div style={{ padding: '16px', borderTop: '1px solid #E5E7EB' }}>
                <button 
                    onClick={handleLogout}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '12px', 
                        width: '100%', padding: '12px 16px', 
                        border: 'none', background: 'transparent', 
                        color: '#DC2626', cursor: 'pointer', borderRadius: '8px',
                        textAlign: 'left'
                    }}
                >
                    <LogOut size={20} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
};

export default ParentSidebar;
