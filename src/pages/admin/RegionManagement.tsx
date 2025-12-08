import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Chip,
  Grid,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { Region, Team } from '@/types';

const STORAGE_KEY_REGIONS = 'regions';

export const RegionManagement: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [regionDialogOpen, setRegionDialogOpen] = useState(false);
  const [teamDialogOpen, setTeamDialogOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [editingTeam, setEditingTeam] = useState<{ team: Team; regionId: string } | null>(null);
  const [regionFormData, setRegionFormData] = useState({ name: '', code: '' });
  const [teamFormData, setTeamFormData] = useState({ name: '', code: '' });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = () => {
    const stored = localStorage.getItem(STORAGE_KEY_REGIONS);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setRegions(parsed.map((r: any) => ({
          ...r,
          createdAt: new Date(r.createdAt),
          updatedAt: new Date(r.updatedAt),
          teams: r.teams.map((t: any) => ({
            ...t,
            createdAt: new Date(t.createdAt),
            updatedAt: new Date(t.updatedAt),
          })),
        })));
      } catch (e) {
        console.error('Failed to parse regions from localStorage', e);
      }
    }
  };

  const saveRegions = (updatedRegions: Region[]) => {
    localStorage.setItem(STORAGE_KEY_REGIONS, JSON.stringify(updatedRegions));
    setRegions(updatedRegions);
  };

  const handleOpenRegionDialog = (region?: Region) => {
    if (region) {
      setEditingRegion(region);
      setRegionFormData({ name: region.name, code: region.code });
    } else {
      setEditingRegion(null);
      setRegionFormData({ name: '', code: '' });
    }
    setRegionDialogOpen(true);
  };

  const handleSaveRegion = () => {
    if (!regionFormData.name.trim() || !regionFormData.code.trim()) {
      setSnackbar({
        open: true,
        message: 'Please fill in all fields',
        severity: 'error',
      });
      return;
    }

    if (editingRegion) {
      // Update existing region
      const updatedRegions = regions.map((r) =>
        r.id === editingRegion.id
          ? {
              ...r,
              name: regionFormData.name.trim(),
              code: regionFormData.code.trim().toUpperCase(),
              updatedAt: new Date(),
            }
          : r
      );
      saveRegions(updatedRegions);
      setSnackbar({
        open: true,
        message: 'Region updated successfully',
        severity: 'success',
      });
    } else {
      // Create new region
      const newRegion: Region = {
        id: `region-${Date.now()}`,
        name: regionFormData.name.trim(),
        code: regionFormData.code.trim().toUpperCase(),
        teams: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      saveRegions([...regions, newRegion]);
      setSnackbar({
        open: true,
        message: 'Region created successfully',
        severity: 'success',
      });
    }
    setRegionDialogOpen(false);
    setEditingRegion(null);
    setRegionFormData({ name: '', code: '' });
  };

  const handleDeleteRegion = (regionId: string) => {
    if (!confirm('Are you sure you want to delete this region? All teams within this region will also be deleted.')) {
      return;
    }
    const updatedRegions = regions.filter((r) => r.id !== regionId);
    saveRegions(updatedRegions);
    setSnackbar({
      open: true,
      message: 'Region deleted successfully',
      severity: 'success',
    });
  };

  const handleOpenTeamDialog = (regionId: string, team?: Team) => {
    if (team) {
      setEditingTeam({ team, regionId });
      setTeamFormData({ name: team.name, code: team.code });
    } else {
      setEditingTeam({ team: {} as Team, regionId });
      setTeamFormData({ name: '', code: '' });
    }
    setTeamDialogOpen(true);
  };

  const handleSaveTeam = () => {
    if (!teamFormData.name.trim() || !teamFormData.code.trim() || !editingTeam) {
      setSnackbar({
        open: true,
        message: 'Please fill in all fields',
        severity: 'error',
      });
      return;
    }

    const updatedRegions = regions.map((r) => {
      if (r.id !== editingTeam.regionId) return r;

      if (editingTeam.team.id) {
        // Update existing team
        return {
          ...r,
          teams: r.teams.map((t) =>
            t.id === editingTeam.team.id
              ? {
                  ...t,
                  name: teamFormData.name.trim(),
                  code: teamFormData.code.trim(),
                  updatedAt: new Date(),
                }
              : t
          ),
          updatedAt: new Date(),
        };
      } else {
        // Create new team
        const newTeam: Team = {
          id: `team-${Date.now()}`,
          regionId: r.id,
          name: teamFormData.name.trim(),
          code: teamFormData.code.trim(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        return {
          ...r,
          teams: [...r.teams, newTeam],
          updatedAt: new Date(),
        };
      }
    });

    saveRegions(updatedRegions);
    setSnackbar({
      open: true,
      message: editingTeam.team.id ? 'Team updated successfully' : 'Team created successfully',
      severity: 'success',
    });
    setTeamDialogOpen(false);
    setEditingTeam(null);
    setTeamFormData({ name: '', code: '' });
  };

  const handleDeleteTeam = (regionId: string, teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) {
      return;
    }
    const updatedRegions = regions.map((r) =>
      r.id === regionId
        ? {
            ...r,
            teams: r.teams.filter((t) => t.id !== teamId),
            updatedAt: new Date(),
          }
        : r
    );
    saveRegions(updatedRegions);
    setSnackbar({
      open: true,
      message: 'Team deleted successfully',
      severity: 'success',
    });
  };

  const handleToggleTeamStatus = (regionId: string, teamId: string) => {
    const updatedRegions = regions.map((r) =>
      r.id === regionId
        ? {
            ...r,
            teams: r.teams.map((t) =>
              t.id === teamId ? { ...t, isActive: !t.isActive, updatedAt: new Date() } : t
            ),
            updatedAt: new Date(),
          }
        : r
    );
    saveRegions(updatedRegions);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
            Region & Team Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage regions and teams. Regions are separate entities and data is isolated between regions and teams.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenRegionDialog()}
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #0e2c62 0%, #1a4288 100%)',
            },
          }}
        >
          Add Region
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Data Isolation:</strong> Regions cannot see each other's data. Teams within the same region also cannot see each other's data to avoid conflicts and competition.
        </Typography>
      </Alert>

      {regions.length === 0 ? (
        <Card elevation={2} sx={{ borderRadius: 3, p: 4, textAlign: 'center' }}>
          <LocationIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Regions Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first region to get started
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenRegionDialog()}>
            Create Region
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {regions.map((region) => (
            <Grid item xs={12} md={6} key={region.id}>
              <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #134e5e 0%, #71b280 100%)',
                    color: 'white',
                    p: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {region.name}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Code: {region.code}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        sx={{ color: 'white' }}
                        onClick={() => handleOpenRegionDialog(region)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        sx={{ color: 'white' }}
                        onClick={() => handleDeleteRegion(region.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Teams ({region.teams.length})
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => handleOpenTeamDialog(region.id)}
                    >
                      Add Team
                    </Button>
                  </Box>
                  {region.teams.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                      No teams in this region
                    </Typography>
                  ) : (
                    <List>
                      {region.teams.map((team, index) => (
                        <React.Fragment key={team.id}>
                          <ListItem
                            sx={{
                              px: 0,
                              py: 1.5,
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 1,
                              mb: 1,
                            }}
                          >
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <GroupIcon fontSize="small" color="primary" />
                                  <Typography variant="body1" fontWeight={500}>
                                    {team.name}
                                  </Typography>
                                  <Chip
                                    label={team.code}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                    sx={{ ml: 1 }}
                                  />
                                  {!team.isActive && (
                                    <Chip label="Inactive" size="small" color="default" />
                                  )}
                                </Box>
                              }
                              secondary={`Created: ${new Date(team.createdAt).toLocaleDateString()}`}
                            />
                            <ListItemSecondaryAction>
                              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={team.isActive}
                                      onChange={() => handleToggleTeamStatus(region.id, team.id)}
                                      size="small"
                                    />
                                  }
                                  label=""
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => handleOpenTeamDialog(region.id, team)}
                                >
                                  <EditIcon />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteTeam(region.id, team.id)}
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </Box>
                            </ListItemSecondaryAction>
                          </ListItem>
                          {index < region.teams.length - 1 && <Divider sx={{ my: 1 }} />}
                        </React.Fragment>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Region Dialog */}
      <Dialog open={regionDialogOpen} onClose={() => setRegionDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRegion ? 'Edit Region' : 'Create New Region'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Region Name"
            value={regionFormData.name}
            onChange={(e) => setRegionFormData({ ...regionFormData, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
            placeholder="e.g., Lahore, Islamabad"
          />
          <TextField
            fullWidth
            label="Region Code"
            value={regionFormData.code}
            onChange={(e) => setRegionFormData({ ...regionFormData, code: e.target.value.toUpperCase() })}
            placeholder="e.g., LHR, ISB"
            helperText="Short code for the region (e.g., LHR for Lahore)"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegionDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveRegion} variant="contained">
            {editingRegion ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Team Dialog */}
      <Dialog open={teamDialogOpen} onClose={() => setTeamDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTeam?.team.id ? 'Edit Team' : 'Create New Team'}
        </DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Teams within a region are separate entities. They cannot see each other's data.
            </Typography>
          </Alert>
          <TextField
            fullWidth
            label="Team Name"
            value={teamFormData.name}
            onChange={(e) => setTeamFormData({ ...teamFormData, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
            placeholder="e.g., Lahore One, Lahore Two, Lahore Three"
          />
          <TextField
            fullWidth
            label="Team Code"
            value={teamFormData.code}
            onChange={(e) => setTeamFormData({ ...teamFormData, code: e.target.value })}
            placeholder="e.g., LHR-1, LHR-2"
            helperText="Short code for the team"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTeamDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveTeam} variant="contained">
            {editingTeam?.team.id ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

