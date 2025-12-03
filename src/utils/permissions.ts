import { User, PermissionType, PermissionLevel, UserPermissions } from '@/types';

// Default permissions based on level
const DEFAULT_PERMISSIONS_BY_LEVEL: Record<PermissionLevel, Partial<Record<PermissionType, boolean>>> = {
  Basic: {
    // Basic users can only view assigned items
    viewReports: false,
    downloadReports: false,
    downloadCertificates: false,
    viewAllJobOrders: false,
    viewAnalytics: false,
    viewFinancialData: false,
    exportData: false,
    viewActivityLogs: false,
  },
  Moderate: {
    // Moderate users have more access
    viewReports: true,
    downloadReports: true,
    downloadCertificates: true,
    viewAllJobOrders: true,
    viewAnalytics: false,
    viewFinancialData: false,
    exportData: true,
    viewActivityLogs: true,
  },
  Advanced: {
    // Advanced users have full access
    viewReports: true,
    downloadReports: true,
    downloadCertificates: true,
    viewAllJobOrders: true,
    approveJobOrders: true,
    manageUsers: true,
    manageStickers: true,
    viewAnalytics: true,
    manageSettings: true,
    issueCertificates: true,
    viewFinancialData: true,
    exportData: true,
    manageRegions: true,
    assignJobs: true,
    viewActivityLogs: true,
  },
};

// Default permissions based on role
const DEFAULT_PERMISSIONS_BY_ROLE: Record<string, Partial<Record<PermissionType, boolean>>> = {
  inspector: {
    createJobOrder: false, // Default: inspectors cannot create job orders unless explicitly allowed
    viewReports: true,
    downloadCertificates: true,
    viewAllJobOrders: false,
  },
  supervisor: {
    createJobOrder: true,
    approveJobOrders: true,
    viewReports: true,
    downloadReports: true,
    viewAllJobOrders: true,
    assignJobs: true,
  },
  trainer: {
    createJobOrder: false, // Requires job order first
    viewReports: true,
    downloadCertificates: true,
  },
  manager: {
    createJobOrder: true,
    approveJobOrders: true,
    viewReports: true,
    downloadReports: true,
    viewAllJobOrders: true,
    manageUsers: true,
    manageStickers: true,
    viewAnalytics: true,
    assignJobs: true,
    viewActivityLogs: true,
  },
  accountant: {
    viewReports: true,
    downloadReports: true,
    viewFinancialData: true,
    exportData: true,
  },
  gm: {
    // General Manager has all permissions
    createJobOrder: true,
    viewReports: true,
    downloadReports: true,
    downloadCertificates: true,
    viewAllJobOrders: true,
    approveJobOrders: true,
    manageUsers: true,
    manageStickers: true,
    viewAnalytics: true,
    manageSettings: true,
    issueCertificates: true,
    viewFinancialData: true,
    exportData: true,
    manageRegions: true,
    assignJobs: true,
    viewActivityLogs: true,
  },
};

/**
 * Get default permissions for a user based on their role and level
 */
export const getDefaultPermissions = (
  role: string,
  level: PermissionLevel = 'Basic'
): UserPermissions => {
  const rolePermissions = DEFAULT_PERMISSIONS_BY_ROLE[role] || {};
  const levelPermissions = DEFAULT_PERMISSIONS_BY_LEVEL[level] || {};
  
  // Merge role and level permissions (level permissions override role permissions)
  const mergedPermissions: Partial<Record<PermissionType, boolean>> = {
    ...rolePermissions,
    ...levelPermissions,
  };

  return {
    level,
    permissions: mergedPermissions,
  };
};

/**
 * Check if user has a specific permission
 */
