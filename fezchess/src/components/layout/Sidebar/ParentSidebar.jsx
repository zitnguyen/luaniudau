import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Calendar, LogOut, Bell, MessageCircle, PlayCircle } from 'lucide-react';
import authService from '../../../services/authService';
import chatService from '../../../services/chatService';

const ParentSidebar = () => {
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
    const navItems = [
        { path: '/parent/dashboard', label: 'Tổng quan', icon: <Home size={20} /> },
        { path: '/parent/schedule', label: 'Lịch học con', icon: <Calendar size={20} /> },
        { path: '/parent/courses', label: 'Khóa học của tôi', icon: <PlayCircle size={20} /> },
        { path: '/parent/notifications', label: 'Thông báo', icon: <Bell size={20} /> },
        { path: '/parent/chat', label: 'Chat với Admin', icon: <MessageCircle size={20} /> },
    ];

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/login';
    };

    return (
        <div className="w-64 bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col h-screen sticky top-0">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
               <h2 className="text-xl font-bold text-primary m-0">ZChess Parent</h2>
            </div>
            
            <nav className="flex-1 p-3">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-4 py-3 rounded-lg no-underline mb-1 ${
                            isActive
                              ? "bg-blue-50 dark:bg-slate-800 text-primary font-medium"
                              : "text-gray-600 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800"
                          }`
                        }
                    >
                        {item.icon}
                        <span>{item.label}</span>
                        {item.path === '/parent/chat' && unreadCount > 0 && (
                          <span className="ml-auto text-[11px] px-1.5 py-0.5 rounded-full bg-red-500 text-white min-w-[20px] text-center">
                            +{unreadCount}
                          </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-slate-700">
                <button 
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 border-0 bg-transparent text-red-600 cursor-pointer rounded-lg text-left hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                    <LogOut size={20} />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
};

export default ParentSidebar;
