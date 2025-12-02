import React from 'react';
import { Box, Typography, Grid, Card, CardContent, Avatar } from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { TrendingUp as RevenueIcon, Assignment as JobIcon, People as PeopleIcon, TrendingUp as GrowthIcon } from '@mui/icons-material';

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Company Analytics
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Comprehensive performance metrics and business insights
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
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
                    Total Revenue (YTD)
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    $127K
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <RevenueIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
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
                    Total Jobs
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    176
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <JobIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
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
                    Active Clients
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    42
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <PeopleIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
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
                    Growth Rate
                  </Typography>
                  <Typography variant="h3" fontWeight={700}>
                    +12%
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', width: 64, height: 64 }}>
                  <GrowthIcon sx={{ fontSize: 32 }} />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
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



