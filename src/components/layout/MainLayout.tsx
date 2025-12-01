import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';
import { UserRole } from '@/types';

interface MainLayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  userRoles: UserRole[];
  onRoleChange: (role: UserRole) => void;
  userName: string;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  userRole,
  userRoles,
  onRoleChange,
  userName,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Header
        onMenuClick={toggleSidebar}
        userRole={userRole}
        userRoles={userRoles}
        onRoleChange={onRoleChange}
        userName={userName}
        notificationCount={3}
      />
      <Sidebar open={sidebarOpen} onClose={toggleSidebar} userRole={userRole} />
      <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};




