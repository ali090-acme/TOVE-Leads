import { JobOrder } from '@/types';
import { format } from 'date-fns';

/**
 * Export FIR (First Information Report) for Inspection department
 * Uses jsPDF library
 */
export const exportFIRAsPDF = async (jobOrder: JobOrder): Promise<void> => {
  try {
    // Dynamic import to avoid SSR issues
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let yPos = 20;

    // Header
    doc.setFillColor(30, 60, 114); // Navy blue
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FIRST INFORMATION REPORT (FIR)', doc.internal.pageSize.getWidth() / 2, 15, {
      align: 'center',
    });

    doc.setFontSize(12);
    doc.text('Inspection Department', doc.internal.pageSize.getWidth() / 2, 22, {
      align: 'center',
    });

    // Reset text color
    doc.setTextColor(0, 0, 0);
    yPos = 40;

    // Job Order Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Job Order Information', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Job ID: ${jobOrder.id}`, 20, yPos);
    yPos += 6;
    doc.text(`Client: ${jobOrder.clientName}`, 20, yPos);
    yPos += 6;
    doc.text(`Location: ${jobOrder.location}`, 20, yPos);
    yPos += 6;
    doc.text(`Date: ${format(jobOrder.dateTime, 'MMMM dd, yyyy')}`, 20, yPos);
    yPos += 6;
    doc.text(`Inspector: ${jobOrder.assignedToName || 'N/A'}`, 20, yPos);
    yPos += 6;
    doc.text(`Service Types: ${jobOrder.serviceTypes.join(', ')}`, 20, yPos);
    yPos += 10;

    // Inspection Details (if reportData exists)
    if (jobOrder.reportData) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Inspection Details', 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const reportData = jobOrder.reportData;
      if (reportData.equipmentSerial) {
        doc.text(`Equipment Serial Number: ${reportData.equipmentSerial}`, 20, yPos);
        yPos += 6;
      }
      if (reportData.location) {
        doc.text(`Equipment Location: ${reportData.location}`, 20, yPos);
        yPos += 6;
      }
      if (reportData.safetyCheck) {
        doc.text(`Safety Check: ${reportData.safetyCheck}`, 20, yPos);
        yPos += 6;
      }
      if (reportData.loadTest) {
        doc.text(`Load Test: ${reportData.loadTest}`, 20, yPos);
        yPos += 6;
      }
      if (reportData.visualInspection) {
        doc.text(`Visual Inspection: ${reportData.visualInspection}`, 20, yPos);
        yPos += 6;
      }
      if (reportData.condition) {
        doc.text(`Overall Condition: ${reportData.condition}`, 20, yPos);
        yPos += 6;
      }
      if (reportData.observations) {
        doc.text(`Observations:`, 20, yPos);
        yPos += 6;
        const observations = doc.splitTextToSize(reportData.observations, doc.internal.pageSize.getWidth() - 40);
        doc.text(observations, 20, yPos);
        yPos += observations.length * 6;
      }
      yPos += 5;
    }

    // Evidence Collection
    if (jobOrder.evidence && jobOrder.evidence.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Evidence Collection', 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Evidence Items: ${jobOrder.evidence.length}`, 20, yPos);
      yPos += 6;

      jobOrder.evidence.forEach((item, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${index + 1}. ${item.fileName}`, 25, yPos);
        yPos += 5;
        doc.text(`   Type: ${item.type}, Category: ${item.category}`, 25, yPos);
        yPos += 5;
        if (item.description) {
          const desc = doc.splitTextToSize(`   Description: ${item.description}`, doc.internal.pageSize.getWidth() - 50);
          doc.text(desc, 25, yPos);
          yPos += desc.length * 5;
        }
        yPos += 3;
      });
      yPos += 5;
    }

    // Signatures
    if (jobOrder.signatures && jobOrder.signatures.length > 0) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Signatures Collected', 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      jobOrder.signatures.forEach((signature) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`Signer: ${signature.signerName}`, 20, yPos);
        yPos += 5;
        if (signature.signerRole) {
          doc.text(`Role: ${signature.signerRole}`, 20, yPos);
          yPos += 5;
        }
        doc.text(`Signed at: ${format(new Date(signature.signedAt), 'MMMM dd, yyyy hh:mm a')}`, 20, yPos);
        yPos += 8;
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Page ${i} of ${pageCount} | Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        'TOVE Leeds Compliance System',
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: 'center' }
      );
    }

    // Save PDF
    doc.save(`FIR_${jobOrder.id}_${format(new Date(), 'yyyyMMdd')}.pdf`);
  } catch (error) {
    console.error('Error generating FIR PDF:', error);
    alert('Error generating FIR PDF. Please try again.');
  }
};

/**
 * Export FTR (Final Test Report) for NDT department
 * Uses jsPDF library
 */
export const exportFTRAsPDF = async (jobOrder: JobOrder): Promise<void> => {
  try {
    // Dynamic import to avoid SSR issues
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    let yPos = 20;

    // Header
    doc.setFillColor(30, 60, 114); // Navy blue
    doc.rect(0, 0, doc.internal.pageSize.getWidth(), 30, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('FINAL TEST REPORT (FTR)', doc.internal.pageSize.getWidth() / 2, 15, {
      align: 'center',
    });

    doc.setFontSize(12);
    doc.text('NDT Department', doc.internal.pageSize.getWidth() / 2, 22, {
      align: 'center',
    });

    // Reset text color
    doc.setTextColor(0, 0, 0);
    yPos = 40;

    // Job Order Information
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Job Order Information', 20, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Job ID: ${jobOrder.id}`, 20, yPos);
    yPos += 6;
    doc.text(`Client: ${jobOrder.clientName}`, 20, yPos);
    yPos += 6;
    doc.text(`Location: ${jobOrder.location}`, 20, yPos);
    yPos += 6;
    doc.text(`Date: ${format(jobOrder.dateTime, 'MMMM dd, yyyy')}`, 20, yPos);
    yPos += 6;
    doc.text(`Inspector: ${jobOrder.assignedToName || 'N/A'}`, 20, yPos);
    yPos += 6;
    doc.text(`Service Types: ${jobOrder.serviceTypes.join(', ')}`, 20, yPos);
    yPos += 10;

    // Test Details (if reportData exists)
    if (jobOrder.reportData) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Test Details', 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const reportData = jobOrder.reportData;
      if (reportData.equipmentSerial) {
        doc.text(`Equipment Serial Number: ${reportData.equipmentSerial}`, 20, yPos);
        yPos += 6;
      }
      if (reportData.location) {
        doc.text(`Test Location: ${reportData.location}`, 20, yPos);
        yPos += 6;
      }
      if (reportData.safetyCheck) {
        doc.text(`Safety Check: ${reportData.safetyCheck}`, 20, yPos);
        yPos += 6;
      }
      if (reportData.loadTest) {
        doc.text(`Load Test Results: ${reportData.loadTest}`, 20, yPos);
        yPos += 6;
      }
      if (reportData.visualInspection) {
        doc.text(`Visual Inspection: ${reportData.visualInspection}`, 20, yPos);
        yPos += 6;
      }
      if (reportData.condition) {
        doc.text(`Test Condition: ${reportData.condition}`, 20, yPos);
        yPos += 6;
      }
      if (reportData.observations) {
        doc.text(`Test Observations:`, 20, yPos);
        yPos += 6;
        const observations = doc.splitTextToSize(reportData.observations, doc.internal.pageSize.getWidth() - 40);
        doc.text(observations, 20, yPos);
        yPos += observations.length * 6;
      }
      yPos += 5;
    }

    // Evidence Collection
    if (jobOrder.evidence && jobOrder.evidence.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Test Evidence', 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Evidence Items: ${jobOrder.evidence.length}`, 20, yPos);
      yPos += 6;

      jobOrder.evidence.forEach((item, index) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`${index + 1}. ${item.fileName}`, 25, yPos);
        yPos += 5;
        doc.text(`   Type: ${item.type}, Category: ${item.category}`, 25, yPos);
        yPos += 5;
        if (item.description) {
          const desc = doc.splitTextToSize(`   Description: ${item.description}`, doc.internal.pageSize.getWidth() - 50);
          doc.text(desc, 25, yPos);
          yPos += desc.length * 5;
        }
        yPos += 3;
      });
      yPos += 5;
    }

    // Signatures
    if (jobOrder.signatures && jobOrder.signatures.length > 0) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Signatures Collected', 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      jobOrder.signatures.forEach((signature) => {
        if (yPos > 250) {
          doc.addPage();
          yPos = 20;
        }
        doc.text(`Signer: ${signature.signerName}`, 20, yPos);
        yPos += 5;
        if (signature.signerRole) {
          doc.text(`Role: ${signature.signerRole}`, 20, yPos);
          yPos += 5;
        }
        doc.text(`Signed at: ${format(new Date(signature.signedAt), 'MMMM dd, yyyy hh:mm a')}`, 20, yPos);
        yPos += 8;
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(
        `Page ${i} of ${pageCount} | Generated on: ${format(new Date(), 'MMMM dd, yyyy HH:mm')}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      doc.text(
        'TOVE Leeds Compliance System',
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: 'center' }
      );
    }

    // Save PDF
    doc.save(`FTR_${jobOrder.id}_${format(new Date(), 'yyyyMMdd')}.pdf`);
  } catch (error) {
    console.error('Error generating FTR PDF:', error);
    alert('Error generating FTR PDF. Please try again.');
  }
};

/**
 * Determine which report type to generate based on service types
 */
export const getReportType = (jobOrder: JobOrder): 'FIR' | 'FTR' | null => {
  // Safe check - ensure serviceTypes exists and is an array
  if (!jobOrder || !jobOrder.serviceTypes || !Array.isArray(jobOrder.serviceTypes)) {
    return null;
  }
  
  // If NDT is in service types, generate FTR
  if (jobOrder.serviceTypes.includes('NDT')) {
    return 'FTR';
  }
  // If Inspection is in service types, generate FIR
  if (jobOrder.serviceTypes.includes('Inspection')) {
    return 'FIR';
  }
  // Default to FIR if no specific match
  return jobOrder.serviceTypes.length > 0 ? 'FIR' : null;
};

/**
 * Export appropriate report (FIR or FTR) based on job order service types
 */
export const exportReportAsPDF = async (jobOrder: JobOrder): Promise<void> => {
  const reportType = getReportType(jobOrder);
  
  if (!reportType) {
    alert('No report available for this job order. Service types must include Inspection or NDT.');
    return;
  }

  if (reportType === 'FIR') {
    await exportFIRAsPDF(jobOrder);
  } else if (reportType === 'FTR') {
    await exportFTRAsPDF(jobOrder);
  }
};

