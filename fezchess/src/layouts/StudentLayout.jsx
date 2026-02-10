import React from 'react';
import StudentSidebar from '../components/layout/Sidebar/StudentSidebar';
import AdminHeader from '../components/layout/AdminHeader';

const StudentLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9FAFB' }}>
      <StudentSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <AdminHeader />
        <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
