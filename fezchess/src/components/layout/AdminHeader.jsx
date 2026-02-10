import React from 'react';
import { Bell, HelpCircle, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminHeader = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="bg-white border-b border-gray-200 h-16 px-6 flex items-center justify-end gap-4 sticky top-0 z-20">
        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
        </button>
        <div className="h-8 w-[1px] bg-gray-200 mx-1"></div>
        <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900">Admin User</div>
                <div className="text-xs text-gray-500">Administrator</div>
            </div>
            <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <User size={20} />
            </div>
            <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors ml-1"
                title="Đăng xuất"
            >
                <LogOut size={18} />
            </button>
        </div>
    </div>
  );
};

export default AdminHeader;
