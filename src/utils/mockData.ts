import { 
  Client, 
  JobOrder, 
  Certificate, 
  Payment, 
  TrainingSession, 
  NDTReport,
  Notification,
  User 
} from '@/types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'John Client',
    email: 'client@example.com',
    roles: ['client'],
    currentRole: 'client',
  },
  {
    id: 'user-2',
    name: 'Jane Inspector',
    email: 'inspector@example.com',
    roles: ['inspector'],
    currentRole: 'inspector',
    employeeId: 'EMP-001',
    department: 'Inspection',
  },
  {
    id: 'user-3',
    name: 'Mike Trainer',
    email: 'trainer@example.com',
    roles: ['trainer'],
    currentRole: 'trainer',
    employeeId: 'EMP-002',
    department: 'Training',
  },
  {
    id: 'user-4',
    name: 'Sarah Supervisor',
    email: 'supervisor@example.com',
    roles: ['supervisor'],
    currentRole: 'supervisor',
    employeeId: 'EMP-003',
    department: 'Operations',
  },
  {
    id: 'user-5',
    name: 'Tom Accountant',
    email: 'accountant@example.com',
    roles: ['accountant'],
    currentRole: 'accountant',
    employeeId: 'EMP-004',
    department: 'Finance',
  },
  {
    id: 'user-6',
    name: 'Lisa Manager',
    email: 'manager@example.com',
    roles: ['manager', 'gm'],
    currentRole: 'manager',
    employeeId: 'EMP-005',
    department: 'Management',
  },
];

// Mock Clients
export const mockClients: Client[] = [
  {
    id: 'client-1',
    name: 'ABC Construction Ltd',
    email: 'contact@abc-construction.com',
    phone: '+1234567890',
    address: '123 Main Street, City',
    businessType: 'Construction',
    location: 'New York',
    accountStatus: 'Active',
    paymentHistory: [],
    serviceHistory: [],
  },
  {
    id: 'client-2',
    name: 'TOVE Leeds Engineering Co',
    email: 'info@toveleeds-engineering.com',
    phone: '+1234567891',
    address: '456 Tech Avenue, City',
    businessType: 'Engineering',
    location: 'California',
    accountStatus: 'Active',
    paymentHistory: [],
    serviceHistory: [],
  },
];

// Mock Job Orders
export const mockJobOrders: JobOrder[] = [
  {
    id: 'JO-2025001',
    clientId: 'client-1',
    clientName: 'ABC Construction Ltd',
    serviceType: 'Inspection',
    dateTime: new Date('2025-10-20T10:00:00'),
    location: '123 Main Street, City',
    assignedTo: 'user-2',
    assignedToName: 'Jane Inspector',
    status: 'Pending',
    priority: 'High',
    amount: 500,
    paymentStatus: 'Pending',
    createdAt: new Date('2025-10-15'),
    updatedAt: new Date('2025-10-15'),
  },
  {
    id: 'JO-2025002',
    clientId: 'client-2',
    clientName: 'TOVE Leeds Engineering Co',
    serviceType: 'Training',
    dateTime: new Date('2025-10-18T14:00:00'),
    location: '456 Tech Avenue, City',
    assignedTo: 'user-3',
    assignedToName: 'Mike Trainer',
    status: 'In Progress',
    priority: 'Medium',
    amount: 1200,
    paymentStatus: 'Confirmed',
    createdAt: new Date('2025-10-10'),
    updatedAt: new Date('2025-10-14'),
  },
  {
    id: 'JO-2025003',
    clientId: 'client-1',
    clientName: 'ABC Construction Ltd',
    serviceType: 'NDT',
    dateTime: new Date('2025-10-16T09:00:00'),
    location: '789 Industrial Park',
    assignedTo: 'user-2',
    assignedToName: 'Jane Inspector',
    status: 'Completed',
    priority: 'Low',
    amount: 800,
    paymentStatus: 'Confirmed',
    createdAt: new Date('2025-10-01'),
    updatedAt: new Date('2025-10-16'),
  },
];

