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

export const Login: React.FC = () => {
  const navigate = useNavigate();
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
      // Client portal
      navigate('/client');
    } else {
      // Internal portal - route based on role
      // For demo, going to inspector dashboard
      navigate('/inspector');
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
              <Button size="small" onClick={() => navigate('/client')}>Client</Button>
              <Button size="small" onClick={() => navigate('/inspector')}>Inspector</Button>
              <Button size="small" onClick={() => navigate('/trainer')}>Trainer</Button>
              <Button size="small" onClick={() => navigate('/supervisor')}>Supervisor</Button>
              <Button size="small" onClick={() => navigate('/accountant')}>Accountant</Button>
              <Button size="small" onClick={() => navigate('/manager')}>Manager</Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};



