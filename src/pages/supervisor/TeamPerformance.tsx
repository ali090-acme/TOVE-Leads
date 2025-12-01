import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { StatsCard } from '@/components/common/StatsCard';
import { TrendingUp as TrendingIcon } from '@mui/icons-material';

export const TeamPerformance: React.FC = () => {
  const teamPerformanceData = [
    { inspector: 'Jane Inspector', completed: 12, pending: 3 },
    { inspector: 'John Doe', completed: 8, pending: 5 },
    { inspector: 'Mike Tech', completed: 10, pending: 2 },
    { inspector: 'Sarah Lee', completed: 15, pending: 1 },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Team Performance
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Monitor your team's productivity and job completion rates
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Total Team Members"
            value={teamPerformanceData.length}
            icon={<TrendingIcon />}
            color="primary.main"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Total Completed"
            value={teamPerformanceData.reduce((sum, m) => sum + m.completed, 0)}
            icon={<TrendingIcon />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatsCard
            title="Total Pending"
            value={teamPerformanceData.reduce((sum, m) => sum + m.pending, 0)}
            icon={<TrendingIcon />}
            color="warning.main"
          />
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom fontWeight={600}>
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



