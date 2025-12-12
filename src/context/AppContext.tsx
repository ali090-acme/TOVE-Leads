import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from 'react';
import {
  Client,
  JobOrder,
  JobOrderStatus,
  Certificate,
  Payment,
  TrainingSession,
  NDTReport,
  User,
  Notification,
} from '@/types';
import {
  mockClients,
  mockJobOrders,
  mockCertificates,
  mockPayments,
  mockTrainingSessions,
  mockNDTReports,
  mockUsers,
  mockNotifications,
} from '@/utils/mockData';
import { extractCertificateNumber } from '@/utils/verificationParser';
import { format } from 'date-fns';

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
  notifications: Notification[];

  // Actions
  setCurrentUser: (user: User | null) => void;
  setUsers: (users: User[]) => void;
  markNotificationAsRead: (notificationId: string) => void;
  
  // Certificate actions
  verifyCertificate: (certificateNumber: string) => Certificate | null;
  renewCertificate: (certificateId: string, documents: File[], notes: string) => boolean;
  
  // Job Order actions
  createJobOrder: (jobOrder: Omit<JobOrder, 'id' | 'createdAt' | 'updatedAt'>) => JobOrder | null;
  updateJobOrder: (jobOrderId: string, updates: Partial<JobOrder>) => boolean;
  assignJobOrder: (jobOrderId: string, userId: string) => boolean;
  submitJobOrderReport: (
    jobOrderId: string,
    reportData: any,
    photos: File[],
    signatures?: Array<{
      id: string;
      signerName: string;
      signerRole?: string;
      signatureData: string;
      signedAt: Date;
    }>
  ) => boolean;
  
  // Training Session actions
  createTrainingSession: (training: Omit<TrainingSession, 'id' | 'createdAt' | 'updatedAt'>) => boolean;
  updateTrainingSession: (sessionId: string, updates: Partial<TrainingSession>) => boolean;
  
  // Supervisor actions
  approveJobOrder: (jobOrderId: string) => boolean;
  rejectJobOrder: (jobOrderId: string, reason: string) => boolean;
  requestRevision: (jobOrderId: string, comments: string) => boolean;
  
  // Payment actions
  confirmPayment: (paymentId: string) => boolean;
  rejectPayment: (paymentId: string, reason: string) => boolean;
  
  // Certificate generation
  generateCertificate: (jobOrderId: string, format?: 'A4' | 'Card') => Certificate | null;
  generateTrainingCertificates: (trainingSessionId: string, format?: 'A4' | 'Card') => Certificate[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
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
        // Parse signatures dates if they exist
        signatures: jo.signatures?.map((sig: any) => ({
          ...sig,
          signedAt: new Date(sig.signedAt),
        })),
        // reportData is already JSON, no need to parse dates inside it
        reportData: jo.reportData,
        evidence: jo.evidence,
      }));
    }
    return mockJobOrders;
  });

  // Listen for jobOrdersUpdated event to reload from localStorage
  useEffect(() => {
    const handleJobOrdersUpdate = () => {
      const stored = localStorage.getItem('jobOrders');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const updated = parsed.map((jo: any) => ({
            ...jo,
            dateTime: new Date(jo.dateTime),
            createdAt: new Date(jo.createdAt),
            updatedAt: new Date(jo.updatedAt),
            signatures: jo.signatures?.map((sig: any) => ({
              ...sig,
              signedAt: new Date(sig.signedAt),
            })),
            reportData: jo.reportData,
            evidence: jo.evidence,
          }));
          setJobOrders(updated);
          console.log('AppContext - Reloaded jobOrders from localStorage:', updated.length, 'jobs');
        } catch (error) {
          console.error('Error reloading jobOrders from localStorage:', error);
        }
      }
    };
    
    window.addEventListener('jobOrdersUpdated', handleJobOrdersUpdate);
    return () => window.removeEventListener('jobOrdersUpdated', handleJobOrdersUpdate);
  }, []);

  // Create Job Order
  const createJobOrder = (
    jobOrderData: Omit<JobOrder, 'id' | 'createdAt' | 'updatedAt'>
  ): JobOrder | null => {
    try {
      // Get current job orders to calculate next ID
      const currentJobs = JSON.parse(localStorage.getItem('jobOrders') || '[]');
      
      // Create the new job order
      const newJobOrder: JobOrder = {
        ...jobOrderData,
        id: `JO-${new Date().getFullYear()}${String(currentJobs.length + 1).padStart(3, '0')}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Create notifications for supervisor and admin/manager BEFORE updating state
      // Find users with supervisor and manager roles
      const storedUsers = JSON.parse(localStorage.getItem('users') || '[]') as User[];
      const supervisorUsers = storedUsers.filter(u => 
        u.roles.includes('supervisor') || u.currentRole === 'supervisor'
      );
      const managerUsers = storedUsers.filter(u => 
        u.roles.includes('manager') || u.roles.includes('gm') || u.currentRole === 'manager'
      );
      
      const newNotifications: Notification[] = [];
      const now = new Date();
      const timestamp = Date.now();
      
      // Create notification for supervisor
      supervisorUsers.forEach((supervisor, index) => {
        newNotifications.push({
          id: `notif-${newJobOrder.id}-supervisor-${supervisor.id}-${timestamp}-${index}`,
          userId: supervisor.id,
          type: 'approval',
          title: 'New Service Request',
          message: `New service request ${newJobOrder.id} from ${newJobOrder.clientName} for ${newJobOrder.serviceTypes?.join(', ') || 'services'}`,
          read: false,
          createdAt: now,
          link: `/supervisor/approvals/${newJobOrder.id}`,
        });
      });
      
      // Create notification for manager/admin
      managerUsers.forEach((manager, index) => {
        newNotifications.push({
          id: `notif-${newJobOrder.id}-manager-${manager.id}-${timestamp}-${index}`,
          userId: manager.id,
          type: 'approval',
          title: 'New Service Request',
          message: `New service request ${newJobOrder.id} from ${newJobOrder.clientName} for ${newJobOrder.serviceTypes?.join(', ') || 'services'}`,
          read: false,
          createdAt: now,
          link: `/supervisor/approvals/${newJobOrder.id}`, // Manager can also view via supervisor route
        });
      });
      
      // Add notifications to state
      if (newNotifications.length > 0) {
        setAllNotifications((prev) => {
          const updated = [...prev, ...newNotifications];
          localStorage.setItem('notifications', JSON.stringify(updated));
          console.log('✅ Created notifications for supervisor and manager:', newNotifications.length);
        return updated;
      });
      }

      // Get current job orders from localStorage (most up-to-date source)
      const currentJobOrdersFromStorage = JSON.parse(localStorage.getItem('jobOrders') || '[]');
      const updatedJobOrders = [...currentJobOrdersFromStorage, newJobOrder];
      
      // Save to localStorage FIRST (synchronously)
      try {
        localStorage.setItem('jobOrders', JSON.stringify(updatedJobOrders));
        console.log('✅ Job order created and saved:', {
          id: newJobOrder.id,
          status: newJobOrder.status,
          clientName: newJobOrder.clientName,
          totalJobs: updatedJobOrders.length
        });
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
      
      // Update state
      setJobOrders(updatedJobOrders);
      
      // Dispatch custom event AFTER state and localStorage are updated
      // Also dispatch a notifications update event
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('jobOrdersUpdated'));
        window.dispatchEvent(new CustomEvent('notificationsUpdated'));
        console.log('📢 jobOrdersUpdated and notificationsUpdated events dispatched');
      }, 50); // Small delay to ensure state update is processed
      
      return newJobOrder;
    } catch (error) {
      console.error('Error creating job order:', error);
      return null;
    }
  };

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

  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>(() => {
    const stored = localStorage.getItem('trainingSessions');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((ts: any) => ({
        ...ts,
        scheduledDateTime: new Date(ts.scheduledDateTime),
        createdAt: ts.createdAt ? new Date(ts.createdAt) : new Date(),
        updatedAt: ts.updatedAt ? new Date(ts.updatedAt) : new Date(),
      }));
    }
    return mockTrainingSessions.map((ts) => ({
      ...ts,
      jobOrderId: ts.jobOrderId || '', // Add jobOrderId if missing in mock data
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
  });

  // Save training sessions to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('trainingSessions', JSON.stringify(trainingSessions));
  }, [trainingSessions]);

  const [ndtReports] = useState<NDTReport[]>(() => {
    const stored = localStorage.getItem('ndtReports');
    return stored ? JSON.parse(stored) : mockNDTReports;
  });

  const [users, setUsers] = useState<User[]>(() => {
    const stored = localStorage.getItem('users');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Verify we have all required users, especially user-6 (admin/manager)
        const hasUser6 = parsed.some((u: User) => u.id === 'user-6');
        if (!hasUser6) {
          console.warn('⚠️ AppContext: user-6 (admin/manager) not found in localStorage users. Reinitializing with mockUsers.');
          localStorage.setItem('users', JSON.stringify(mockUsers));
          return mockUsers;
        }
        console.log('✅ AppContext: Loaded users from localStorage. Total:', parsed.length, 'Has user-6:', hasUser6);
        return parsed;
      } catch (e) {
        console.error('❌ AppContext: Error parsing users from localStorage:', e);
        console.log('🔄 AppContext: Reinitializing users with mockUsers.');
        localStorage.setItem('users', JSON.stringify(mockUsers));
        return mockUsers;
      }
    }
    console.log('📝 AppContext: No users in localStorage. Initializing with mockUsers.');
    localStorage.setItem('users', JSON.stringify(mockUsers));
    return mockUsers;
  });

  // Notifications - filter by current user
  const [allNotifications, setAllNotifications] = useState<Notification[]>(() => {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.map((n: any) => ({
        ...n,
        createdAt: new Date(n.createdAt),
      }));
    }
    const initial = mockNotifications.map((n) => ({
      ...n,
      createdAt: new Date(n.createdAt),
    }));
    // Save to localStorage
    localStorage.setItem('notifications', JSON.stringify(initial));
    return initial;
  });

  // Save notifications to localStorage
  useEffect(() => {
    localStorage.setItem('notifications', JSON.stringify(allNotifications));
  }, [allNotifications]);

  // Sync users to localStorage
  // But check if localStorage was updated externally first to avoid overwriting
  useEffect(() => {
    const stored = localStorage.getItem('users');
    if (!stored) {
      // No localStorage data, save current state
      localStorage.setItem('users', JSON.stringify(users));
      window.dispatchEvent(new Event('usersUpdated'));
      return;
    }

    try {
      const storedUsers = JSON.parse(stored) as User[];
      const storedIds = new Set<string>(storedUsers.map((u: User) => u.id));
      const currentIds = new Set<string>(users.map((u) => u.id));
      
      // If localStorage has more users, it was updated externally (e.g., by UserManagement)
      // Sync from localStorage instead of overwriting
      if (storedUsers.length > users.length) {
        setUsers(storedUsers);
        return;
      }
      
      // If localStorage has different users (new IDs), sync from localStorage
      const hasNewUsers = Array.from(storedIds).some((id) => !currentIds.has(id));
      if (hasNewUsers && storedUsers.length >= users.length) {
        setUsers(storedUsers);
        return;
      }
      
      // Otherwise, sync our state to localStorage
      const currentStr = JSON.stringify(users);
      if (stored !== currentStr) {
        localStorage.setItem('users', currentStr);
      }
      window.dispatchEvent(new Event('usersUpdated'));
    } catch (e) {
      console.error('Failed to sync users to localStorage', e);
    }
  }, [users]);

  // Listen for users updates from other components
  useEffect(() => {
    const handleUsersUpdate = () => {
      console.log('🔄 usersUpdated event received, reloading...');
      const stored = localStorage.getItem('users');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setUsers(parsed);
          console.log('✅ AppContext: Users updated from localStorage, count:', parsed.length);
          
          // CRITICAL: Update currentUser if it was modified
          const storedCurrentUser = localStorage.getItem('currentUser');
          if (storedCurrentUser) {
            const currentUserData = JSON.parse(storedCurrentUser);
            const updatedCurrentUser = parsed.find((u: User) => u.id === currentUserData.id);
            if (updatedCurrentUser) {
              console.log('✅ AppContext: Updating currentUser with latest permissions:', {
                userId: updatedCurrentUser.id,
                name: updatedCurrentUser.name,
                permissions: updatedCurrentUser.permissions
              });
              localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
              setCurrentUserState(updatedCurrentUser);
              
              // Force re-render by dispatching another event
              setTimeout(() => {
                window.dispatchEvent(new Event('currentUserUpdated'));
              }, 100);
            }
          }
        } catch (e) {
          console.error('❌ Failed to parse users from localStorage', e);
        }
      }
    };

    window.addEventListener('usersUpdated', handleUsersUpdate);
    window.addEventListener('storage', handleUsersUpdate);

    return () => {
      window.removeEventListener('usersUpdated', handleUsersUpdate);
      window.removeEventListener('storage', handleUsersUpdate);
    };
  }, []);

  // Load currentUser from localStorage on init, then sync with users array
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const stored = localStorage.getItem('currentUser');
    console.log('🔍 AppContext: Loading currentUser from localStorage. Raw data:', stored ? 'EXISTS' : 'NOT FOUND');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        console.log('📥 AppContext: Parsed currentUser:', {
          name: parsed?.name,
          id: parsed?.id,
          currentRole: parsed?.currentRole,
          email: parsed?.email
        });
        
        // Try to sync with users array if available (for initial load only)
        // IMPORTANT: Only sync if userId matches exactly - prevents loading wrong user's data
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) {
          try {
            const usersArray = JSON.parse(storedUsers) as User[];
            const updatedUser = usersArray.find((u) => u.id === parsed.id);
            if (updatedUser && updatedUser.id === parsed.id && updatedUser.id === parsed.id) { // Triple check userId matches
              // Merge with latest data from users array (especially region/team)
              // IMPORTANT: Preserve currentRole from parsed (set during login), don't override it
              const preservedCurrentRole = parsed.currentRole;
              const syncedUser = {
                ...updatedUser, // Start with latest user data
                currentRole: preservedCurrentRole, // Preserve the role set during login
                // Keep any other session-specific data from parsed
              };
              console.log(' AppContext: Synced currentUser with users array on init. User:', syncedUser.name, 'ID:', syncedUser.id, 'Role:', syncedUser.currentRole, 'Region:', syncedUser.regionId, 'Team:', syncedUser.teamId);
              // Verify the sync didn't corrupt the data
              if (syncedUser.id !== parsed.id) {
                console.error('❌ AppContext: CRITICAL - User ID mismatch after sync! Expected:', parsed.id, 'Got:', syncedUser.id);
                return parsed; // Return original if sync corrupted data
              }
              // Save synced version back to localStorage
              localStorage.setItem('currentUser', JSON.stringify(syncedUser));
              return syncedUser;
            } else {
              console.warn(' AppContext: User ID mismatch or user not found in users array. Parsed User ID:', parsed.id, 'Found User ID:', updatedUser?.id);
              // Return parsed as-is if we can't sync (better than wrong data)
        return parsed;
            }
      } catch (e) {
            console.error(' AppContext: Error syncing currentUser with users array:', e);
            // Return parsed as-is if sync fails
            return parsed;
          }
        }
        
        return parsed;
      } catch (e) {
        console.error(' AppContext: Error parsing currentUser from localStorage:', e);
        return null;
      }
    }
    console.log(' AppContext: No currentUser found in localStorage');
    return null;
  });
  
  // Wrapper to persist currentUser to localStorage
  // IMPORTANT: This is called during login - do NOT sync here, just save the user as-is
  const setCurrentUser = (user: User | null) => {
    console.log('🔐 AppContext: setCurrentUser called. New user:', {
      name: user?.name,
      id: user?.id,
      currentRole: user?.currentRole,
      email: user?.email
    });
    
    // CRITICAL: Clear old state first to force re-render
    setCurrentUserState(null);
    
    if (user) {
      // Verify user data is complete
      if (!user.id || !user.name) {
        console.error('❌ AppContext: Invalid user data! Missing id or name:', user);
        return;
      }
      
      // Save user directly without syncing - login sets the correct user and role
      localStorage.setItem('currentUser', JSON.stringify(user));
      console.log('💾 AppContext: Saved currentUser to localStorage:', user.name, user.id, user.currentRole);
      
      // Set state AFTER saving to localStorage to ensure consistency
      // Use setTimeout to ensure localStorage write completes first
      setTimeout(() => {
        setCurrentUserState(user);
        console.log('✅ AppContext: currentUser state updated:', user.name, user.id, user.currentRole);
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('currentUserUpdated', { detail: user }));
      }, 0);
    } else {
      localStorage.removeItem('currentUser');
      console.log('🗑️ AppContext: Removed currentUser from localStorage');
      setCurrentUserState(null);
    }
  };

  // Filter notifications for current user (must be after currentUser declaration)
  const notifications = useMemo(() => {
    if (!currentUser) return [];
    return allNotifications.filter(n => n.userId === currentUser.id);
  }, [allNotifications, currentUser]);

  // Mark notification as read
  const markNotificationAsRead = (notificationId: string) => {
    setAllNotifications((prev) => {
      const updated = prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      );
      localStorage.setItem('notifications', JSON.stringify(updated));
      return updated;
    });
  };

  // Sync currentUser with users array when users are updated (e.g., region/team assigned)
  // IMPORTANT: Only sync if userId matches - prevents wrong user data from being loaded
  useEffect(() => {
    if (currentUser && users.length > 0) {
      const updatedUser = users.find((u) => u.id === currentUser.id);
      if (updatedUser && updatedUser.id === currentUser.id) { // Double check userId matches
        // Always sync to ensure currentUser has latest data (especially region/team)
        // Check if any important fields have changed
        const needsSync = 
          updatedUser.regionId !== currentUser.regionId ||
          updatedUser.teamId !== currentUser.teamId ||
          updatedUser.name !== currentUser.name ||
          updatedUser.email !== currentUser.email ||
          JSON.stringify(updatedUser.roles) !== JSON.stringify(currentUser.roles);
        
        if (needsSync) {
          console.log(' AppContext: Syncing currentUser with updated user data. User:', currentUser.name, 'ID:', currentUser.id, 'Old Region:', currentUser.regionId, 'New Region:', updatedUser.regionId);
          // IMPORTANT: Preserve currentRole from currentUser (set during login), don't override it
          const preservedCurrentRole = currentUser.currentRole;
          const syncedUser: User = {
            ...updatedUser, // Start with latest user data
            currentRole: preservedCurrentRole, // Preserve the role set during login
            // Keep any other session-specific data from currentUser
          };
          console.log(' AppContext: Preserved currentRole:', preservedCurrentRole, 'for user:', syncedUser.name, 'ID:', syncedUser.id);
          // Use setCurrentUserState directly to avoid triggering this effect again
          setCurrentUserState(syncedUser);
          localStorage.setItem('currentUser', JSON.stringify(syncedUser));
        }
      } else {
        // User not found in users array or ID mismatch - might have been deleted or wrong user
        console.warn(' AppContext: currentUser not found in users array or ID mismatch. Current User ID:', currentUser.id, 'Expected to find user with same ID.');
      }
    }
  }, [users, currentUser?.id]); // Sync whenever users array changes or currentUser ID changes

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
  const verifyCertificate = (certificateNumberOrCode: string): Certificate | null => {
    // Extract certificate number from input (handles both certificate numbers and three-part codes)
    const certificateNumber = extractCertificateNumber(certificateNumberOrCode) || certificateNumberOrCode;
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
      setJobOrders((prev) => {
        const updated = prev.map((jo) =>
          jo.id === jobOrderId
            ? { ...jo, ...updates, updatedAt: new Date() }
            : jo
        );
        // Save to localStorage
        localStorage.setItem('jobOrders', JSON.stringify(updated));
        // Dispatch event
        setTimeout(() => window.dispatchEvent(new CustomEvent('jobOrdersUpdated')), 0);
        return updated;
      });
      return true;
    } catch (error) {
      console.error('Error updating job order:', error);
      return false;
    }
  };

  // Assign Job Order to a user (inspector, trainer, etc.)
  const assignJobOrder = (jobOrderId: string, userId: string): boolean => {
    try {
      const assignedUser = users.find(u => u.id === userId);
      if (!assignedUser) {
        console.error('User not found for assignment');
        return false;
      }

      const jobOrder = jobOrders.find(jo => jo.id === jobOrderId);
      if (!jobOrder) {
        console.error('Job order not found');
        return false;
      }

      // Update job order with assignment
      setJobOrders((prev) => {
        const updated = prev.map((jo) =>
          jo.id === jobOrderId
            ? {
                ...jo,
                assignedTo: userId,
                assignedToName: assignedUser.name,
                status: 'In Progress' as JobOrderStatus, // Change status to In Progress when assigned
                updatedAt: new Date(),
              }
            : jo
        );
        // Save to localStorage
        localStorage.setItem('jobOrders', JSON.stringify(updated));
        
        // Create notification for assigned user
        const newNotification: Notification = {
          id: `notif-assign-${jobOrderId}-${userId}-${Date.now()}`,
          userId: userId,
          type: 'assignment',
          title: 'Job Assigned',
          message: `Job order ${jobOrderId} has been assigned to you. Client: ${jobOrder.clientName}`,
          read: false,
          createdAt: new Date(),
          link: `/inspector/jobs/${jobOrderId}`,
        };

        // Add notification
        setAllNotifications((prev) => {
          const updatedNotifications = [...prev, newNotification];
          localStorage.setItem('notifications', JSON.stringify(updatedNotifications));
          return updatedNotifications;
        });

        // Dispatch events
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('jobOrdersUpdated'));
          window.dispatchEvent(new CustomEvent('notificationsUpdated'));
          console.log('✅ Job assigned and notification created');
        }, 50);

        return updated;
      });
      return true;
    } catch (error) {
      console.error('Error assigning job order:', error);
      return false;
    }
  };

  // Submit Job Order Report
  const submitJobOrderReport = (
    jobOrderId: string,
    reportData: any,
    photos: File[],
    signatures?: Array<{
      id: string;
      signerName: string;
      signerRole?: string;
      signatureData: string;
      signedAt: Date;
    }>
  ): boolean => {
    try {
      // Update job order status to Completed and save all report data
      setJobOrders((prev) => {
        const updated = prev.map((jo) =>
          jo.id === jobOrderId
            ? {
                ...jo,
                status: 'Completed' as JobOrderStatus,
                reportData: reportData, // Save form data and evidence metadata
                signatures: signatures || [],
                evidence: reportData?.evidence || [], // Save evidence metadata
                updatedAt: new Date(),
              }
            : jo
        );
        
        // Save to localStorage for persistence
        localStorage.setItem('jobOrders', JSON.stringify(updated));
        
        return updated;
      });

      console.log('Report submitted:', {
        jobOrderId,
        reportData,
        photos: photos.map((p) => p.name),
        signatures: signatures?.length || 0,
      });

      return true;
    } catch (error) {
      console.error('Error submitting report:', error);
      return false;
    }
  };

  // Approve Job Order - useCallback to prevent recreation
  const approveJobOrder = useCallback((jobOrderId: string): boolean => {
    try {
      setJobOrders((prev) => {
        const jobOrder = prev.find(jo => jo.id === jobOrderId);
        const isReportApproval = jobOrder?.status === 'Completed' && jobOrder?.reportData;
        
        const updated = prev.map((jo) =>
          jo.id === jobOrderId
            ? {
                ...jo,
                // If approving a report (Completed status with reportData), change to Approved
                // If approving a job order (Pending status), change to In Progress (so inspector can execute)
                status: isReportApproval ? ('Approved' as const) : ('In Progress' as const),
                updatedAt: new Date(),
              }
            : jo
      );
        // Save to localStorage
        localStorage.setItem('jobOrders', JSON.stringify(updated));
        console.log('✅ Job order approved:', jobOrderId, 'Status:', isReportApproval ? 'Approved' : 'In Progress');
        // Dispatch custom event to notify components
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('jobOrdersUpdated'));
          console.log('📢 jobOrdersUpdated event dispatched after approval');
        }, 0);
        return updated;
      });
      return true;
    } catch (error) {
      console.error('Error approving job order:', error);
      return false;
    }
  }, []);

  // Reject Job Order
  const rejectJobOrder = (jobOrderId: string, reason: string): boolean => {
    try {
      setJobOrders((prev) => {
        const updated = prev.map((jo) =>
          jo.id === jobOrderId
            ? {
                ...jo,
                status: 'Pending' as JobOrderStatus,
                updatedAt: new Date(),
              }
            : jo
        );
        // Save to localStorage
        localStorage.setItem('jobOrders', JSON.stringify(updated));
        console.log('❌ Job order rejected:', { jobOrderId, reason });
        // Dispatch event
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('jobOrdersUpdated'));
          console.log('📢 jobOrdersUpdated event dispatched after rejection');
        }, 0);
        return updated;
      });
      return true;
    } catch (error) {
      console.error('Error rejecting job order:', error);
      return false;
    }
  };

  // Request Revision
  const requestRevision = (jobOrderId: string, comments: string): boolean => {
    try {
      setJobOrders((prev) => {
        const updated = prev.map((jo) =>
          jo.id === jobOrderId
            ? {
                ...jo,
                status: 'In Progress' as JobOrderStatus, // Changed from Completed to In Progress for revision
                revisionComments: comments, // Store revision comments
                revisionRequestedAt: new Date(),
                updatedAt: new Date(),
              }
            : jo
        );
        // Save to localStorage
        localStorage.setItem('jobOrders', JSON.stringify(updated));
        console.log('🔄 Revision requested:', { jobOrderId, comments });
        // Dispatch event
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('jobOrdersUpdated'));
          console.log('📢 jobOrdersUpdated event dispatched after revision request');
        }, 0);
        return updated;
      });
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
  const generateCertificate = (jobOrderId: string, format?: 'A4' | 'Card'): Certificate | null => {
    try {
      const jobOrder = jobOrders.find((jo) => jo.id === jobOrderId);
      if (!jobOrder) return null;

      // Check if certificate already exists (for this job order and format)
      const certFormat = format || 'A4';
      const existingCert = certificates.find((c) => c.jobOrderId === jobOrderId && c.certificateFormat === certFormat);
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
        serviceType: jobOrder.serviceTypes[0] || 'Inspection', // Use first service type for certificate
        issueDate: new Date(),
        expiryDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1)
        ), // 1 year validity
        verificationCode: verificationCode,
        documentNumber: docNumber,
        stickerNumber: stickerNumber,
        documentType: 'Digital',
        certificateFormat: certFormat, // A4 is mandatory/default, Card is optional
        status: 'Valid',
      };

      setCertificates((prev) => [...prev, newCertificate]);
      return newCertificate;
    } catch (error) {
      console.error('Error generating certificate:', error);
      return null;
    }
  };

  // Create Training Session
  const createTrainingSession = (
    trainingData: Omit<TrainingSession, 'id' | 'createdAt' | 'updatedAt'>
  ): boolean => {
    try {
      const newTraining: TrainingSession = {
        ...trainingData,
        id: `train-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      setTrainingSessions((prev) => [...prev, newTraining]);
      return true;
    } catch (error) {
      console.error('Error creating training session:', error);
      return false;
    }
  };

  // Update Training Session
  const updateTrainingSession = (sessionId: string, updates: Partial<TrainingSession>): boolean => {
    try {
      setTrainingSessions((prev) =>
        prev.map((ts) => {
          if (ts.id === sessionId) {
            const updated = {
              ...ts,
              ...updates,
              updatedAt: new Date(),
            };
            
            // If training session is approved, automatically generate certificates for participants who passed
            if (updates.approvalStatus === 'Approved' && ts.approvalStatus !== 'Approved') {
              // Generate A4 certificates (mandatory) for all passed participants
              generateTrainingCertificates(sessionId, 'A4');
            }
            
            return updated;
          }
          return ts;
        })
      );
      // Dispatch custom event to notify components
      setTimeout(() => window.dispatchEvent(new CustomEvent('trainingSessionsUpdated')), 0);
      return true;
    } catch (error) {
      console.error('Error updating training session:', error);
      return false;
    }
  };

  // Generate Certificates for Training Participants (who passed)
  const generateTrainingCertificates = (trainingSessionId: string, format: 'A4' | 'Card' = 'A4'): Certificate[] => {
    try {
      const session = trainingSessions.find((ts) => ts.id === trainingSessionId);
      if (!session) return [];

      // Get participants who passed the assessment
      const passedParticipants = session.assessmentResults
        .filter((ar) => ar.outcome === 'Pass')
        .map((ar) => {
          const participant = session.attendanceList.find((p) => p.id === ar.participantId);
          return {
            participantId: ar.participantId,
            participantName: ar.participantName || participant?.name || 'Unknown',
          };
        });

      // Generate certificates for each passed participant
      const newCertificates: Certificate[] = passedParticipants.map((participant, index) => {
        const certNumber = `CERT-TRAIN-${new Date().getFullYear()}-${String(
          certificates.length + index + 1
        ).padStart(3, '0')}`;
        const docNumber = `DOC-${String(certificates.length + index + 1).padStart(3, '0')}`;
        const stickerNumber = `STK-${String(certificates.length + index + 1).padStart(3, '0')}`;
        const verificationCode = `${docNumber}-${stickerNumber}-${certNumber}`;

        return {
          id: `cert-train-${Date.now()}-${index}`,
          certificateNumber: certNumber,
          trainingSessionId: session.id,
          jobOrderId: session.jobOrderId,
          participantId: participant.participantId,
          participantName: participant.participantName,
          clientId: session.clientId,
          clientName: '', // Will be filled from job order if available
          serviceType: 'Training',
          issueDate: new Date(),
          expiryDate: new Date(
            new Date().setFullYear(new Date().getFullYear() + 1)
          ), // 1 year validity
          verificationCode: verificationCode,
          documentNumber: docNumber,
          stickerNumber: stickerNumber,
          documentType: 'Digital',
          certificateFormat: format, // A4 (mandatory/default) or Card (optional)
          status: 'Valid',
        };
      });

      // Get client name from job order if available
      if (session.jobOrderId) {
        const jobOrder = jobOrders.find((jo) => jo.id === session.jobOrderId);
        if (jobOrder) {
          newCertificates.forEach((cert) => {
            cert.clientId = jobOrder.clientId;
            cert.clientName = jobOrder.clientName;
          });
        }
      }

      setCertificates((prev) => [...prev, ...newCertificates]);
      return newCertificates;
    } catch (error) {
      console.error('Error generating training certificates:', error);
      return [];
    }
  };

  // Context value - memoize to ensure re-renders when state changes
  // Only include state values in dependencies, not functions
  const value: AppContextType = useMemo(() => ({
    clients,
    jobOrders,
    certificates,
    payments,
    trainingSessions,
    ndtReports,
    users,
    currentUser,
    notifications,
    setCurrentUser,
    setUsers,
    markNotificationAsRead,
    verifyCertificate,
    renewCertificate,
    createJobOrder,
    updateJobOrder,
    assignJobOrder,
    submitJobOrderReport,
    approveJobOrder,
    rejectJobOrder,
    requestRevision,
    confirmPayment,
    rejectPayment,
    generateCertificate,
    createTrainingSession,
    updateTrainingSession,
    generateTrainingCertificates,
  }), [
    jobOrders, // When jobOrders changes, context value updates -> triggers re-renders
    certificates,
    payments,
    trainingSessions,
    users,
    currentUser,
    notifications,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};




