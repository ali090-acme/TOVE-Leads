import React from 'react';
import { Box, Typography, Grid, Card, CardContent } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { StatsCard } from '@/components/common/StatsCard';
import { TrendingUp as RevenueIcon } from '@mui/icons-material';

export const Analytics: React.FC = () => {
  const revenueData = [
    { month: 'Jan', revenue: 15000 },
    { month: 'Feb', revenue: 18000 },
    { month: 'Mar', revenue: 22000 },
    { month: 'Apr', revenue: 19000 },
    { month: 'May', revenue: 25000 },
    { month: 'Jun', revenue: 28000 },
  ];

  const regionData = [
    { region: 'North', jobs: 45 },
    { region: 'South', jobs: 38 },
    { region: 'East', jobs: 52 },
    { region: 'West', jobs: 41 },
  ];

  const serviceTypeData = [
    { id: 0, value: 35, label: 'Inspection' },
    { id: 1, value: 25, label: 'Training' },
    { id: 2, value: 20, label: 'NDT' },
    { id: 3, value: 20, label: 'Assessment' },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Company Analytics
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Comprehensive performance metrics and business insights
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <StatsCard
            title="Total Revenue (YTD)"
            value="$127K"
            icon={<RevenueIcon />}
            color="success.main"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatsCard title="Total Jobs" value="176" icon={<RevenueIcon />} color="primary.main" />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatsCard title="Active Clients" value="42" icon={<RevenueIcon />} color="info.main" />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatsCard title="Growth Rate" value="+12%" icon={<RevenueIcon />} color="success.main" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Revenue Trend
              </Typography>
              <LineChart
                xAxis={[{ scaleType: 'point', data: revenueData.map((d) => d.month) }]}
                series={[
                  { data: revenueData.map((d) => d.revenue), color: '#2e7d32', label: 'Revenue ($)' },
                ]}
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Service Distribution
              </Typography>
              <PieChart
                series={[{ data: serviceTypeData, highlightScope: { faded: 'global', highlighted: 'item' } }]}
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Jobs by Region
              </Typography>
              <BarChart
                xAxis={[{ scaleType: 'band', data: regionData.map((d) => d.region) }]}
                series={[{ data: regionData.map((d) => d.jobs), color: '#1976d2' }]}
                height={300}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};



