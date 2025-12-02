import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Typography,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, CameraAlt as CameraIcon } from '@mui/icons-material';

interface QRScannerProps {
  open: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({
  open,
  onClose,
  onScanSuccess,
  onScanError,
}) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    if (open && !scannerRef.current) {
      // Wait for DOM element to be available
      const timer = setTimeout(() => {
        const element = document.getElementById('qr-reader');
        if (!element) {
          setError('QR scanner element not found. Please try again.');
          return;
        }

        // Check if HTTPS or localhost
        const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        
        if (!isSecure) {
          setError('Camera access requires HTTPS connection. Please use HTTPS or localhost.');
          return;
        }

        // Check if getUserMedia is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          setError('Camera access is not available in your browser. Please use a modern browser with camera support.');
          return;
        }

        try {
          const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            supportedScanTypes: [] as any[],
          };

          const scanner = new Html5QrcodeScanner(
            'qr-reader',
            config,
            false // verbose
          );

          scanner.render(
            (decodedText) => {
              // Success callback
              setIsScanning(false);
              try {
                scanner.clear();
              } catch (e) {
                // Ignore cleanup errors
              }
              scannerRef.current = null;
              onScanSuccess(decodedText);
              onClose();
            },
            (errorMessage) => {
              // Error callback - ignore common errors during scanning
              if (errorMessage && !errorMessage.includes('NotFoundException') && !errorMessage.includes('No MultiFormat Readers')) {
                // Only show non-common errors
                console.log('QR Scan Error:', errorMessage);
              }
            }
          );

          scannerRef.current = scanner;
          setIsScanning(true);
          setError(null);
        } catch (err) {
          console.error('QR Scanner Error:', err);
          const errorMessage = err instanceof Error ? err.message : 'Failed to initialize QR scanner';
          setError(errorMessage);
          if (onScanError) {
            onScanError(errorMessage);
          }
        }
      }, 100); // Small delay to ensure DOM is ready

      return () => {
        clearTimeout(timer);
      };
    }

    // Cleanup when dialog closes
    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear();
        } catch (err) {
          // Ignore cleanup errors
        }
        scannerRef.current = null;
      }
      setIsScanning(false);
      setError(null);
    };
  }, [open, onScanSuccess, onClose, onScanError]);

  const handleClose = () => {
    if (scannerRef.current) {
      try {
        scannerRef.current.clear();
      } catch (err) {
        // Ignore cleanup errors
      }
      scannerRef.current = null;
    }
    setIsScanning(false);
    setError(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CameraIcon />
            <Typography variant="h6">Scan QR Code</Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            <Alert severity="info" sx={{ mb: 2 }}>
              Position the QR code within the frame. Make sure you have granted camera permissions.
            </Alert>
            <Box
              id="qr-reader"
              sx={{
                width: '100%',
                minHeight: '300px',
              }}
            />
            {isScanning && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
                Scanning...
              </Typography>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

