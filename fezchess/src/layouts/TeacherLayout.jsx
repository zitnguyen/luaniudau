import React from 'react';
import TeacherSidebar from '../components/layout/Sidebar/TeacherSidebar';
import AdminHeader from '../components/layout/AdminHeader';

const TeacherLayout = ({ children }) => {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <TeacherSidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
           <AdminHeader />
           <main style={{ flex: 1, padding: '24px', overflowY: 'auto', background: '#F9FAFB' }}>
             {children}
           </main>
      </div>
    </div>
  );
};

export default TeacherLayout;
