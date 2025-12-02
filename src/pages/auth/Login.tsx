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

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { users, setCurrentUser } = useAppContext();
  const [tabValue, setTabValue] = useState(0);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mock login - in real app, validate credentials
    if (tabValue === 0) {
      // Client portal - find client user
      const clientUser = users.find(u => u.roles.includes('client'));
      if (clientUser) {
        setCurrentUser({ ...clientUser, currentRole: 'client' });
        navigate('/client');
      } else {
        navigate('/client');
      }
    } else {
      // Internal portal - route based on role
      // For demo, going to inspector dashboard
      const inspectorUser = users.find(u => u.roles.includes('inspector'));
      if (inspectorUser) {
        setCurrentUser({ ...inspectorUser, currentRole: 'inspector' });
        navigate('/inspector');
      } else {
        navigate('/inspector');
      }
    }
  };

  const handleQuickLogin = (role: UserRole) => {
    const user = users.find(u => u.roles.includes(role));
    if (user) {
      setCurrentUser({ ...user, currentRole: role });
      
      // Navigate based on role
      switch (role) {
        case 'client':
          navigate('/client');
          break;
        case 'inspector':
          navigate('/inspector');
          break;
        case 'trainer':
          navigate('/trainer');
          break;
        case 'supervisor':
          navigate('/supervisor');
          break;
        case 'accountant':
          navigate('/accountant');
          break;
        case 'manager':
        case 'gm':
          navigate('/manager');
          break;
        default:
          navigate('/client');
      }
    } else {
      // Fallback navigation if user not found
      const roleRoutes: Record<UserRole, string> = {
        client: '/client',
        inspector: '/inspector',
        trainer: '/trainer',
        supervisor: '/supervisor',
        accountant: '/accountant',
        manager: '/manager',
        gm: '/manager',
      };
      navigate(roleRoutes[role] || '/client');
    }
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
              label={tabValue === 0 ? "Email Address" : "Email / Employee ID"}
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
            />
            
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
          </Box>

          {/* Quick login helpers for demo */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary" gutterBottom display="block">
              Demo Quick Login:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
              <Button size="small" variant="outlined" onClick={() => handleQuickLogin('client')}>
                Client
              </Button>
              <Button size="small" variant="outlined" onClick={() => handleQuickLogin('inspector')}>
                Inspector
              </Button>
              <Button size="small" variant="outlined" onClick={() => handleQuickLogin('trainer')}>
                Trainer
              </Button>
              <Button size="small" variant="outlined" onClick={() => handleQuickLogin('supervisor')}>
                Supervisor
              </Button>
              <Button size="small" variant="outlined" onClick={() => handleQuickLogin('accountant')}>
                Accountant
              </Button>
              <Button size="small" variant="outlined" onClick={() => handleQuickLogin('manager')}>
                Manager
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};



