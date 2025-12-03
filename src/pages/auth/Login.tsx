import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Link,
  Tabs,
  Tab,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { UserRole } from '@/types';
import { logUserAction } from '@/utils/activityLogger';

// Hard-coded credentials for demo
const CREDENTIALS: Record<string, { password: string; userId: string; role: UserRole }> = {
  // Client Portal
  'client@example.com': { password: 'client123', userId: 'user-1', role: 'client' },
  'client': { password: 'client123', userId: 'user-1', role: 'client' },
  
  // Internal Portal
  'inspector@example.com': { password: 'inspector123', userId: 'user-2', role: 'inspector' },
  'inspector': { password: 'inspector123', userId: 'user-2', role: 'inspector' },
  'jane': { password: 'inspector123', userId: 'user-2', role: 'inspector' },
  
  'trainer@example.com': { password: 'trainer123', userId: 'user-3', role: 'trainer' },
  'trainer': { password: 'trainer123', userId: 'user-3', role: 'trainer' },
  'mike': { password: 'trainer123', userId: 'user-3', role: 'trainer' },
  
  'supervisor@example.com': { password: 'supervisor123', userId: 'user-4', role: 'supervisor' },
  'supervisor': { password: 'supervisor123', userId: 'user-4', role: 'supervisor' },
  'sarah': { password: 'supervisor123', userId: 'user-4', role: 'supervisor' },
  
  'accountant@example.com': { password: 'accountant123', userId: 'user-5', role: 'accountant' },
  'accountant': { password: 'accountant123', userId: 'user-5', role: 'accountant' },
  'tom': { password: 'accountant123', userId: 'user-5', role: 'accountant' },
  
  'manager@example.com': { password: 'manager123', userId: 'user-6', role: 'manager' },
  'manager': { password: 'manager123', userId: 'user-6', role: 'manager' },
  'admin': { password: 'admin123', userId: 'user-6', role: 'manager' },
  'lisa': { password: 'manager123', userId: 'user-6', role: 'manager' },
};

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { users, setCurrentUser } = useAppContext();
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    setError('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const emailLower = email.toLowerCase().trim();
    const cred = CREDENTIALS[emailLower];
    
    // Validate credentials
    if (!cred || cred.password !== password) {
      setError('Invalid email/username or password');
      return;
    }
    
    // Find user by ID
    const user = users.find(u => u.id === cred.userId);
    if (!user) {
      setError('User not found');
      return;
    }
    
    // Check portal access
    if (tabValue === 0 && cred.role !== 'client') {
      setError('Please use Internal Portal for this account');
      return;
    }
    
    if (tabValue === 1 && cred.role === 'client') {
      setError('Please use Client Portal for this account');
      return;
    }
    
    // Set current user with correct role - this will also save to localStorage
    const userWithRole = { ...user, currentRole: cred.role };
    console.log('🔐 Login: Setting currentUser:', userWithRole.name, userWithRole.id, userWithRole.currentRole);
    setCurrentUser(userWithRole);
    
    // Verify it was set
    setTimeout(() => {
      const stored = localStorage.getItem('currentUser');
      console.log('✅ Login: Verified currentUser in localStorage:', stored ? JSON.parse(stored)?.name : 'NOT FOUND');
    }, 50);
    
    // Log action
    logUserAction(
      'LOGIN',
      'USER',
      user.id,
      user.name,
      `User logged in as ${cred.role}`,
      { role: cred.role, portal: tabValue === 0 ? 'Client Portal' : 'Internal Portal' },
      user.id,
      user.name,
      cred.role
    );
    
    // Navigate to appropriate dashboard based on role
    const roleRoutes: Record<UserRole, string> = {
      client: '/client',
      inspector: '/inspector',
      trainer: '/trainer',
      supervisor: '/supervisor',
      accountant: '/accountant',
      manager: '/manager',
      gm: '/manager',
    };
    
    console.log('🚀 Login: Navigating to:', roleRoutes[cred.role]);
    navigate(roleRoutes[cred.role] || '/client');
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            TOVE Leeds Compliance System
          </Typography>
          
          <Tabs value={tabValue} onChange={handleTabChange} centered sx={{ mb: 3 }}>
            <Tab label="Client Portal" />
            <Tab label="Internal Portal" />
          </Tabs>

          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label={tabValue === 0 ? "Email Address" : "Email / Username"}
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              error={!!error}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              error={!!error}
            />
            
            {error && (
              <Typography color="error" variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                {error}
              </Typography>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              size="large"
            >
              Sign In
            </Button>
            
            <Box sx={{ textAlign: 'center' }}>
              <Link href="#" variant="body2">
                Forgot password?
              </Link>
            </Box>

            {tabValue === 0 && (
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link href="#" variant="body2">
                    Register
                  </Link>
                </Typography>
              </Box>
            )}
            
            {/* Demo Credentials Helper */}
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block" fontWeight={600}>
                Demo Credentials:
              </Typography>
              <Typography variant="caption" color="text.secondary" component="div" sx={{ mt: 1 }}>
                {tabValue === 0 ? (
                  <>
                    <strong>Client:</strong> client@example.com / client123
                  </>
                ) : (
                  <>
                    <strong>Inspector:</strong> inspector@example.com / inspector123<br />
                    <strong>Manager/Admin:</strong> admin / admin123<br />
                    <strong>Trainer:</strong> trainer@example.com / trainer123<br />
                    <strong>Supervisor:</strong> supervisor@example.com / supervisor123<br />
                    <strong>Accountant:</strong> accountant@example.com / accountant123
                  </>
                )}
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};



