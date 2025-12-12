import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  Divider,
  FormControlLabel,
  RadioGroup,
  Radio,
  FormLabel,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  CircularProgress,
  Chip,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  PhotoCamera as CameraIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Send as SendIcon,
  PictureAsPdf as PdfIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import { format } from 'date-fns';
import { getStatusChip } from '@/components/common/DataTable';
import { getStickerUsageForJob, reportStickerRemovalByJob } from '@/utils/stickerTracking';
import { getTagForJob, reportTagRemoval } from '@/utils/tagTracking';
import { logUserAction } from '@/utils/activityLogger';
import { SignatureCapture, SignatureData } from '@/components/common/SignatureCapture';
import { Evidence, EvidenceType, EvidenceCategory } from '@/types';
import { hasPermission } from '@/utils/permissions';
import { exportReportAsPDF, getReportType } from '@/utils/reportExport';
import {
  Warning as WarningIcon,
  Label as LabelIcon,
  Inventory as InventoryIcon,
  ReportProblem as ReportIcon,
  Edit as EditIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import DialogContentText from '@mui/material/DialogContentText';

export const JobOrderDetail: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { jobOrders, submitJobOrderReport, currentUser } = useAppContext();
  const jobOrder = useMemo(() => {
    return jobOrders.find((job) => job.id === jobId);
  }, [jobOrders, jobId]);

  const [formData, setFormData] = useState({
    equipmentSerial: '',
    location: jobOrder?.location || '',
    condition: '',
    safetyCheck: '',
    loadTest: '',
    visualInspection: '',
    observations: '',
  });

  // Structured Evidence Collection states
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [evidenceDialogOpen, setEvidenceDialogOpen] = useState(false);
  const [editingEvidenceId, setEditingEvidenceId] = useState<string | null>(null);
  const [newEvidenceFile, setNewEvidenceFile] = useState<File | null>(null);
  const [newEvidenceType, setNewEvidenceType] = useState<EvidenceType>('Photo');
  const [newEvidenceCategory, setNewEvidenceCategory] = useState<EvidenceCategory>('Equipment Photo');
  const [newEvidenceDescription, setNewEvidenceDescription] = useState('');
  const [newEvidenceLinkedField, setNewEvidenceLinkedField] = useState<string>('');
  
  // Legacy photos state (for backward compatibility during migration)
  const [photos, setPhotos] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  
  // Sticker and Tag removal states
  const [stickerUsage, setStickerUsage] = React.useState<any>(null);
  const [tagInfo, setTagInfo] = React.useState<any>(null);
  const [removalDialogOpen, setRemovalDialogOpen] = useState(false);
  const [removalType, setRemovalType] = useState<'sticker' | 'tag' | null>(null);
  
  // Signature Collection states
  const [signatures, setSignatures] = useState<SignatureData[]>([]);
  const [signatureDialogOpen, setSignatureDialogOpen] = useState(false);
  const [editingSignatureId, setEditingSignatureId] = useState<string | null>(null);

  // Load saved form data, evidence, and signatures when component mounts or jobOrder changes
  React.useEffect(() => {
    if (jobOrder) {
      // Priority: Load from reportData if job is completed, otherwise load from draft
      if (jobOrder.status === 'Completed' && jobOrder.reportData) {
        // Load form data from submitted reportData
        setFormData({
          equipmentSerial: jobOrder.reportData.equipmentSerial || '',
          location: jobOrder.reportData.location || jobOrder.location || '',
          condition: jobOrder.reportData.condition || '',
          safetyCheck: jobOrder.reportData.safetyCheck || '',
          loadTest: jobOrder.reportData.loadTest || '',
          visualInspection: jobOrder.reportData.visualInspection || '',
          observations: jobOrder.reportData.observations || '',
        });

        // Load evidence metadata from reportData
        if (jobOrder.reportData.evidence && Array.isArray(jobOrder.reportData.evidence)) {
          const evidenceMetadata = jobOrder.reportData.evidence.map((evd: any) => ({
            id: evd.id,
            type: evd.type,
            category: evd.category,
            description: evd.description,
            linkedField: evd.linkedField,
            fileName: evd.fileName,
            fileSize: evd.fileSize,
            mimeType: evd.mimeType,
            uploadedAt: new Date(evd.uploadedAt),
            uploadedBy: evd.uploadedBy,
            // Create placeholder file object (in production, files would be fetched from server)
            file: new File([], evd.fileName, { type: evd.mimeType }),
          }));
          setEvidence(evidenceMetadata);
        }

        // Load signatures from job order
        if (jobOrder.signatures && Array.isArray(jobOrder.signatures)) {
          const loadedSignatures = jobOrder.signatures.map((sig: any) => ({
            ...sig,
            signedAt: new Date(sig.signedAt),
          }));
          setSignatures(loadedSignatures);
        }
      } else {
        // Load draft data if job is not completed
        const draft = localStorage.getItem(`draft-${jobId}`);
        if (draft) {
          try {
            const { formData: savedFormData, signatures: savedSignatures, evidenceCount } = JSON.parse(draft);
            if (savedFormData) {
              setFormData(savedFormData);
            }
            if (savedSignatures) {
              setSignatures(savedSignatures.map((sig: any) => ({
                ...sig,
                signedAt: new Date(sig.signedAt),
              })));
            }
          } catch (e) {
            console.error('Error loading draft:', e);
          }
        }

        // Also load signatures from job order if they exist (for in-progress jobs)
        if (jobOrder.signatures && Array.isArray(jobOrder.signatures)) {
          setSignatures(jobOrder.signatures.map((sig: any) => ({
            ...sig,
            signedAt: new Date(sig.signedAt),
          })));
        }
      }
    }
  }, [jobOrder, jobId]);

  if (!jobOrder) {
    return (
      <Alert severity="error">Job order not found</Alert>
    );
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  // Structured Evidence Collection Handlers
  const handleEvidenceFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setNewEvidenceFile(file);
      setEvidenceDialogOpen(true);
      // Auto-detect evidence type based on file type
      if (file.type.startsWith('image/')) {
        setNewEvidenceType('Photo');
        setNewEvidenceCategory('Equipment Photo');
      } else if (file.type.startsWith('video/')) {
        setNewEvidenceType('Video');
        setNewEvidenceCategory('General Documentation');
      } else if (file.type === 'application/pdf') {
        setNewEvidenceType('Document');
        setNewEvidenceCategory('Certificate');
      } else {
        setNewEvidenceType('Document');
        setNewEvidenceCategory('General Documentation');
      }
    }
  };

  const handleAddEvidence = () => {
    if (!newEvidenceFile) return;

    const evidenceItem: Evidence = {
      id: editingEvidenceId || `evd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file: newEvidenceFile,
      type: newEvidenceType,
      category: newEvidenceCategory,
      description: newEvidenceDescription || undefined,
      linkedField: newEvidenceLinkedField || undefined,
      uploadedAt: new Date(),
      uploadedBy: currentUser?.id,
      fileName: newEvidenceFile.name,
      fileSize: newEvidenceFile.size,
      mimeType: newEvidenceFile.type,
    };

    if (editingEvidenceId) {
      // Update existing evidence
      setEvidence(evidence.map(evd => evd.id === editingEvidenceId ? evidenceItem : evd));
    } else {
      // Add new evidence
      setEvidence([...evidence, evidenceItem]);
    }

    // Reset form
    setNewEvidenceFile(null);
    setNewEvidenceType('Photo');
    setNewEvidenceCategory('Equipment Photo');
    setNewEvidenceDescription('');
    setNewEvidenceLinkedField('');
    setEditingEvidenceId(null);
    setEvidenceDialogOpen(false);
  };

  const handleEditEvidence = (evidenceId: string) => {
    const evd = evidence.find(e => e.id === evidenceId);
    if (evd) {
      setNewEvidenceFile(evd.file);
      setNewEvidenceType(evd.type);
      setNewEvidenceCategory(evd.category);
      setNewEvidenceDescription(evd.description || '');
      setNewEvidenceLinkedField(evd.linkedField || '');
      setEditingEvidenceId(evidenceId);
      setEvidenceDialogOpen(true);
    }
  };

  const handleDeleteEvidence = (evidenceId: string) => {
    setEvidence(evidence.filter(e => e.id !== evidenceId));
  };

  const handleCancelEvidenceDialog = () => {
    setNewEvidenceFile(null);
    setNewEvidenceType('Photo');
    setNewEvidenceCategory('Equipment Photo');
    setNewEvidenceDescription('');
    setNewEvidenceLinkedField('');
    setEditingEvidenceId(null);
    setEvidenceDialogOpen(false);
  };

  // Legacy photo handlers (for backward compatibility)
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setPhotos([...photos, ...Array.from(event.target.files)]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  // Get available form fields for linking
  const getFormFieldsForLinking = (): Array<{ value: string; label: string }> => {
    return [
      { value: 'equipmentSerial', label: 'Equipment Serial Number' },
      { value: 'location', label: 'Location' },
      { value: 'condition', label: 'Overall Condition' },
      { value: 'safetyCheck', label: 'Safety Check' },
      { value: 'loadTest', label: 'Load Test' },
      { value: 'visualInspection', label: 'Visual Inspection' },
      { value: 'observations', label: 'Observations & Notes' },
    ];
  };

  const validateForm = (): boolean => {
    const errors: Record<string, boolean> = {};
    
    if (!formData.equipmentSerial.trim()) {
      errors.equipmentSerial = true;
    }
    if (!formData.safetyCheck) {
      errors.safetyCheck = true;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    
    // Save to localStorage for persistence
    setTimeout(() => {
      localStorage.setItem(`draft-${jobId}`, JSON.stringify({ 
        formData, 
        photoCount: photos.length, // Legacy
        evidenceCount: evidence.length, // Structured evidence count
        signatures: signatures.map(sig => ({
          ...sig,
          signedAt: sig.signedAt.toISOString(),
        })),
      }));
      setIsSaving(false);
      setSnackbarMessage('Draft saved successfully!');
      setShowSnackbar(true);
    }, 500);
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      setSnackbarMessage('Please fill in all required fields');
      setShowSnackbar(true);
      return;
    }

    // Check for evidence (structured) or photos (legacy)
    const totalEvidence = evidence.length + photos.length;
    if (totalEvidence === 0) {
      if (!confirm('No evidence uploaded. Do you want to submit anyway?')) {
        return;
      }
    }

    setIsSubmitting(true);

    // Convert evidence to files for submission (backward compatibility)
    const evidenceFiles = evidence.map(evd => evd.file);
    const allFiles = [...evidenceFiles, ...photos];

    // Simulate API call
    setTimeout(() => {
      const success = submitJobOrderReport(
        jobId!, 
        {
          ...formData,
          evidence: evidence.map(evd => ({
            id: evd.id,
            type: evd.type,
            category: evd.category,
            description: evd.description,
            linkedField: evd.linkedField,
            fileName: evd.fileName,
            fileSize: evd.fileSize,
            mimeType: evd.mimeType,
            uploadedAt: evd.uploadedAt.toISOString(),
          })),
        },
        allFiles,
        signatures.map(sig => ({
          ...sig,
          signedAt: sig.signedAt,
        }))
      );
      
      setIsSubmitting(false);
      
      if (success) {
        // Clear draft
        localStorage.removeItem(`draft-${jobId}`);
        
        setSnackbarMessage('Report submitted for approval successfully!');
        setShowSnackbar(true);
        
        // Redirect after showing success message
        setTimeout(() => {
          navigate('/inspector');
        }, 2000);
      } else {
        setSnackbarMessage('Error submitting report. Please try again.');
        setShowSnackbar(true);
      }
    }, 1500);
  };

  // Signature Collection Handlers
  const handleAddSignature = () => {
    setEditingSignatureId(null);
    setSignatureDialogOpen(true);
  };

  const handleEditSignature = (signatureId: string) => {
    setEditingSignatureId(signatureId);
    setSignatureDialogOpen(true);
  };

  const handleSaveSignature = (signature: SignatureData) => {
    if (editingSignatureId) {
      // Update existing signature
      setSignatures(signatures.map(sig => 
        sig.id === editingSignatureId ? signature : sig
      ));
    } else {
      // Add new signature
      setSignatures([...signatures, signature]);
    }
    setSignatureDialogOpen(false);
    setEditingSignatureId(null);
  };

  const handleDeleteSignature = (signatureId: string) => {
    if (confirm('Are you sure you want to delete this signature?')) {
      setSignatures(signatures.filter(sig => sig.id !== signatureId));
    }
  };

  const getSignatureToEdit = (): SignatureData | undefined => {
    if (!editingSignatureId) return undefined;
    return signatures.find(sig => sig.id === editingSignatureId);
  };

  // Load draft and sticker/tag info on mount
  React.useEffect(() => {
    const draft = localStorage.getItem(`draft-${jobId}`);
    if (draft) {
      try {
        const { formData: savedFormData, signatures: savedSignatures } = JSON.parse(draft);
        setFormData(savedFormData);
        if (savedSignatures) {
          setSignatures(savedSignatures.map((sig: any) => ({
            ...sig,
            signedAt: new Date(sig.signedAt),
          })));
        }
        setSnackbarMessage('Draft loaded');
        setShowSnackbar(true);
      } catch (e) {
        console.error('Error loading draft:', e);
      }
    }
    
    // Load signatures from job order if they exist
    if (jobOrder?.signatures && jobOrder.signatures.length > 0) {
      setSignatures(jobOrder.signatures.map((sig: any) => ({
        ...sig,
        signedAt: new Date(sig.signedAt),
      })));
    }
    
    // Load sticker and tag allocation info
    if (jobId) {
      const usage = getStickerUsageForJob(jobId);
      setStickerUsage(usage);
      
      const tag = getTagForJob(jobId);
      setTagInfo(tag);
    }
  }, [jobId, jobOrder]);

  const handleReportRemoval = (type: 'sticker' | 'tag') => {
    setRemovalType(type);
    setRemovalDialogOpen(true);
  };

  const confirmRemoval = () => {
    if (!jobId || !removalType) return;

    let success = false;

    if (removalType === 'sticker') {
      success = reportStickerRemovalByJob(jobId, jobOrder?.assignedTo || 'user-2');
      if (success) {
        logUserAction(
          'UPDATE',
          'DOCUMENT',
          jobId,
          'Sticker removal reported',
          `Sticker removed from equipment for job order ${jobId}`,
          { jobOrderId: jobId, type: 'sticker' },
          jobOrder?.assignedTo || 'user-2',
          jobOrder?.assignedToName || 'Inspector',
          'inspector'
        );
        setSnackbarMessage('Sticker removal reported successfully. System has been notified.');
        // Reload sticker usage
        const usage = getStickerUsageForJob(jobId);
        setStickerUsage(usage);
      }
    } else if (removalType === 'tag') {
      if (tagInfo) {
        success = reportTagRemoval(tagInfo.id, jobOrder?.assignedTo || 'user-2');
        if (success) {
          logUserAction(
            'UPDATE',
            'DOCUMENT',
            jobId,
            'Tag removal reported',
            `Tag ${tagInfo.tagNumber} removed from equipment for job order ${jobId}`,
            { jobOrderId: jobId, tagNumber: tagInfo.tagNumber, type: 'tag' },
            currentUser?.id,
            currentUser?.name,
            currentUser?.currentRole
          );
          setSnackbarMessage(`Tag ${tagInfo.tagNumber} removal reported successfully. System has been notified.`);
          // Reload tag info
          const tag = getTagForJob(jobId);
          setTagInfo(tag);
        }
      }
    }

    if (success) {
      setShowSnackbar(true);
    } else {
      setSnackbarMessage('Failed to report removal. Please try again.');
      setShowSnackbar(true);
    }

    setRemovalDialogOpen(false);
    setRemovalType(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight={700} sx={{ color: 'text.primary' }}>
          Job Order Detail
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Complete the inspection checklist and submit for approval
        </Typography>
      </Box>

      {/* Revision Alert */}
      {jobOrder.revisionComments && jobOrder.status === 'In Progress' && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          <Typography variant="body1" fontWeight={600} gutterBottom>
            Revision Requested by Supervisor
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {jobOrder.revisionComments}
          </Typography>
          {jobOrder.revisionRequestedAt && (
            <Typography variant="caption" color="text.secondary">
              Requested at: {format(new Date(jobOrder.revisionRequestedAt), 'MMMM dd, yyyy hh:mm a')}
            </Typography>
          )}
        </Alert>
      )}

      {/* Job Order Header */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Job ID
              </Typography>
              <Typography variant="h6" fontWeight={600}>{jobOrder.id}</Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Client
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {jobOrder.clientName}
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Service Types
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {jobOrder.serviceTypes.map((type) => (
                  <Chip key={type} label={type} size="small" color="primary" />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Status
              </Typography>
              {getStatusChip(jobOrder.status)}
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Scheduled Date
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {format(jobOrder.dateTime, 'EEEE, MMMM dd, yyyy - hh:mm a')}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Location
              </Typography>
              <Typography variant="body1" fontWeight={500}>{jobOrder.location}</Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sticker & Tag Allocation Section */}
      {(jobOrder?.stickerAllocation || jobOrder?.tagAllocation || stickerUsage || tagInfo) && (
        <Card elevation={2} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
              color: 'white',
              p: 2,
            }}
          >
            <Typography variant="h6" fontWeight={600}>
              Sticker & Tag Allocation
            </Typography>
          </Box>
          <CardContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              {/* Sticker Info */}
              {(jobOrder?.stickerAllocation || stickerUsage) && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <InventoryIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        Sticker Information
                      </Typography>
                    </Box>
                    {stickerUsage?.status === 'Removed' ? (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight={600}>
                          ⚠️ Sticker Removed
                        </Typography>
                        <Typography variant="caption">
                          Removed on: {stickerUsage.removedAt ? format(new Date(stickerUsage.removedAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                        </Typography>
                      </Alert>
                    ) : (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Lot Number:</strong> {jobOrder?.stickerAllocation?.stickerLotNumber || stickerUsage?.stickerLotNumber || 'N/A'}
                        </Typography>
                        {jobOrder?.stickerAllocation?.stickerSize && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Size:</strong> {jobOrder.stickerAllocation.stickerSize}
                          </Typography>
                        )}
                        {jobOrder?.stickerAllocation?.stickerNumber && (
                          <Typography variant="body2" color="text.secondary">
                            <strong>Sticker Number:</strong> {jobOrder.stickerAllocation.stickerNumber}
                          </Typography>
                        )}
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<ReportIcon />}
                          onClick={() => handleReportRemoval('sticker')}
                          sx={{ mt: 2 }}
                        >
                          Report Sticker Removed
                        </Button>
                      </>
                    )}
                  </Box>
                </Grid>
              )}

              {/* Tag Info */}
              {(jobOrder?.tagAllocation || tagInfo) && (
                <Grid item xs={12} md={6}>
                  <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <LabelIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle1" fontWeight={600}>
                        Tag Information
                      </Typography>
                    </Box>
                    {tagInfo?.status === 'Removed' ? (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        <Typography variant="body2" fontWeight={600}>
                          ⚠️ Tag Removed
                        </Typography>
                        <Typography variant="caption">
                          Removed on: {tagInfo.removedAt ? format(new Date(tagInfo.removedAt), 'MMM dd, yyyy HH:mm') : 'N/A'}
                        </Typography>
                      </Alert>
                    ) : (
                      <>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Tag Number:</strong> {jobOrder?.tagAllocation?.tagNumber || tagInfo?.tagNumber || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                          Use this tag number for traceability
                        </Typography>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<ReportIcon />}
                          onClick={() => handleReportRemoval('tag')}
                          sx={{ mt: 2 }}
                        >
                          Report Tag Removed
                        </Button>
                      </>
                    )}
                  </Box>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Inspection Checklist Form */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom fontWeight={600} sx={{ mb: 3 }}>
            Inspection Checklist
          </Typography>

          <Grid container spacing={3}>
            {/* Equipment Details Section */}
            <Grid item xs={12}>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Equipment Details
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                required
                fullWidth
                label="Equipment Serial Number"
                value={formData.equipmentSerial}
                onChange={(e) => handleInputChange('equipmentSerial', e.target.value)}
                error={formErrors.equipmentSerial}
                helperText={formErrors.equipmentSerial ? 'This field is required' : 'Enter equipment/operator/test identifier based on service type'}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Equipment Location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </Grid>

            {/* Inspection Questions */}
            <Grid item xs={12}>
              <Divider sx={{ my: 3 }} />
              <Typography variant="subtitle1" fontWeight={600} gutterBottom sx={{ color: 'text.primary' }}>
                Safety Checks
              </Typography>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormLabel required error={formErrors.safetyCheck}>
                Safety Check Passed?
              </FormLabel>
              <RadioGroup
                row
                value={formData.safetyCheck}
                onChange={(e) => {
                  handleInputChange('safetyCheck', e.target.value);
                  setFormErrors({ ...formErrors, safetyCheck: false });
                }}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
                <FormControlLabel value="na" control={<Radio />} label="N/A" />
              </RadioGroup>
              {formErrors.safetyCheck && (
                <Typography variant="caption" color="error">
                  This field is required
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <FormLabel>Load Test Completed?</FormLabel>
              <RadioGroup
                row
                value={formData.loadTest}
                onChange={(e) => handleInputChange('loadTest', e.target.value)}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
                <FormControlLabel value="na" control={<Radio />} label="N/A" />
              </RadioGroup>
            </Grid>

            <Grid item xs={12} md={6}>
              <FormLabel>Visual Inspection Passed?</FormLabel>
              <RadioGroup
                row
                value={formData.visualInspection}
                onChange={(e) => handleInputChange('visualInspection', e.target.value)}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
                <FormControlLabel value="na" control={<Radio />} label="N/A" />
              </RadioGroup>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Overall Condition"
                value={formData.condition}
                onChange={(e) => handleInputChange('condition', e.target.value)}
                SelectProps={{ native: true }}
              >
                <option value=""></option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Observations & Notes"
                placeholder="Enter any additional observations, defects found, or recommendations..."
                value={formData.observations}
                onChange={(e) => handleInputChange('observations', e.target.value)}
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Structured Evidence Collection Section */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Evidence Collection
          </Typography>
              <Typography variant="body2" color="text.secondary">
                Upload structured evidence with types, categories, and form field linking
          </Typography>
            </Box>
            <Button 
              variant="contained"
              component="label" 
              startIcon={<UploadIcon />}
              onClick={() => {}}
              disabled={jobOrder.status === 'Completed'}
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0e2c62 0%, #1a4288 100%)',
                },
              }}
            >
              Add Evidence
              <input 
                type="file" 
                hidden 
                accept="image/*,video/*,.pdf,.doc,.docx" 
                onChange={handleEvidenceFileSelect}
              />
            </Button>
          </Box>

          {evidence.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                No evidence uploaded yet. Click "Add Evidence" to upload photos, documents, videos, or certificates with structured metadata.
              </Typography>
            </Alert>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Evidence Items ({evidence.length})
              </Typography>
              
              {/* Group evidence by category */}
              {['Equipment Photo', 'Defect Photo', 'Before Photo', 'After Photo', 'Certificate', 'Test Result', 'Measurement', 'General Documentation', 'Other'].map((category) => {
                const categoryEvidence = evidence.filter(evd => evd.category === category);
                if (categoryEvidence.length === 0) return null;

                return (
                  <Box key={category} sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1, color: 'text.primary' }}>
                      {category} ({categoryEvidence.length})
                    </Typography>
                    <Grid container spacing={2}>
                      {categoryEvidence.map((evd) => (
                        <Grid item xs={12} md={6} key={evd.id}>
                          <Paper
                            elevation={1}
                            sx={{
                              p: 2,
                              border: '1px solid',
                              borderColor: 'grey.300',
                              borderRadius: 2,
                              position: 'relative',
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="body2" fontWeight={600} noWrap>
                                  {evd.fileName}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                                  <Chip 
                                    label={evd.type} 
                                    size="small" 
                                    color={evd.type === 'Photo' ? 'primary' : evd.type === 'Document' ? 'secondary' : 'default'}
                                  />
                                  {evd.linkedField && (
                                    <Chip 
                                      label={`Linked: ${getFormFieldsForLinking().find(f => f.value === evd.linkedField)?.label || evd.linkedField}`}
                                      size="small"
              variant="outlined" 
                                    />
                                  )}
                                </Box>
                                {evd.description && (
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                    {evd.description}
                                  </Typography>
                                )}
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                  {(evd.fileSize / 1024).toFixed(2)} KB • {format(evd.uploadedAt, 'MMM dd, yyyy HH:mm')}
                                </Typography>
                              </Box>
                              {jobOrder.status !== 'Completed' && (
                                <Box sx={{ display: 'flex', gap: 0.5 }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEditEvidence(evd.id)}
                                    color="primary"
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeleteEvidence(evd.id)}
                                    color="error"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              )}
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Signature Collection Section */}
      <Card elevation={2} sx={{ mb: 3, borderRadius: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
            color: 'white',
            p: 2,
          }}
        />
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Signatures (People of Sight)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Collect signatures from people present at the site according to form requirements
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<PersonIcon />}
              onClick={handleAddSignature}
              disabled={jobOrder.status === 'Completed'}
              sx={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0e2c62 0%, #1a4288 100%)',
                },
              }}
            >
              Add Signature
            </Button>
          </Box>

          {signatures.length === 0 ? (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                No signatures collected yet. Click "Add Signature" to capture signatures from people present at the site.
              </Typography>
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {signatures.map((signature) => (
                <Grid item xs={12} md={6} key={signature.id}>
                  <Paper
                    elevation={1}
                    sx={{ 
                      p: 2,
                      border: '1px solid',
                      borderColor: 'grey.300',
                      borderRadius: 2,
                      position: 'relative',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {signature.signerName}
                        </Typography>
                        {signature.signerRole && (
                          <Typography variant="caption" color="text.secondary">
                            {signature.signerRole}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Signed: {format(signature.signedAt, 'MMM dd, yyyy HH:mm')}
                        </Typography>
                      </Box>
                      {jobOrder.status !== 'Completed' && (
                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <IconButton 
                            size="small"
                            onClick={() => handleEditSignature(signature.id)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteSignature(signature.id)}
                        color="error"
                      >
                            <DeleteIcon fontSize="small" />
                      </IconButton>
                        </Box>
                      )}
                    </Box>
                    <Box
                      sx={{
                        mt: 2,
                        p: 1,
                        bgcolor: 'grey.50',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'grey.300',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        minHeight: '80px',
                      }}
                    >
                      <img
                        src={signature.signatureData}
                        alt={`Signature of ${signature.signerName}`}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '80px',
                          objectFit: 'contain',
                        }}
                      />
            </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Signature Capture Dialog */}
      <SignatureCapture
        open={signatureDialogOpen}
        onClose={() => {
          setSignatureDialogOpen(false);
          setEditingSignatureId(null);
        }}
        onSave={handleSaveSignature}
        signerName={getSignatureToEdit()?.signerName || ''}
        signerRole={getSignatureToEdit()?.signerRole || ''}
        title={editingSignatureId ? 'Edit Signature' : 'Capture Signature'}
      />

      {/* Evidence Collection Dialog */}
      <Dialog 
        open={evidenceDialogOpen} 
        onClose={handleCancelEvidenceDialog}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          {editingEvidenceId ? 'Edit Evidence' : 'Add Evidence'}
        </DialogTitle>
        <DialogContent dividers>
          {newEvidenceFile && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>File:</strong> {newEvidenceFile.name} ({(newEvidenceFile.size / 1024).toFixed(2)} KB)
              </Typography>
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Evidence Type</InputLabel>
                <Select
                  value={newEvidenceType}
                  onChange={(e) => setNewEvidenceType(e.target.value as EvidenceType)}
                  label="Evidence Type"
                >
                  <MenuItem value="Photo">Photo</MenuItem>
                  <MenuItem value="Document">Document</MenuItem>
                  <MenuItem value="Video">Video</MenuItem>
                  <MenuItem value="Certificate">Certificate</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={newEvidenceCategory}
                  onChange={(e) => setNewEvidenceCategory(e.target.value as EvidenceCategory)}
                  label="Category"
                >
                  <MenuItem value="Equipment Photo">Equipment Photo</MenuItem>
                  <MenuItem value="Defect Photo">Defect Photo</MenuItem>
                  <MenuItem value="Before Photo">Before Photo</MenuItem>
                  <MenuItem value="After Photo">After Photo</MenuItem>
                  <MenuItem value="Certificate">Certificate</MenuItem>
                  <MenuItem value="Test Result">Test Result</MenuItem>
                  <MenuItem value="Measurement">Measurement</MenuItem>
                  <MenuItem value="General Documentation">General Documentation</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                multiline
                rows={3}
                value={newEvidenceDescription}
                onChange={(e) => setNewEvidenceDescription(e.target.value)}
                placeholder="Add a description or notes about this evidence..."
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Link to Form Field (Optional)</InputLabel>
                <Select
                  value={newEvidenceLinkedField}
                  onChange={(e) => setNewEvidenceLinkedField(e.target.value)}
                  label="Link to Form Field (Optional)"
                >
                  <MenuItem value="">None</MenuItem>
                  {getFormFieldsForLinking().map((field) => (
                    <MenuItem key={field.value} value={field.value}>
                      {field.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                Link this evidence to a specific form field for better organization
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelEvidenceDialog} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={handleAddEvidence} 
            variant="contained" 
            color="primary"
            disabled={!newEvidenceFile}
          >
            {editingEvidenceId ? 'Update Evidence' : 'Add Evidence'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Action Buttons */}
      <Card elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <CardContent sx={{ p: 4 }}>
          {!hasPermission(currentUser, 'downloadReports') && jobOrder.status === 'Completed' ? (
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
              This job order has been submitted and is awaiting approval. You do not have permission to modify it.
            </Alert>
          ) : (
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
            Please ensure all mandatory fields are completed before submitting for approval.
          </Alert>
          )}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            {/* Download FIR/FTR PDF Button - Only show for completed jobs */}
            {jobOrder.status === 'Completed' && getReportType(jobOrder) && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<PdfIcon />}
                onClick={async () => {
                  try {
                    await exportReportAsPDF(jobOrder);
                  } catch (error) {
                    console.error('Error exporting report:', error);
                  }
                }}
                sx={{ px: 3 }}
              >
                Download {getReportType(jobOrder)} PDF
              </Button>
            )}
            {(jobOrder.status !== 'Completed' || hasPermission(currentUser, 'approveJobOrders')) && (
              <>
            <Button 
              variant="outlined" 
              startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />} 
              onClick={handleSaveDraft}
              disabled={isSaving || isSubmitting || jobOrder.status === 'Completed'}
              sx={{ px: 3 }}
            >
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button 
              variant="contained" 
              size="large"
              startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />} 
              onClick={handleSubmit}
              disabled={isSaving || isSubmitting || jobOrder.status === 'Completed'}
              sx={{
                px: 4,
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #0e2c62 0%, #1a4288 100%)',
                },
              }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit for Approval'}
            </Button>
              </>
            )}
          </Box>
          
          {/* Success/Error Snackbar */}
          <Snackbar
            open={showSnackbar}
            autoHideDuration={4000}
            onClose={() => setShowSnackbar(false)}
            message={snackbarMessage}
          />
        </CardContent>
      </Card>

      {/* Removal Confirmation Dialog */}
      <Dialog open={removalDialogOpen} onClose={() => setRemovalDialogOpen(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon sx={{ mr: 1, color: 'error.main' }} />
            Report {removalType === 'sticker' ? 'Sticker' : 'Tag'} Removal
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure the {removalType === 'sticker' ? 'sticker' : 'tag'} has been physically removed from the equipment?
            <br /><br />
            <strong>This action will:</strong>
            <ul>
              <li>Mark the {removalType === 'sticker' ? 'sticker' : 'tag'} as removed in the system</li>
              <li>Record the removal date and time</li>
              <li>Notify managers about the removal</li>
            </ul>
            <br />
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemovalDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmRemoval} color="error" variant="contained">
            Confirm Removal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

