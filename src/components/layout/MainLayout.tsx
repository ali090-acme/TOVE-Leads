import React, { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import { Header } from '@/components/common/Header';
import { Sidebar } from '@/components/common/Sidebar';
import { UserRole } from '@/types';
import { useAppContext } from '@/context/AppContext';

interface MainLayoutProps {
  children: React.ReactNode;
  userRole: UserRole;
  userRoles: UserRole[];
  onRoleChange: (role: UserRole) => void;
  userName?: string; // Made optional since we'll get it from context
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  userRole,
  userRoles,
  onRoleChange,
  userName: propUserName,
}) => {
  const { currentUser } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get userName ONLY from context (currentUser) - NO fallback
  // This ensures we always show the actual logged-in user's name
  const userName = currentUser?.name || '';
  
  // Debug logging
  console.log('🏗️ MainLayout: currentUser:', currentUser?.name, currentUser?.id, 'userName:', userName);
  
  // Log warning if currentUser is missing (for debugging)
  if (!currentUser) {
    console.error('❌ MainLayout: No currentUser found in context! User should be logged in.');
  }

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




