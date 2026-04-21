import React from 'react';
import { useLocation } from "react-router-dom";
import ParentSidebar from '../components/layout/Sidebar/ParentSidebar';
import AdminHeader from '../components/layout/AdminHeader';

const ParentLayout = ({ children }) => {
  const location = useLocation();
  const contentRef = React.useRef(null);

  React.useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
      <ParentSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />
        <main ref={contentRef} className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default ParentLayout;
