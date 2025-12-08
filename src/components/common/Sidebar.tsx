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
  Typography,
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
  Description as DescriptionIcon,
  Refresh as RenewalIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Help as HelpIcon,
  List as ListIcon,
  Inventory as InventoryIcon,
  CalendarToday as CalendarIcon,
  Security as SecurityIcon,
  Label as LabelIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserRole } from '@/types';
import { useAppContext } from '@/context/AppContext';
import { canCreateJobOrder } from '@/utils/permissions';

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
  { text: 'My Certificates', icon: <CertificateIcon />, path: '/client/certificates', roles: ['client'] },
  { text: 'Verify Certificate', icon: <VerifiedIcon />, path: '/client/verify', roles: ['client'] },
  { text: 'Request Renewal', icon: <RenewalIcon />, path: '/client/renewal', roles: ['client'] },
  { text: 'Service History', icon: <AssignmentIcon />, path: '/client/history', roles: ['client'] },
  { text: 'Payment History', icon: <PaymentIcon />, path: '/client/payment/history', roles: ['client'] },
  { text: 'Profile', icon: <PersonIcon />, path: '/client/profile', roles: ['client'] },
  { text: 'CPD Library', icon: <SchoolIcon />, path: '/client/cpd', roles: ['client'] },
  { text: 'Documents', icon: <DescriptionIcon />, path: '/client/documents', roles: ['client'] },
  { text: 'Settings', icon: <SettingsIcon />, path: '/client/settings', roles: ['client'] },
  { text: 'Support', icon: <HelpIcon />, path: '/client/support', roles: ['client'] },
  
  // Inspector Navigation
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/inspector', roles: ['inspector'] },
  { text: 'My Schedule', icon: <CalendarIcon />, path: '/inspector/schedule', roles: ['inspector'] },
  { text: 'Job Orders', icon: <AssignmentIcon />, path: '/inspector/jobs', roles: ['inspector'] },
  { text: 'Sticker Stock', icon: <InventoryIcon />, path: '/inspector/stickers', roles: ['inspector'] },
  { text: 'Create New Job', icon: <AddIcon />, path: '/inspector/jobs/new', roles: ['inspector'] },
  
  // Trainer Navigation
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/trainer', roles: ['trainer'] },
  { text: 'Training Schedule', icon: <SchoolIcon />, path: '/trainer/schedule', roles: ['trainer'] },
  { text: 'Submit Results', icon: <AssignmentIcon />, path: '/trainer/results', roles: ['trainer'] },
  
  // Supervisor Navigation
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/supervisor', roles: ['supervisor'] },
  { text: 'Create Job Order', icon: <AddIcon />, path: '/supervisor/jobs/create', roles: ['supervisor'] },
  { text: 'Approval Queue', icon: <ApprovalIcon />, path: '/supervisor/approvals', roles: ['supervisor'] },
  { text: 'Team Performance', icon: <AnalyticsIcon />, path: '/supervisor/team', roles: ['supervisor'] },
  
  // Accountant Navigation
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/accountant', roles: ['accountant'] },
  { text: 'Payment Verification', icon: <PaymentIcon />, path: '/accountant/payments', roles: ['accountant'] },
  { text: 'Invoice Management', icon: <DescriptionIcon />, path: '/accountant/invoices', roles: ['accountant'] },
  
  // Manager/GM Navigation
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/manager', roles: ['manager', 'gm'] },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/manager/analytics', roles: ['manager', 'gm'] },
  { text: 'Certificates', icon: <CertificateIcon />, path: '/manager/certificates', roles: ['manager', 'gm'] },
  { text: 'User Management', icon: <PeopleIcon />, path: '/manager/users', roles: ['manager', 'gm'] },
  { text: 'Region Management', icon: <BusinessIcon />, path: '/manager/regions', roles: ['manager', 'gm'] },
  { text: 'Delegation Management', icon: <SecurityIcon />, path: '/manager/delegation', roles: ['manager', 'gm'] },
  { text: 'Tag Management', icon: <LabelIcon />, path: '/manager/tags', roles: ['manager', 'gm'] },
  { text: 'Activity Logs', icon: <ListIcon />, path: '/manager/activity-logs', roles: ['manager', 'gm'] },
  { text: 'Sticker Manager', icon: <InventoryIcon />, path: '/manager/stickers', roles: ['manager', 'gm'] },
];

const drawerWidth = 240;

export const Sidebar: React.FC<SidebarProps> = ({ open, onClose, userRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAppContext();

  // Filter nav items based on role and permissions
  const filteredNavItems = navItems.filter((item) => {
    if (!item.roles.includes(userRole)) return false;
    
    // Special check for "Create New Job" - requires permission
    if (item.path === '/inspector/jobs/new') {
      return canCreateJobOrder(currentUser);
    }
    
    return true;
  });

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
          borderRight: 'none',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
        },
      }}
    >
      <Toolbar 
        sx={{ 
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          color: 'white',
          minHeight: '64px !important',
        }}
      >
        <Typography variant="h6" fontWeight={600}>
          Menu
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ pt: 2 }}>
        {filteredNavItems.map((item) => {
          const isSelected = location.pathname === item.path;
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5, px: 1 }}>
              <ListItemButton
                selected={isSelected}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 2,
                  '&.Mui-selected': {
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                    color: 'white',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0e2c62 0%, #1a4288 100%)',
                    },
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                  },
                  '&:hover': {
                    backgroundColor: 'rgba(30, 60, 114, 0.08)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isSelected ? 'white' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: '0.95rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Drawer>
  );
};

