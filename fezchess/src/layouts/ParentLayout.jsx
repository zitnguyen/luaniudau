import React from 'react';
import ParentSidebar from '../components/layout/Sidebar/ParentSidebar';
import AdminHeader from '../components/layout/AdminHeader';

const ParentLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <ParentSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AdminHeader />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default ParentLayout;
