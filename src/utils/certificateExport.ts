import { Certificate } from '@/types';
import { format } from 'date-fns';

/**
 * Export certificate as PDF
 * Uses jsPDF library (needs to be installed: npm install jspdf)
 */
export const exportCertificateAsPDF = async (certificate: Certificate): Promise<void> => {
  try {
    // Dynamic import to avoid SSR issues
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default;
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Certificate background color
    doc.setFillColor(30, 60, 114); // Navy blue
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
    let yPos = 75;

    doc.setFont('helvetica', 'bold');
    doc.text('This is to certify that:', 20, yPos);
    yPos += 10;

    doc.setFont('helvetica', 'normal');
    doc.text(`Client: ${certificate.clientName}`, 20, yPos);
    yPos += 8;

    doc.text(`Service Type: ${certificate.serviceType}`, 20, yPos);
    yPos += 8;

    doc.text(`Issue Date: ${format(certificate.issueDate, 'MMMM dd, yyyy')}`, 20, yPos);
    yPos += 8;

    doc.text(`Expiry Date: ${format(certificate.expiryDate, 'MMMM dd, yyyy')}`, 20, yPos);
    yPos += 8;

    if (certificate.jobOrderId) {
      doc.text(`Job Order ID: ${certificate.jobOrderId}`, 20, yPos);
      yPos += 8;
    }

      // Status
      yPos += 5;
      doc.setFont('helvetica', 'bold');
      if (certificate.status === 'Valid') {
        doc.setTextColor(46, 125, 50);
      } else {
        doc.setTextColor(211, 47, 47);
      }
      doc.text(`Status: ${certificate.status}`, 20, yPos);

    // Footer
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(
      'This certificate is issued by TOVE Leeds Compliance System',
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 20,
      { align: 'center' }
    );

    doc.text(
      `Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 15,
      { align: 'center' }
    );

    // Save PDF
    doc.save(`Certificate_${certificate.certificateNumber}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback: Show alert if jsPDF is not available
    alert('PDF export requires jsPDF library. Please install it: npm install jspdf');
  }
};

/**
 * Export certificate as Image (PNG)
 * Uses html2canvas library (needs to be installed: npm install html2canvas)
 */
export const exportCertificateAsImage = async (
  certificate: Certificate,
  elementId?: string
): Promise<void> => {
  try {
    // If elementId is provided, capture that element
    if (elementId) {
      const { default: html2canvas } = await import('html2canvas');
      const element = document.getElementById(elementId);
      if (element) {
        const canvas = await html2canvas(element, {
          backgroundColor: '#ffffff',
          scale: 2,
        });
        const imgData = canvas.toDataURL('image/png');
        downloadImage(imgData, `Certificate_${certificate.certificateNumber}.png`);
        return;
      }
    }

    // Otherwise, create a temporary element
    const { default: html2canvas } = await import('html2canvas');
    const tempDiv = document.createElement('div');
    tempDiv.id = 'certificate-export-temp';
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.width = '800px';
    tempDiv.style.padding = '40px';
    tempDiv.style.backgroundColor = '#ffffff';
    tempDiv.style.border = '2px solid #1e3c72';

    tempDiv.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #1e3c72; font-size: 32px; margin-bottom: 10px;">CERTIFICATE OF COMPLIANCE</h1>
        <p style="color: #666; font-size: 16px;">Certificate Number: ${certificate.certificateNumber}</p>
        <p style="color: #666; font-size: 14px;">Verification Code: ${certificate.verificationCode || 'N/A'}</p>
      </div>
      <div style="margin: 30px 0;">
        <p style="font-size: 16px; margin-bottom: 15px;"><strong>This is to certify that:</strong></p>
        <p style="font-size: 14px; margin-bottom: 10px;">Client: ${certificate.clientName}</p>
        <p style="font-size: 14px; margin-bottom: 10px;">Service Type: ${certificate.serviceType}</p>
        <p style="font-size: 14px; margin-bottom: 10px;">Issue Date: ${format(certificate.issueDate, 'MMMM dd, yyyy')}</p>
        <p style="font-size: 14px; margin-bottom: 10px;">Expiry Date: ${format(certificate.expiryDate, 'MMMM dd, yyyy')}</p>
        ${certificate.jobOrderId ? `<p style="font-size: 14px; margin-bottom: 10px;">Job Order ID: ${certificate.jobOrderId}</p>` : ''}
        <p style="font-size: 16px; margin-top: 20px; color: ${certificate.status === 'Valid' ? '#2e7d32' : '#d32f2f'};"><strong>Status: ${certificate.status}</strong></p>
      </div>
      <div style="text-align: center; margin-top: 40px; color: #999; font-size: 12px;">
        <p>This certificate is issued by TOVE Leeds Compliance System</p>
        <p>Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}</p>
      </div>
    `;

    document.body.appendChild(tempDiv);

    const canvas = await html2canvas(tempDiv, {
      backgroundColor: '#ffffff',
      scale: 2,
    });

    document.body.removeChild(tempDiv);

    const imgData = canvas.toDataURL('image/png');
    downloadImage(imgData, `Certificate_${certificate.certificateNumber}.png`);
  } catch (error) {
    console.error('Error generating image:', error);
    alert('Image export requires html2canvas library. Please install it: npm install html2canvas');
  }
};

/**
 * Helper function to download image
 */
const downloadImage = (dataUrl: string, filename: string): void => {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Bulk export multiple certificates as PDF
 */
export const exportCertificatesBulk = async (certificates: Certificate[]): Promise<void> => {
  try {
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    certificates.forEach((cert, index) => {
      if (index > 0) {
        doc.addPage();
      }

      // Certificate background
      doc.setFillColor(30, 60, 114);
      doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), 'F');

      // White content area
      doc.setFillColor(255, 255, 255);
      doc.rect(10, 10, doc.internal.pageSize.getWidth() - 20, doc.internal.pageSize.getHeight() - 20, 'F');

      // Title
      doc.setTextColor(30, 60, 114);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('CERTIFICATE OF COMPLIANCE', doc.internal.pageSize.getWidth() / 2, 30, {
        align: 'center',
      });

      // Certificate Number
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Certificate Number: ${cert.certificateNumber}`, doc.internal.pageSize.getWidth() / 2, 40, {
        align: 'center',
      });

      // Content
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      let yPos = 55;

      doc.setFont('helvetica', 'bold');
      doc.text('This is to certify that:', 20, yPos);
      yPos += 8;

      doc.setFont('helvetica', 'normal');
      doc.text(`Client: ${cert.clientName}`, 20, yPos);
      yPos += 7;

      doc.text(`Service Type: ${cert.serviceType}`, 20, yPos);
      yPos += 7;

      doc.text(`Issue Date: ${format(cert.issueDate, 'MMM dd, yyyy')}`, 20, yPos);
      yPos += 7;

      doc.text(`Expiry Date: ${format(cert.expiryDate, 'MMM dd, yyyy')}`, 20, yPos);
      yPos += 7;

      doc.setFont('helvetica', 'bold');
      if (cert.status === 'Valid') {
        doc.setTextColor(46, 125, 50);
      } else {
        doc.setTextColor(211, 47, 47);
      }
      doc.text(`Status: ${cert.status}`, 20, yPos);
    });

    doc.save(`Certificates_Bulk_${format(new Date(), 'yyyyMMdd')}.pdf`);
  } catch (error) {
    console.error('Error generating bulk PDF:', error);
    alert('PDF export requires jsPDF library. Please install it: npm install jspdf');
  }
};

