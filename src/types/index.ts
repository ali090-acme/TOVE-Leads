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

// Shadow Role/Delegation Interface
export interface Delegation {
  delegates: Array<{
    userId: string; // User ID who will perform the action
    userName: string; // Name of the user performing action
    priority: number; // Priority order (1 = first, 2 = second, etc.)
    active: boolean; // Whether this delegate is currently active
  }>;
  delegatedBy: string; // User ID who delegated (technical manager)
  delegatedByName: string; // Name of technical manager
  active: boolean; // Whether delegation is currently active
  startDate?: Date;
  endDate?: Date;
  // Legacy fields for backward compatibility
  delegatedToId?: string; // Deprecated: Use delegates[0].userId instead
  delegatedToName?: string; // Deprecated: Use delegates[0].userName instead
}

// Region/Team Interface
export interface Region {
  id: string;
  name: string; // e.g., "Lahore", "Islamabad"
  code: string; // e.g., "LHR", "ISB"
  teams: Team[]; // Multiple teams within a region
  createdAt: Date;
  updatedAt: Date;
}

export interface Team {
  id: string;
  regionId: string;
  name: string; // e.g., "Lahore One", "Lahore Two", "Lahore Three"
  code: string; // e.g., "LHR-1", "LHR-2"
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
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
  delegation?: Delegation; // Shadow role delegation
  regionId?: string; // Region assignment
  teamId?: string; // Team assignment (within region)
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
  regionId?: string; // Region assignment
  teamId?: string; // Team assignment (within region)
}

// Sticker Sizes
export type StickerSize = 'Large' | 'Small';

// Job Order
export type ServiceType = 'Inspection' | 'Assessment' | 'Training' | 'NDT';
export type JobOrderStatus = 'Pending' | 'In Progress' | 'Completed' | 'Approved' | 'Paid';

export interface JobOrder {
  id: string;
  clientId: string;
  clientName: string;
  serviceTypes: ServiceType[]; // Multiple service types can be in one job order (e.g., Inspection + Training)
  dateTime: Date;
  location: string;
  regionId?: string; // Region assignment
  teamId?: string; // Team assignment (within region)
  assignedTo?: string; // Legacy: single assignment (for backward compatibility)
  assignedToName?: string; // Legacy: single assignment name
  // Multiple assignments support (for dual work scenario: inspector + trainer)
  assignments?: {
    inspector?: {
      userId: string;
      userName: string;
    };
    trainer?: {
      userId: string;
      userName: string;
    };
  };
  // Assignment type indicator (when job order is split: one for inspector, one for trainer)
  assignmentType?: 'Inspector' | 'Trainer'; // Indicates if this job order is specifically for inspector or trainer
  checklistTemplate?: string;
  status: JobOrderStatus;
  priority?: 'Low' | 'Medium' | 'High';
  amount?: number;
  paymentStatus?: 'Pending' | 'Confirmed' | 'Failed';
  // Sticker allocation fields (for accountability and tracking)
  stickerAllocation?: {
    stickerId?: string; // ID of the sticker stock item used
    stickerNumber?: string; // Specific sticker number used
    stickerLotNumber?: string; // Lot number of the sticker
    stickerSize?: StickerSize; // Size of sticker (Large or Small)
    allocatedAt?: Date; // When sticker was allocated to this job
    allocatedBy?: string; // User ID who allocated the sticker
    stickerPhoto?: string; // Base64 photo of sticker attachment (for accountability)
    removedAt?: Date; // When sticker was removed (removal detection)
    removedBy?: string; // User ID who reported removal
    removalReportedAt?: Date; // When removal was reported
  };
  // Tag allocation fields (separate from stickers - for traceability)
  tagAllocation?: {
    tagId?: string; // ID of the tag
    tagNumber: string; // Unique tag number (for traceability)
    allocatedAt?: Date; // When tag was allocated to this job
    allocatedBy?: string; // User ID who allocated the tag
    removedAt?: Date; // When tag was removed (removal detection)
    removedBy?: string; // User ID who reported removal
    removalReportedAt?: Date; // When removal was reported
  };
  createdAt: Date;
  updatedAt: Date;
}

// Certificate
export type CertificateFormat = 'A4' | 'Card'; // A4 is mandatory (default), Card is optional (on demand)

export interface Certificate {
  id: string;
  certificateNumber: string;
  jobOrderId?: string; // Optional: may be linked to job order or training session
  trainingSessionId?: string; // Optional: for training certificates
  participantId?: string; // For training: participant who received this certificate
  participantName?: string; // For training: participant name
  clientId: string;
  clientName: string;
  serviceType: ServiceType;
  issueDate: Date;
  expiryDate: Date;
  verificationCode: string;
  documentNumber: string;
  stickerNumber: string;
  documentType: 'Digital' | 'Physical';
  certificateFormat: CertificateFormat; // A4 (mandatory/default) or Card (optional/on demand)
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
  jobOrderId: string; // Training is linked to job order (required for invoice generation)
  clientId: string;
  trainerId: string;
  trainerName: string;
  scheduledDateTime: Date;
  attendanceList: Participant[];
  assessmentResults: AssessmentResult[];
  approvalStatus: 'Pending' | 'Approved';
  location: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
  createdAt: Date;
  updatedAt: Date;
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

// Tag Interface (Physical tags with unique numbers - NOT printable)
export interface Tag {
  id: string;
  tagNumber: string; // Unique number for traceability
  status: 'Available' | 'Allocated' | 'Used' | 'Removed';
  allocatedTo?: string; // Job Order ID if allocated
  allocatedAt?: Date;
  allocatedBy?: string; // User ID who allocated
  removedAt?: Date; // When tag was removed (removal detection)
  removedBy?: string; // User ID who reported removal
  removalReportedAt?: Date; // When removal was reported
  createdAt: Date;
  createdBy: string; // User ID who entered tag in system
  notes?: string;
}

// Sticker Stock Item (Printable stickers - 2 sizes)
export interface StickerStockItem {
  id: string;
  lotId: string;
  lotNumber: string;
  size: StickerSize; // Large or Small
  assignedTo: string;
  assignedToName: string;
  assignedToEmail?: string;
  assignedToType: 'Region' | 'Inspector';
  quantity: number;
  issuedDate: Date;
  issuedBy: string;
}




