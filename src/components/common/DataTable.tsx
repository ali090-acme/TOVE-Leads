import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Paper,
  TextField,
  Box,
  Chip,
  Typography,
} from '@mui/material';

export interface Column<T> {
  id: keyof T | string;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
  onRowClick,
  searchable = true,
  searchPlaceholder = 'Search...',
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState<keyof T | string>('');
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleSort = (columnId: keyof T | string) => {
    const isAsc = orderBy === columnId && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(columnId);
  };

  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };

  // Filter data based on search term
  const filteredData = searchable
    ? data.filter((row) =>
        columns.some((column) => {
          const value = getNestedValue(row, column.id as string);
          return value?.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      )
    : data;

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!orderBy) return 0;
    const aValue = getNestedValue(a, orderBy as string);
    const bValue = getNestedValue(b, orderBy as string);
    
    if (aValue < bValue) return order === 'asc' ? -1 : 1;
    if (aValue > bValue) return order === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedData = sortedData.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', borderRadius: 2, boxShadow: 2 }}>
      {searchable && (
        <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            fullWidth
            size="small"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
        </Box>
      )}
      <TableContainer sx={{ maxHeight: 600 }}>
        <Table stickyHeader sx={{ '& .MuiTableCell-root': { borderColor: 'divider' } }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id as string}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                  sx={{
                    backgroundColor: 'grey.50',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    color: 'text.primary',
                    py: 1.5,
                  }}
                >
                  {column.format ? (
                    column.label
                  ) : (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => handleSort(column.id)}
                      sx={{
                        '& .MuiTableSortLabel-icon': {
                          opacity: orderBy === column.id ? 1 : 0.5,
                        },
                      }}
                    >
                      {column.label}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                  <Typography variant="body1" color="text.secondary">
                    No data found
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, index) => (
                <TableRow
                  hover
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  sx={{ 
                    cursor: onRowClick ? 'pointer' : 'default',
                    '&:hover': {
                      backgroundColor: 'action.hover',
                    },
                    '&:nth-of-type(even)': {
                      backgroundColor: 'grey.50',
                    },
                  }}
                >
                  {columns.map((column) => {
                    const value = getNestedValue(row, column.id as string);
                    return (
                      <TableCell 
                        key={column.id as string} 
                        align={column.align}
                        sx={{
                          py: 1.75,
                          borderBottom: index < paginatedData.length - 1 ? '1px solid' : 'none',
                          borderColor: 'divider',
                        }}
                      >
                        {column.format ? column.format(value, row) : value}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          '& .MuiTablePagination-toolbar': {
            px: 2,
          },
        }}
      />
    </Paper>
  );
}

// Helper function to format status chips
export const getStatusChip = (status: string, colorMap?: Record<string, any>) => {
  const defaultColors: Record<string, any> = {
    Pending: 'warning',
    'In Progress': 'info',
    Completed: 'success',
    Approved: 'success',
    Rejected: 'error',
    Paid: 'success',
    Failed: 'error',
    Active: 'success',
    Inactive: 'default',
    Valid: 'success',
    Expired: 'error',
    Confirmed: 'success',
  };

  const colors = colorMap || defaultColors;
  return <Chip label={status} color={colors[status] || 'default'} size="small" />;
};




