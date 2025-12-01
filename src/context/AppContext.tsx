import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Client,
  JobOrder,
  Certificate,
  Payment,
  TrainingSession,
  NDTReport,
  User,
} from '@/types';
import {
  mockClients,
  mockJobOrders,
  mockCertificates,
  mockPayments,
  mockTrainingSessions,
  mockNDTReports,
  mockUsers,
} from '@/utils/mockData';

interface AppContextType {
  // Data
  clients: Client[];
  jobOrders: JobOrder[];
  certificates: Certificate[];
  payments: Payment[];
  trainingSessions: TrainingSession[];
  ndtReports: NDTReport[];
  users: User[];
  currentUser: User | null;

  // Actions
  setCurrentUser: (user: User | null) => void;
  
  // Certificate actions
  verifyCertificate: (certificateNumber: string) => Certificate | null;
  renewCertificate: (certificateId: string, documents: File[], notes: string) => boolean;
  
  // Job Order actions
  updateJobOrder: (jobOrderId: string, updates: Partial<JobOrder>) => boolean;
  submitJobOrderReport: (
    jobOrderId: string,
    reportData: any,
    photos: File[]
  ) => boolean;
  
  // Supervisor actions
  approveJobOrder: (jobOrderId: string) => boolean;
  rejectJobOrder: (jobOrderId: string, reason: string) => boolean;
  requestRevision: (jobOrderId: string, comments: string) => boolean;
  
  // Payment actions
  confirmPayment: (paymentId: string) => boolean;
  rejectPayment: (paymentId: string, reason: string) => boolean;
  
  // Certificate generation
  generateCertificate: (jobOrderId: string) => Certificate | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  // Load data from localStorage or use mock data
  const [clients] = useState<Client[]>(() => {
    const stored = localStorage.getItem('clients');
    return stored ? JSON.parse(stored) : mockClients;
  });

