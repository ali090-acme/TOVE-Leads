/**
 * Bulk Download Utility
 * Downloads multiple certificates/documents as ZIP file
 */

import { Certificate } from '@/types';
import { exportCertificateAsPDF, exportCertificateAsImage } from './certificateExport';

/**
 * Download multiple certificates as ZIP file
 */
export const bulkDownloadCertificates = async (
  certificates: Certificate[],
  format: 'PDF' | 'IMAGE' = 'PDF'
): Promise<void> => {
  try {
    // Dynamic import of JSZip
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Process each certificate
    for (const cert of certificates) {
      try {
        if (format === 'PDF') {
          // Generate PDF blob
          const pdfBlob = await generatePDFBlob(cert);
          const fileName = `${cert.certificateNumber.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
          zip.file(fileName, pdfBlob);
        } else {
          // Generate Image blob
          const imageBlob = await generateImageBlob(cert);
          const fileName = `${cert.certificateNumber.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
          zip.file(fileName, imageBlob);
        }
      } catch (error) {
        console.error(`Error processing certificate ${cert.certificateNumber}:`, error);
        // Continue with other certificates even if one fails
      }
    }

    // Generate ZIP file
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    
    // Download ZIP
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `certificates-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error creating bulk download:', error);
    throw new Error('Failed to create bulk download. Please try again.');
  }
};

/**
 * Generate PDF blob for a certificate
 */
const generatePDFBlob = async (certificate: Certificate): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default;
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      // Certificate background color
      doc.setFillColor(30, 60, 114);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');

      // White content area
      doc.setFillColor(255, 255, 255);
      doc.rect(10, 10, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 20, 'F');

      // Title
      doc.setTextColor(30, 60, 114);
      doc.setFontSize(24);
      doc.setFont('helvetica', 'bold');
      doc.text('CERTIFICATE OF COMPLIANCE', doc.internal.pageSize.getWidth() / 2, 30, {
        align: 'center',
      });

      // Certificate Number
      doc.setFontSize(14);
      doc.setFont('helvetica', 'normal');
      doc.text(`Certificate Number: ${certificate.certificateNumber}`, doc.internal.pageSize.getWidth() / 2, 45, {
        align: 'center',
      });

      // Verification Code
      doc.setFontSize(12);
      doc.text(`Verification Code: ${certificate.verificationCode || 'N/A'}`, doc.internal.pageSize.getWidth() / 2, 55, {
        align: 'center',
      });

      // Content
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(`This is to certify that`, doc.internal.pageSize.getWidth() / 2, 75, {
        align: 'center',
      });

      // Certificate holder name
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(certificate.clientName, doc.internal.pageSize.getWidth() / 2, 90, {
        align: 'center',
      });

      // Certificate details
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const details = [
        `Service Type: ${certificate.serviceType}`,
        `Issue Date: ${certificate.issueDate.toLocaleDateString()}`,
        `Expiry Date: ${certificate.expiryDate.toLocaleDateString()}`,
        `Status: ${certificate.status}`,
      ];

      let yPos = 110;
      details.forEach((detail) => {
        doc.text(detail, doc.internal.pageSize.getWidth() / 2, yPos, {
          align: 'center',
        });
        yPos += 10;
      });

      // Signature area
      doc.setFontSize(10);
      doc.text('Authorized Signature', doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 30, {
        align: 'center',
      });

      // Generate blob
      const blob = doc.output('blob');
      resolve(blob);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate Image blob for a certificate
 */
const generateImageBlob = async (certificate: Certificate): Promise<Blob> => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create a temporary canvas element
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 800;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Background
      ctx.fillStyle = '#1e3c72';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // White content area
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(50, 50, canvas.width - 100, canvas.height - 100);

      // Title
      ctx.fillStyle = '#1e3c72';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('CERTIFICATE OF COMPLIANCE', canvas.width / 2, 150);

      // Certificate Number
      ctx.font = '24px Arial';
      ctx.fillText(`Certificate Number: ${certificate.certificateNumber}`, canvas.width / 2, 220);

      // Verification Code
      ctx.font = '18px Arial';
      ctx.fillText(`Verification Code: ${certificate.verificationCode || 'N/A'}`, canvas.width / 2, 260);

      // Content
      ctx.font = '20px Arial';
      ctx.fillText('This is to certify that', canvas.width / 2, 320);

      // Certificate holder name
      ctx.font = 'bold 32px Arial';
      ctx.fillText(certificate.clientName, canvas.width / 2, 380);

      // Certificate details
      ctx.font = '18px Arial';
      const details = [
        `Service Type: ${certificate.serviceType}`,
        `Issue Date: ${certificate.issueDate.toLocaleDateString()}`,
        `Expiry Date: ${certificate.expiryDate.toLocaleDateString()}`,
        `Status: ${certificate.status}`,
      ];

      let yPos = 450;
      details.forEach((detail) => {
        ctx.fillText(detail, canvas.width / 2, yPos);
        yPos += 40;
      });

      // Convert to blob
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to generate image blob'));
        }
      }, 'image/png');
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Download multiple documents as ZIP
 */
export const bulkDownloadDocuments = async (
  documents: Array<{ name: string; content: Blob | string }>
): Promise<void> => {
  try {
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (const doc of documents) {
      if (doc.content instanceof Blob) {
        zip.file(doc.name, doc.content);
      } else {
        zip.file(doc.name, doc.content);
      }
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documents-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error creating bulk document download:', error);
    throw new Error('Failed to create bulk download. Please try again.');
  }
};

