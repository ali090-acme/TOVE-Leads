import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1e3c72',
      light: '#2a5298',
      dark: '#0e2c62',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2c3e50',
      light: '#34495e',
      dark: '#1a252f',
      contrastText: '#ffffff',
    },
    success: {
      main: '#27ae60',
      light: '#2ecc71',
      dark: '#229954',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#e67e22',
      light: '#f39c12',
      dark: '#d35400',
      contrastText: '#ffffff',
    },
    error: {
      main: '#c0392b',
      light: '#e74c3c',
      dark: '#a93226',
      contrastText: '#ffffff',
    },
    info: {
      main: '#3498db',
      light: '#5dade2',
      dark: '#2874a6',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2c3e50',
      secondary: '#7f8c8d',
    },
    grey: {
      50: '#f8f9fa',
      100: '#e9ecef',
      200: '#dee2e6',
      300: '#ced4da',
      400: '#adb5bd',
      500: '#868e96',
      600: '#495057',
      700: '#343a40',
      800: '#212529',
      900: '#1a1d20',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.05)',
    '0 2px 6px rgba(0,0,0,0.08)',
    '0 4px 12px rgba(0,0,0,0.1)',
    '0 8px 24px rgba(0,0,0,0.12)',
    '0 12px 32px rgba(0,0,0,0.14)',
    '0 16px 40px rgba(0,0,0,0.16)',
    '0 20px 48px rgba(0,0,0,0.18)',
    '0 24px 56px rgba(0,0,0,0.2)',
    '0 28px 64px rgba(0,0,0,0.22)',
    '0 32px 72px rgba(0,0,0,0.24)',
    '0 36px 80px rgba(0,0,0,0.26)',
    '0 40px 88px rgba(0,0,0,0.28)',
    '0 44px 96px rgba(0,0,0,0.3)',
    '0 48px 104px rgba(0,0,0,0.32)',
    '0 52px 112px rgba(0,0,0,0.34)',
    '0 56px 120px rgba(0,0,0,0.36)',
    '0 60px 128px rgba(0,0,0,0.38)',
    '0 64px 136px rgba(0,0,0,0.4)',
    '0 68px 144px rgba(0,0,0,0.42)',
    '0 72px 152px rgba(0,0,0,0.44)',
    '0 76px 160px rgba(0,0,0,0.46)',
    '0 80px 168px rgba(0,0,0,0.48)',
    '0 84px 176px rgba(0,0,0,0.5)',
    '0 88px 184px rgba(0,0,0,0.52)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 10,
          padding: '10px 24px',
          fontSize: '0.9375rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          },
        },
        contained: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          '&:hover': {
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          fontSize: '0.8125rem',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        },
        elevation3: {
          boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
        },
      },
    },
  },
});




