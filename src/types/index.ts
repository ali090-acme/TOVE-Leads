// User Roles
export type UserRole = 
  | 'client' 
  | 'inspector' 
  | 'trainer' 
  | 'supervisor' 
  | 'accountant' 
  | 'manager' 
  | 'gm';

// Permission Levels
export type PermissionLevel = 'Basic' | 'Moderate' | 'Advanced';

// Permission Types
export type PermissionType = 
  | 'createJobOrder'           // Can create job orders independently
  | 'viewReports'              // Can view reports
  | 'downloadReports'          // Can download reports
  | 'downloadCertificates'     // Can download certificates
  | 'viewAllJobOrders'         // Can view all job orders (not just assigned)
  | 'approveJobOrders'         // Can approve job orders
  | 'manageUsers'              // Can manage users
  | 'manageStickers'           // Can manage stickers/tags
  | 'viewAnalytics'            // Can view analytics
  | 'manageSettings'           // Can manage system settings
  | 'issueCertificates'        // Can issue certificates on-demand
  | 'viewFinancialData'        // Can view financial/payment data
  | 'exportData'               // Can export data
  | 'manageRegions'            // Can manage regions/branches
  | 'assignJobs'               // Can assign jobs to others
  | 'viewActivityLogs';        // Can view activity logs

// User Permissions Interface
export interface UserPermissions {
  level: PermissionLevel;
  permissions: {
    [key in PermissionType]?: boolean;
  };
}

// User Interface
export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  currentRole?: UserRole;
  employeeId?: string;
  department?: string;
  permissions?: UserPermissions; // User-specific permissions
}

// Client
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  businessType: 'Construction' | 'Engineering' | 'Individual';
  location: string;
  accountStatus: 'Active' | 'Inactive';
  paymentHistory: Payment[];
  serviceHistory: JobOrder[];
}

// Job Order
export type ServiceType = 'Inspection' | 'Assessment' | 'Training' | 'NDT';
export type JobOrderStatus = 'Pending' | 'In Progress' | 'Completed' | 'Approved' | 'Paid';

export interface JobOrder {
  id: string;
  clientId: string;
  clientName: string;
  serviceType: ServiceType;
  dateTime: Date;
  location: string;
  assignedTo?: string;
  assignedToName?: string;
  checklistTemplate?: string;
  status: JobOrderStatus;
  priority?: 'Low' | 'Medium' | 'High';
  amount?: number;
  paymentStatus?: 'Pending' | 'Confirmed' | 'Failed';
  createdAt: Date;
  updatedAt: Date;
}

// Certificate
export interface Certificate {
  id: string;
  certificateNumber: string;
  jobOrderId: string;
  clientId: string;
  clientName: string;
  serviceType: ServiceType;
  issueDate: Date;
  expiryDate: Date;
  verificationCode: string;
  documentNumber: string;
  stickerNumber: string;
  documentType: 'Digital' | 'Physical';
  status: 'Valid' | 'Expired' | 'Revoked';
}

// Payment
export type PaymentStatus = 'Pending' | 'Confirmed' | 'Failed';
export type PaymentMethod = 'Credit Card' | 'Bank Transfer' | 'Cash';

export interface Payment {
  id: string;
  clientId: string;
  jobOrderId: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  proofOfPayment?: string;
  confirmedBy?: string;
  confirmedAt?: Date;
  createdAt: Date;
}

// NDT Report
export interface NDTReport {
  id: string;
  jobOrderId: string;
  equipmentDetails: {
    serialNumber: string;
    model: string;
    category: string;
  };
  inspectionDetails: string;
  results: string;
  supervisorApprovalStatus: 'Pending' | 'Approved' | 'Rejected';
  inspectorNotes?: string;
  photos: string[];
  createdAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
}

// Training Session
export interface TrainingSession {
  id: string;
  clientId: string;
  trainerId: string;
  trainerName: string;
  scheduledDateTime: Date;
  attendanceList: Participant[];
  assessmentResults: AssessmentResult[];
  approvalStatus: 'Pending' | 'Approved';
  location: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
}

export interface Participant {
  id: string;
  name: string;
  employeeId?: string;
  attendance: 'Present' | 'Absent' | 'Pending';
}

export interface AssessmentResult {
  participantId: string;
  participantName: string;
  outcome: 'Pass' | 'Fail' | 'Pending';
  score?: number;
}

// Notification
export interface Notification {
  id: string;
  userId: string;
  type: 'approval' | 'assignment' | 'payment' | 'expiry' | 'general';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  link?: string;
}

// Dashboard Stats
export interface DashboardStats {
  totalJobOrders?: number;
  pendingApprovals?: number;
  completedThisWeek?: number;
  pendingPayments?: number;
  expiringCertificates?: number;
  revenue?: number;
}




