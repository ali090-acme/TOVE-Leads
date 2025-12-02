import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Avatar } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { StatsCard } from '@/components/common/StatsCard';
import { TrendingUp as TrendingIcon, People as PeopleIcon, CheckCircle as CompletedIcon, PendingActions as PendingIcon } from '@mui/icons-material';

export const TeamPerformance: React.FC = () => {
  const teamPerformanceData = [
    { inspector: 'Jane Inspector', completed: 12, pending: 3 },
    { inspector: 'John Doe', completed: 8, pending: 5 },
    { inspector: 'Mike Tech', completed: 10, pending: 2 },
    { inspector: 'Sarah Lee', completed: 15, pending: 1 },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Team Performance
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Monitor your team's productivity and job completion rates
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Team Members
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {teamPerformanceData.length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <PeopleIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Completed
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {teamPerformanceData.reduce((sum, m) => sum + m.completed, 0)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <CompletedIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              overflow: 'hidden',
              background: 'linear-gradient(135deg, #f39c12 0%, #e67e22 100%)',
              color: 'white',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9, mb: 1 }}>
                    Total Pending
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    {teamPerformanceData.reduce((sum, m) => sum + m.pending, 0)}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <PendingIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 1 }}>
            Job Completion by Team Member
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Completed vs Pending jobs this month
          </Typography>
          <BarChart
            xAxis={[
              {
                scaleType: 'band',
                data: teamPerformanceData.map((d) => d.inspector),
              },
            ]}
            series={[
              {
                data: teamPerformanceData.map((d) => d.completed),
                label: 'Completed',
                color: '#2e7d32',
              },
              {
                data: teamPerformanceData.map((d) => d.pending),
                label: 'Pending',
                color: '#ed6c02',
              },
            ]}
            height={400}
          />
        </CardContent>
      </Card>
    </Box>
  );
};