  const [jobOrders, setJobOrders] = useState<JobOrder[]>(() => {
    const stored = localStorage.getItem('jobOrders');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return parsed.map((jo: any) => ({
        ...jo,
        dateTime: new Date(jo.dateTime),
        createdAt: new Date(jo.createdAt),
        updatedAt: new Date(jo.updatedAt),
      }));
    }
    return mockJobOrders;
  });

  const [certificates, setCertificates] = useState<Certificate[]>(() => {
    const stored = localStorage.getItem('certificates');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((cert: any) => ({
        ...cert,
        issueDate: new Date(cert.issueDate),
        expiryDate: new Date(cert.expiryDate),
      }));
    }
    return mockCertificates;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const stored = localStorage.getItem('payments');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
        confirmedAt: p.confirmedAt ? new Date(p.confirmedAt) : undefined,
      }));
    }
    return mockPayments;
  });

  const [trainingSessions] = useState<TrainingSession[]>(() => {
    const stored = localStorage.getItem('trainingSessions');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((ts: any) => ({
        ...ts,
        scheduledDateTime: new Date(ts.scheduledDateTime),
      }));
    }
    return mockTrainingSessions;
  });

  const [ndtReports] = useState<NDTReport[]>(() => {
    const stored = localStorage.getItem('ndtReports');
    return stored ? JSON.parse(stored) : mockNDTReports;
  });

  const [users] = useState<User[]>(() => {
    const stored = localStorage.getItem('users');
    return stored ? JSON.parse(stored) : mockUsers;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Persist data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('jobOrders', JSON.stringify(jobOrders));
  }, [jobOrders]);

  useEffect(() => {
    localStorage.setItem('certificates', JSON.stringify(certificates));
  }, [certificates]);

  useEffect(() => {
    localStorage.setItem('payments', JSON.stringify(payments));
  }, [payments]);

  // Certificate Verification
  const verifyCertificate = (certificateNumber: string): Certificate | null => {
    const cert = certificates.find(
      (c) =>
        c.certificateNumber.toLowerCase() === certificateNumber.toLowerCase() ||
        c.verificationCode.toLowerCase() === certificateNumber.toLowerCase()
    );

    if (!cert) return null;

    // Update status based on expiry
    const now = new Date();
    if (cert.expiryDate < now && cert.status !== 'Expired') {
      const updatedCert = { ...cert, status: 'Expired' as const };
      setCertificates((prev) =>
        prev.map((c) => (c.id === cert.id ? updatedCert : c))
      );
      return updatedCert;
    }

    return cert;
  };

  // Certificate Renewal
  const renewCertificate = (
    certificateId: string,
    documents: File[],
    notes: string
  ): boolean => {
    try {
      const cert = certificates.find((c) => c.id === certificateId);
      if (!cert) return false;

      // In a real app, this would upload documents and create a renewal request
      console.log('Renewal requested:', {
        certificateId,
        documents: documents.map((d) => d.name),
        notes,
      });

      // Create a notification or approval request (simplified for demo)
      return true;
    } catch (error) {
      console.error('Error renewing certificate:', error);
      return false;
    }
  };

  // Update Job Order
  const updateJobOrder = (
    jobOrderId: string,
    updates: Partial<JobOrder>
  ): boolean => {
    try {
      setJobOrders((prev) =>
        prev.map((jo) =>
          jo.id === jobOrderId
            ? { ...jo, ...updates, updatedAt: new Date() }
            : jo
        )
      );
      return true;
    } catch (error) {
      console.error('Error updating job order:', error);
      return false;
    }
  };

  // Submit Job Order Report
  const submitJobOrderReport = (
    jobOrderId: string,
    reportData: any,
    photos: File[]
  ): boolean => {
    try {
      // Update job order status to Completed
      setJobOrders((prev) =>
        prev.map((jo) =>
          jo.id === jobOrderId
            ? {
                ...jo,
                status: 'Completed',
                updatedAt: new Date(),
              }
            : jo
        )
      );

      console.log('Report submitted:', {
        jobOrderId,
        reportData,
        photos: photos.map((p) => p.name),
      });

      return true;
    } catch (error) {
      console.error('Error submitting report:', error);
      return false;
    }
  };

  // Approve Job Order
  const approveJobOrder = (jobOrderId: string): boolean => {
    try {
      setJobOrders((prev) =>
        prev.map((jo) =>
          jo.id === jobOrderId
            ? {
                ...jo,
                status: 'Approved',
                updatedAt: new Date(),
              }
            : jo
        )
      );
      return true;
    } catch (error) {
      console.error('Error approving job order:', error);
      return false;
    }
  };

  // Reject Job Order
  const rejectJobOrder = (jobOrderId: string, reason: string): boolean => {
    try {
      setJobOrders((prev) =>
        prev.map((jo) =>
          jo.id === jobOrderId
            ? {
                ...jo,
                status: 'Pending',
                updatedAt: new Date(),
              }
            : jo
        )
      );

      console.log('Job order rejected:', { jobOrderId, reason });
      return true;
    } catch (error) {
      console.error('Error rejecting job order:', error);
      return false;
    }
  };

  // Request Revision
  const requestRevision = (jobOrderId: string, comments: string): boolean => {
    try {
      setJobOrders((prev) =>
        prev.map((jo) =>
          jo.id === jobOrderId
            ? {
                ...jo,
                status: 'Pending',
                updatedAt: new Date(),
              }
            : jo
        )
      );

      console.log('Revision requested:', { jobOrderId, comments });
      return true;
    } catch (error) {
      console.error('Error requesting revision:', error);
      return false;
    }
  };

  // Confirm Payment
  const confirmPayment = (paymentId: string): boolean => {
    try {
      const payment = payments.find((p) => p.id === paymentId);
      if (!payment) return false;

      // Update payment status
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? {
                ...p,
                status: 'Confirmed',
                confirmedBy: currentUser?.id,
                confirmedAt: new Date(),
              }
            : p
        )
      );

      // Update job order to Paid
      setJobOrders((prev) =>
        prev.map((jo) =>
          jo.id === payment.jobOrderId
            ? {
                ...jo,
                paymentStatus: 'Confirmed',
                status: 'Paid',
                updatedAt: new Date(),
              }
            : jo
        )
      );

      // Generate certificate
      generateCertificate(payment.jobOrderId);

      return true;
    } catch (error) {
      console.error('Error confirming payment:', error);
      return false;
    }
  };

  // Reject Payment
  const rejectPayment = (paymentId: string, reason: string): boolean => {
    try {
      setPayments((prev) =>
        prev.map((p) =>
          p.id === paymentId
            ? {
                ...p,
                status: 'Failed',
              }
            : p
        )
      );

      console.log('Payment rejected:', { paymentId, reason });
      return true;
    } catch (error) {
      console.error('Error rejecting payment:', error);
      return false;
    }
  };

  // Generate Certificate
  const generateCertificate = (jobOrderId: string): Certificate | null => {
    try {
      const jobOrder = jobOrders.find((jo) => jo.id === jobOrderId);
      if (!jobOrder) return null;

      // Check if certificate already exists
      const existingCert = certificates.find((c) => c.jobOrderId === jobOrderId);
      if (existingCert) return existingCert;

      // Generate new certificate
      const certNumber = `CERT-${new Date().getFullYear()}-${String(
        certificates.length + 1
      ).padStart(3, '0')}`;
      const docNumber = `DOC-${String(certificates.length + 1).padStart(3, '0')}`;
      const stickerNumber = `STK-${String(certificates.length + 1).padStart(
        3,
        '0'
      )}`;
      const verificationCode = `${docNumber}-${stickerNumber}-${certNumber}`;

      const newCertificate: Certificate = {
        id: `cert-${Date.now()}`,
        certificateNumber: certNumber,
        jobOrderId: jobOrder.id,
        clientId: jobOrder.clientId,
        clientName: jobOrder.clientName,
        serviceType: jobOrder.serviceType,
        issueDate: new Date(),
        expiryDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        ), // 1 year validity
        verificationCode: verificationCode,
        documentNumber: docNumber,
        stickerNumber: stickerNumber,
        documentType: 'Digital',
        status: 'Valid',
      };

      setCertificates((prev) => [...prev, newCertificate]);
      return newCertificate;
    } catch (error) {
      console.error('Error generating certificate:', error);
      return null;
    }
  };

  const value: AppContextType = {
    clients,
    jobOrders,
    certificates,
    payments,
    trainingSessions,
    ndtReports,
    users,
    currentUser,
    setCurrentUser,
    verifyCertificate,
    renewCertificate,
    updateJobOrder,
    submitJobOrderReport,
    approveJobOrder,
    rejectJobOrder,
    requestRevision,
    confirmPayment,
    rejectPayment,
    generateCertificate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};




