import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Clear as ClearIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

export interface SignatureData {
  id: string;
  signerName: string;
  signerRole?: string;
  signatureData: string; // Base64 encoded signature image
  signedAt: Date;
}

interface SignatureCaptureProps {
  open: boolean;
  onClose: () => void;
  onSave: (signature: SignatureData) => void;
  signerName?: string;
  signerRole?: string;
  title?: string;
}

export const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  open,
  onClose,
  onSave,
  signerName: initialSignerName = '',
  signerRole: initialSignerRole = '',
  title = 'Capture Signature',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signerName, setSignerName] = useState(initialSignerName);
  const [signerRole, setSignerRole] = useState(initialSignerRole);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    if (open && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Set canvas size
        canvas.width = 600;
        canvas.height = 200;
        
        // Set drawing style
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw border
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        // Reset drawing style
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
      }
      setHasSignature(false);
      setSignerName(initialSignerName);
      setSignerRole(initialSignerRole);
    }
  }, [open, initialSignerName, initialSignerRole]);

  const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Redraw border
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    
    // Reset drawing style
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    
    setHasSignature(false);
  };

  const handleSave = () => {
    if (!hasSignature) {
      return;
    }

    if (!signerName.trim()) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const signatureData = canvas.toDataURL('image/png');

    const signature: SignatureData = {
      id: `sig-${Date.now()}`,
      signerName: signerName.trim(),
      signerRole: signerRole.trim() || undefined,
      signatureData,
      signedAt: new Date(),
    };

    onSave(signature);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" fontWeight={600}>
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Signer Name *"
            value={signerName}
            onChange={(e) => setSignerName(e.target.value)}
            required
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Signer Role/Designation (Optional)"
            value={signerRole}
            onChange={(e) => setSignerRole(e.target.value)}
            placeholder="e.g., Site Supervisor, Client Representative"
          />
        </Box>

        <Paper
          elevation={2}
          sx={{
            p: 2,
            border: '2px dashed',
            borderColor: 'grey.300',
            borderRadius: 2,
            bgcolor: 'grey.50',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Sign in the box below (use mouse or touch)
          </Typography>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              bgcolor: 'white',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'grey.300',
              overflow: 'hidden',
            }}
          >
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              style={{
                cursor: 'crosshair',
                touchAction: 'none',
                width: '100%',
                maxWidth: '600px',
                height: '200px',
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={clearSignature}
              disabled={!hasSignature}
            >
              Clear
            </Button>
          </Box>
        </Paper>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={<SaveIcon />}
          disabled={!hasSignature || !signerName.trim()}
        >
          Save Signature
        </Button>
      </DialogActions>
    </Dialog>
  );
};

