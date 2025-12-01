import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Assignment as AssignmentIcon,
  VerifiedUser as VerifiedIcon,
  School as SchoolIcon,
  CheckCircle as ApprovalIcon,
  Payment as PaymentIcon,
  Analytics as AnalyticsIcon,
  People as PeopleIcon,
  Description as CertificateIcon,
  Refresh as RenewalIcon,
  Description,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '@/types';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
  userRole: UserRole;
}

interface NavItem {
  text: string;
  icon: React.ReactElement;
  path: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  // Client Navigation
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/client', roles: ['client'] },
  { text: 'Verify Certificate', icon: <VerifiedIcon />, path: '/client/verify', roles: ['client'] },
  { text: 'Request Renewal', icon: <RenewalIcon />, path: '/client/renewal', roles: ['client'] },
  { text: 'Service History', icon: <AssignmentIcon />, path: '/client/history', roles: ['client'] },
  
  // Inspector Navigation
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/inspector', roles: ['inspector'] },
  { text: 'Job Orders', icon: <AssignmentIcon />, path: '/inspector/jobs', roles: ['inspector'] },
  
  // Trainer Navigation
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/trainer', roles: ['trainer'] },
  { text: 'Training Schedule', icon: <SchoolIcon />, path: '/trainer/schedule', roles: ['trainer'] },
  { text: 'Submit Results', icon: <AssignmentIcon />, path: '/trainer/results', roles: ['trainer'] },
  
  // Supervisor Navigation
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/supervisor', roles: ['supervisor'] },
  { text: 'Approval Queue', icon: <ApprovalIcon />, path: '/supervisor/approvals', roles: ['supervisor'] },
  { text: 'Team Performance', icon: <AnalyticsIcon />, path: '/supervisor/team', roles: ['supervisor'] },
  
  // Accountant Navigation
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/accountant', roles: ['accountant'] },
  { text: 'Payment Verification', icon: <PaymentIcon />, path: '/accountant/payments', roles: ['accountant'] },
  { text: 'Invoice Management', icon: <Description />, path: '/accountant/invoices', roles: ['accountant'] },
  
  // Manager/GM Navigation
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/manager', roles: ['manager', 'gm'] },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/manager/analytics', roles: ['manager', 'gm'] },
  { text: 'Certificates', icon: <CertificateIcon />, path: '/manager/certificates', roles: ['manager', 'gm'] },
  { text: 'User Management', icon: <PeopleIcon />, path: '/manager/users', roles: ['manager', 'gm'] },
];

const drawerWidth = 240;

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose, userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <Drawer
      variant="temporary"
      open={open}
      onClose={onClose}
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
        },
      }}
    >
      <Toolbar />
      <Divider />
      <List>
        {filteredNavItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

