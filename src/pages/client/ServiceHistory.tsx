import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Button,
  Menu,
  MenuItem,
  TextField,
  Paper,
  Stack,
  InputAdornment,
} from '@mui/material';
import {
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Assignment as AssignmentIcon,
  Search as SearchIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { DataTable, Column, getStatusChip } from '@/components/common/DataTable';
import { useAppContext } from '@/context/AppContext';
import { JobOrder, JobOrderStatus } from '@/types';
import { format, startOfWeek, startOfMonth, subDays, isWithinInterval } from 'date-fns';

export const ServiceHistory: React.FC = () => {
  const navigate = useNavigate();
  const { jobOrders, currentUser } = useAppContext();
  
  const [statusFilter, setStatusFilter] = useState<JobOrderStatus | 'All'>('All');
  const [dateFilter, setDateFilter] = useState<'All' | 'This Week' | 'This Month' | 'Custom'>('All');
  const [customDateStart, setCustomDateStart] = useState<string>('');
  const [customDateEnd, setCustomDateEnd] = useState<string>('');
  const [dateMenuAnchor, setDateMenuAnchor] = useState<null | HTMLElement>(null);

  // Filter job orders for current client
  const clientJobOrders = useMemo(() => {
    if (!currentUser) return jobOrders;
    return jobOrders.filter((jo) => jo.clientId === currentUser.id);
  }, [jobOrders, currentUser]);

  // Apply filters
  const filteredJobOrders = useMemo(() => {
    let filtered = [...clientJobOrders];

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter((jo) => jo.status === statusFilter);
    }

    // Date filter
    if (dateFilter === 'This Week') {
      const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      filtered = filtered.filter((jo) => {
        const jobDate = new Date(jo.dateTime);
        return jobDate >= weekStart;
      });
    } else if (dateFilter === 'This Month') {
      const monthStart = startOfMonth(new Date());
      filtered = filtered.filter((jo) => {
        const jobDate = new Date(jo.dateTime);
        return jobDate >= monthStart;
      });
    } else if (dateFilter === 'Custom' && customDateStart && customDateEnd) {
      const start = new Date(customDateStart);
      const end = new Date(customDateEnd);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter((jo) => {
        const jobDate = new Date(jo.dateTime);
        return jobDate >= start && jobDate <= end;
      });
    }

    return filtered;
  }, [clientJobOrders, statusFilter, dateFilter, customDateStart, customDateEnd]);

  const handleStatusFilter = (status: JobOrderStatus | 'All') => {
    setStatusFilter(status);
  };

  const handleDateFilter = (filter: 'All' | 'This Week' | 'This Month' | 'Custom') => {
    setDateFilter(filter);
    setDateMenuAnchor(null);
    if (filter !== 'Custom') {
      setCustomDateStart('');
      setCustomDateEnd('');
    }
  };

  const clearFilters = () => {
    setStatusFilter('All');
    setDateFilter('All');
    setCustomDateStart('');
    setCustomDateEnd('');
  };

  const hasActiveFilters = statusFilter !== 'All' || dateFilter !== 'All';

  const columns: Column<JobOrder>[] = [
    { id: 'id', label: 'Job ID', minWidth: 120 },
    { id: 'serviceType', label: 'Service Type', minWidth: 130 },
    {
      id: 'status',
      label: 'Status',
      minWidth: 120,
      format: (value) => getStatusChip(value),
    },
    {
      id: 'dateTime',
      label: 'Date',
      minWidth: 150,
      format: (value) => format(value, 'MMM dd, yyyy'),
    },
    {
      id: 'amount',
      label: 'Amount',
      minWidth: 100,
      format: (value) => value ? `$${value}` : 'N/A',
    },
  ];

  const statusOptions: (JobOrderStatus | 'All')[] = ['All', 'Pending', 'In Progress', 'Completed', 'Approved', 'Paid'];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Service History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View all your past inspections, assessments, and training sessions
        </Typography>
      </Box>

      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          {/* Filters Section */}
          <Paper sx={{ p: 3, mb: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <FilterIcon color="primary" />
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                  Filters:
                </Typography>
              </Box>

              {/* Status Filter Chips */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {statusOptions.map((status) => (
                  <Chip
                    key={status}
                    label={status}
                    onClick={() => handleStatusFilter(status)}
                    color={statusFilter === status ? 'primary' : 'default'}
                    variant={statusFilter === status ? 'filled' : 'outlined'}
                    sx={{
                      cursor: 'pointer',
                      fontWeight: statusFilter === status ? 600 : 400,
                    }}
                  />
                ))}
              </Box>

              {/* Date Filter */}
              <Button
                variant={dateFilter !== 'All' ? 'contained' : 'outlined'}
                size="small"
                startIcon={<CalendarIcon />}
                onClick={(e) => setDateMenuAnchor(e.currentTarget)}
                sx={{
                  background: dateFilter !== 'All' ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)' : undefined,
                }}
              >
                {dateFilter}
              </Button>
              <Menu
                anchorEl={dateMenuAnchor}
                open={Boolean(dateMenuAnchor)}
                onClose={() => setDateMenuAnchor(null)}
              >
                <MenuItem onClick={() => handleDateFilter('All')}>All Time</MenuItem>
                <MenuItem onClick={() => handleDateFilter('This Week')}>This Week</MenuItem>
                <MenuItem onClick={() => handleDateFilter('This Month')}>This Month</MenuItem>
                <MenuItem onClick={() => handleDateFilter('Custom')}>Custom Range</MenuItem>
              </Menu>

              {/* Custom Date Range */}
              {dateFilter === 'Custom' && (
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    type="date"
                    label="Start Date"
                    size="small"
                    value={customDateStart}
                    onChange={(e) => setCustomDateStart(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ bgcolor: 'white' }}
                  />
                  <TextField
                    type="date"
                    label="End Date"
                    size="small"
                    value={customDateEnd}
                    onChange={(e) => setCustomDateEnd(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    sx={{ bgcolor: 'white' }}
                  />
                </Box>
              )}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<ClearIcon />}
                  onClick={clearFilters}
                  color="error"
                >
                  Clear Filters
                </Button>
              )}
            </Box>

            {/* Results Count */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>
                Showing <strong>{filteredJobOrders.length}</strong> of <strong>{clientJobOrders.length}</strong> requests
              </Typography>
            </Box>
          </Paper>

          <DataTable
            columns={columns}
            data={filteredJobOrders}
            searchPlaceholder="Search by Job ID, Service Type..."
            onRowClick={(row) => {
              // Navigate to job detail if needed
              // navigate(`/client/jobs/${row.id}`);
            }}
          />
        </CardContent>
      </Card>
    </Box>
  );
};



