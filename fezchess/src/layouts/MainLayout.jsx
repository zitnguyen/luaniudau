import React from 'react';
import { useLocation } from "react-router-dom";
import Sidebar from '../components/layout/Sidebar/Sidebar';
import AdminHeader from '../components/layout/AdminHeader';
import AnnouncementBar from '../components/common/AnnouncementBar';
import { useSystemSettings } from "../context/SystemSettingsContext";

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const { settings } = useSystemSettings();
  const location = useLocation();
  const contentRef = React.useRef(null);

  React.useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950 relative">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-w-0 max-w-full md:pl-64 transition-all duration-300">
        {/* Mobile Header Trigger */}
        <div className="md:hidden sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
                <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 -ml-2 text-gray-600 dark:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>
                <div className="flex items-center gap-2">
                    {settings?.logoUrl ? (
                      <img
                        src={settings.logoUrl}
                        alt="Center logo"
                        className="w-7 h-7 rounded-md object-cover border border-gray-200 dark:border-slate-600"
                      />
                    ) : (
                      <span className="text-xl">♟️</span>
                    )}
                    <span className="font-bold text-lg text-gray-900 dark:text-white">
                      {settings?.centerName || "Z CHESS"}
                    </span>
                </div>
            </div>
        </div>

        <AdminHeader />
        <AnnouncementBar />
        <main ref={contentRef} className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
