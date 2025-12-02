import React from 'react';
import { Box, Typography, Card, CardContent, Button, Chip } from '@mui/material';
import { DataTable, Column } from '@/components/common/DataTable';
import { useAppContext } from '@/context/AppContext';
import { User } from '@/types';
import { Add as AddIcon, Edit as EditIcon } from '@mui/icons-material';

export const UserManagement: React.FC = () => {
  const { users } = useAppContext();

  const columns: Column<User>[] = [
    { id: 'name', label: 'Name', minWidth: 170 },
    { id: 'email', label: 'Email', minWidth: 200 },
    {
      id: 'employeeId',
      label: 'Employee ID',
      minWidth: 120,
      format: (value) => value || 'N/A',
    },
    {
      id: 'roles',
      label: 'Roles',
      minWidth: 200,
      format: (value: string[]) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {value.map((role) => (
            <Chip key={role} label={role} size="small" />
          ))}
        </Box>
      ),
    },
    {
      id: 'department',
      label: 'Department',
      minWidth: 150,
      format: (value) => value || 'N/A',
    },
    {
      id: 'id',
      label: 'Actions',
      minWidth: 100,
      format: () => (
        <Button
          size="small"
          variant="text"
          startIcon={<EditIcon />}
          onClick={(e) => {
            e.stopPropagation();
            alert('Edit user dialog would open here');
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
            User Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage user accounts, roles, and permissions
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0e2c62 0%, #1a4288 100%)',
            },
          }}
        >
          Add New User
        </Button>
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
          {users.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Users Found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add users to get started.
              </Typography>
            </Box>
          ) : (
            <DataTable columns={columns} data={users} searchPlaceholder="Search by name, email, employee ID..." />
          )}
        </CardContent>
      </Card>
    </Box>
  );
};



