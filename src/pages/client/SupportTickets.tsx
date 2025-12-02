import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Grid,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Search as SearchIcon,
  HelpOutline as TicketIcon,
  CheckCircle as ResolvedIcon,
  Schedule as PendingIcon,
  Cancel as ClosedIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';

interface SupportTicket {
  id: number;
  category: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
}

export const SupportTickets: React.FC = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Load tickets from localStorage
    const storedTickets = JSON.parse(localStorage.getItem('support-tickets') || '[]');
    setTickets(storedTickets);
  }, []);

  const filteredTickets = tickets.filter((ticket) => {
    return (
      searchQuery.trim() === '' ||
      ticket.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toString().includes(searchQuery)
    );
  });

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'Resolved':
        return (
          <Chip
            icon={<ResolvedIcon />}
            label="Resolved"
            color="success"
            size="small"
          />
        );
      case 'In Progress':
        return (
          <Chip
            icon={<PendingIcon />}
            label="In Progress"
            color="warning"
            size="small"
          />
        );
      case 'Closed':
        return (
          <Chip
            icon={<ClosedIcon />}
            label="Closed"
            color="default"
            size="small"
          />
        );
      default:
        return (
          <Chip
            label="Open"
            color="info"
            size="small"
          />
        );
    }
  };

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/client/support')}
          sx={{ mb: 2 }}
        >
          Back to Support
        </Button>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          My Support Tickets
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track your support requests and their status
        </Typography>
      </Box>

      {/* Search */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <TextField
            fullWidth
            placeholder="Search tickets by ID, category, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </CardContent>
      </Card>

      {/* Tickets List */}
      {filteredTickets.length > 0 ? (
        <Grid container spacing={3}>
          {filteredTickets.map((ticket) => (
            <Grid item xs={12} key={ticket.id}>
              <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                    color: 'white',
                    p: 2,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <TicketIcon />
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        Ticket #{ticket.id}
                      </Typography>
                      <Typography variant="caption" sx={{ opacity: 0.9 }}>
                        {format(new Date(ticket.createdAt), 'MMM dd, yyyy HH:mm')}
                      </Typography>
                    </Box>
                  </Box>
                  {getStatusChip(ticket.status)}
                </Box>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      Category
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {ticket.category}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                      Description
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {ticket.description}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <CardContent sx={{ p: 6, textAlign: 'center' }}>
            <TicketIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No tickets found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {searchQuery
                ? 'Try adjusting your search criteria'
                : 'You haven\'t submitted any support tickets yet'}
            </Typography>
            {!searchQuery && (
              <Button
                variant="contained"
                onClick={() => navigate('/client/support')}
                sx={{
                  background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #2a5298 0%, #3d6bb3 100%)',
                  },
                }}
              >
                Submit a Ticket
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