export const hasPermission = (
  user: User | null,
  permission: PermissionType
): boolean => {
  if (!user) return false;

  // If user has custom permissions, use those
  if (user.permissions) {
    // Check explicit permission setting
    if (user.permissions.permissions[permission] !== undefined) {
      return user.permissions.permissions[permission] === true;
    }
    
    // If permission not explicitly set, check level defaults
    const levelDefaults = DEFAULT_PERMISSIONS_BY_LEVEL[user.permissions.level] || {};
    if (levelDefaults[permission] !== undefined) {
      return levelDefaults[permission] === true;
    }
  }

  // Fallback to role-based defaults
  const currentRole = user.currentRole || user.roles[0];
  if (currentRole) {
    const roleDefaults = DEFAULT_PERMISSIONS_BY_ROLE[currentRole] || {};
    return roleDefaults[permission] === true;
  }

  return false;
};

/**
 * Check if user can create job orders
 * This is a critical permission check based on meeting requirements
 */
export const canCreateJobOrder = (user: User | null): boolean => {
  if (!user) return false;
  
  // Managers, supervisors, and GM can always create
  if (user.roles.includes('manager') || user.roles.includes('supervisor') || user.roles.includes('gm')) {
    return true;
  }

  // For inspectors and trainers, check explicit permission
  return hasPermission(user, 'createJobOrder');
};

/**
 * Check if user can view reports
 */
export const canViewReports = (user: User | null): boolean => {
  return hasPermission(user, 'viewReports');
};

/**
 * Check if user can download reports
 */
export const canDownloadReports = (user: User | null): boolean => {
  return hasPermission(user, 'downloadReports');
};

/**
 * Check if user can download certificates
 */
export const canDownloadCertificates = (user: User | null): boolean => {
  return hasPermission(user, 'downloadCertificates');
};

/**
 * Check if user can view all job orders (not just assigned)
 */
export const canViewAllJobOrders = (user: User | null): boolean => {
  return hasPermission(user, 'viewAllJobOrders');
};

/**
 * Check if user can approve job orders
 */
export const canApproveJobOrders = (user: User | null): boolean => {
  return hasPermission(user, 'approveJobOrders');
};

/**
 * Check if user can manage users
 */
export const canManageUsers = (user: User | null): boolean => {
  return hasPermission(user, 'manageUsers');
};

/**
 * Check if user can manage stickers/tags
 */
export const canManageStickers = (user: User | null): boolean => {
  return hasPermission(user, 'manageStickers');
};

/**
 * Check if user can view analytics
 */
export const canViewAnalytics = (user: User | null): boolean => {
  return hasPermission(user, 'viewAnalytics');
};

/**
 * Check if user can export data
 */
export const canExportData = (user: User | null): boolean => {
  return hasPermission(user, 'exportData');
};

/**
 * Get all available permission types
 */
export const getAllPermissionTypes = (): PermissionType[] => {
  return [
    'createJobOrder',
    'viewReports',
    'downloadReports',
    'downloadCertificates',
    'viewAllJobOrders',
    'approveJobOrders',
    'manageUsers',
    'manageStickers',
    'viewAnalytics',
    'manageSettings',
    'issueCertificates',
    'viewFinancialData',
    'exportData',
    'manageRegions',
    'assignJobs',
    'viewActivityLogs',
  ];
};

/**
 * Get permission description
 */
export const getPermissionDescription = (permission: PermissionType): string => {
  const descriptions: Record<PermissionType, string> = {
    createJobOrder: 'Create job orders independently',
    viewReports: 'View reports and analytics',
    downloadReports: 'Download reports in various formats',
    downloadCertificates: 'Download certificates',
    viewAllJobOrders: 'View all job orders (not just assigned)',
    approveJobOrders: 'Approve or reject job orders',
    manageUsers: 'Manage user accounts and permissions',
    manageStickers: 'Manage stickers and tags inventory',
    viewAnalytics: 'View analytics and statistics',
    manageSettings: 'Manage system settings',
    issueCertificates: 'Issue certificates on-demand',
    viewFinancialData: 'View financial and payment data',
    exportData: 'Export data in various formats',
    manageRegions: 'Manage regions and branches',
    assignJobs: 'Assign jobs to other users',
    viewActivityLogs: 'View activity logs and audit trail',
  };
  return descriptions[permission] || permission;
};