// Mock Certificates
export const mockCertificates: Certificate[] = [
  {
    id: 'cert-1',
    certificateNumber: 'CERT-2025-001',
    jobOrderId: 'JO-2025003',
    clientId: 'client-1',
    clientName: 'ABC Construction Ltd',
    serviceType: 'NDT',
    issueDate: new Date('2025-10-16'),
    expiryDate: new Date('2026-10-16'),
    verificationCode: 'VER-001-STK-001-CERT-001',
    documentNumber: 'DOC-001',
    stickerNumber: 'STK-001',
    documentType: 'Digital',
    status: 'Valid',
  },
  {
    id: 'cert-2',
    certificateNumber: 'CERT-2024-050',
    jobOrderId: 'JO-2024050',
    clientId: 'client-2',
    clientName: 'TOVE Leeds Engineering Co',
    serviceType: 'Inspection',
    issueDate: new Date('2024-11-01'),
    expiryDate: new Date('2025-11-01'),
    verificationCode: 'VER-050-STK-050-CERT-050',
    documentNumber: 'DOC-050',
    stickerNumber: 'STK-050',
    documentType: 'Physical',
    status: 'Valid',
  },
  {
    id: 'cert-3',
    certificateNumber: 'CERT-2024-025',
    jobOrderId: 'JO-2024025',
    clientId: 'client-1',
    clientName: 'ABC Construction Ltd',
    serviceType: 'Training',
    issueDate: new Date('2024-08-15'),
    expiryDate: new Date('2025-08-15'),
    verificationCode: 'VER-025-STK-025-CERT-025',
    documentNumber: 'DOC-025',
    stickerNumber: 'STK-025',
    documentType: 'Digital',
    status: 'Valid',
  },
];

// Mock Payments
export const mockPayments: Payment[] = [
  {
    id: 'pay-1',
    clientId: 'client-1',
    jobOrderId: 'JO-2025001',
    amount: 500,
    status: 'Pending',
    method: 'Bank Transfer',
    proofOfPayment: 'proof-1.pdf',
    createdAt: new Date('2025-10-15'),
  },
  {
    id: 'pay-2',
    clientId: 'client-2',
    jobOrderId: 'JO-2025002',
    amount: 1200,
    status: 'Confirmed',
    method: 'Credit Card',
    confirmedBy: 'user-5',
    confirmedAt: new Date('2025-10-14'),
    createdAt: new Date('2025-10-10'),
  },
];

// Mock Training Sessions
export const mockTrainingSessions: TrainingSession[] = [
  {
    id: 'train-1',
    clientId: 'client-2',
    trainerId: 'user-3',
    trainerName: 'Mike Trainer',
    scheduledDateTime: new Date('2025-10-18T14:00:00'),
    attendanceList: [
      { id: 'p1', name: 'John Doe', employeeId: 'E001', attendance: 'Pending' },
      { id: 'p2', name: 'Jane Smith', employeeId: 'E002', attendance: 'Pending' },
    ],
    assessmentResults: [],
    approvalStatus: 'Pending',
    location: '456 Tech Avenue, City',
    status: 'Scheduled',
  },
];

// Mock NDT Reports
export const mockNDTReports: NDTReport[] = [
  {
    id: 'ndt-1',
    jobOrderId: 'JO-2025003',
    equipmentDetails: {
      serialNumber: 'SN-12345',
      model: 'Crane Model X',
      category: 'Heavy Equipment',
    },
    inspectionDetails: 'Visual inspection and ultrasonic testing performed',
    results: 'All tests passed. Equipment is in good condition.',
    supervisorApprovalStatus: 'Approved',
    inspectorNotes: 'Minor wear on cable, recommend monitoring',
    photos: ['photo1.jpg', 'photo2.jpg'],
    createdAt: new Date('2025-10-16'),
    approvedAt: new Date('2025-10-16'),
    approvedBy: 'user-4',
  },
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-2',
    type: 'assignment',
    title: 'New Job Assignment',
    message: 'You have been assigned to Job Order JO-2025001',
    read: false,
    createdAt: new Date('2025-10-15T08:00:00'),
    link: '/inspector/job-orders/JO-2025001',
  },
  {
    id: 'notif-2',
    userId: 'user-4',
    type: 'approval',
    title: 'Report Pending Approval',
    message: 'NDT Report for JO-2025003 is awaiting your approval',
    read: false,
    createdAt: new Date('2025-10-16T10:30:00'),
    link: '/supervisor/approvals',
  },
  {
    id: 'notif-3',
    userId: 'user-5',
    type: 'payment',
    title: 'Payment Received',
    message: 'Payment confirmation needed for JO-2025001',
    read: true,
    createdAt: new Date('2025-10-15T14:20:00'),
    link: '/accountant/payments',
  },
];



