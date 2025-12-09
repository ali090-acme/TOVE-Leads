/**
 * Activity Logger Utility
 * Logs user actions and system events for audit trail
 */

export type ActionType =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'REJECT'
  | 'SUBMIT'
  | 'DOWNLOAD'
  | 'UPLOAD'
  | 'VERIFY'
  | 'PAYMENT'
  | 'RENEWAL'
  | 'SYSTEM_ERROR'
  | 'SYSTEM_WARNING'
  | 'SYSTEM_INFO';

export type EntityType =
  | 'USER'
  | 'CERTIFICATE'
  | 'JOB_ORDER'
  | 'PAYMENT'
  | 'CLIENT'
  | 'TRAINING_SESSION'
  | 'DOCUMENT'
  | 'SYSTEM';

export interface ActivityLog {
  id: string;
  userId: string | null; // Actual user who performed the action (for accountability)
  userName: string | null; // Actual user name (for accountability)
  userRole: string | null; // Actual user role
  displayedUserId?: string | null; // User ID shown in front end (technical manager)
  displayedUserName?: string | null; // User name shown in front end (technical manager)
  displayedUserRole?: string | null; // User role shown in front end
  isDelegated?: boolean; // Whether action was performed via delegation
  actionType: ActionType;
  entityType: EntityType;
  entityId: string | null;
  entityName: string | null;
  description: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  severity: 'INFO' | 'WARNING' | 'ERROR';
}

const STORAGE_KEY = 'activity-logs';
const MAX_LOGS = 10000; // Maximum logs to keep (10,000)
const RETENTION_DAYS = 1089; // Keep logs for 3 year

/**
 * Get all activity logs from storage
 */
export const getActivityLogs = (): ActivityLog[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const logs = JSON.parse(stored);
    return logs.map((log: any) => ({
      ...log,
      timestamp: new Date(log.timestamp),
    }));
  } catch (error) {
    console.error('Error reading activity logs:', error);
    return [];
  }
};

/**
 * Save activity logs to storage
 */
const saveActivityLogs = (logs: ActivityLog[]): void => {
  try {
    // Clean old logs (older than retention period)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
    
    const filteredLogs = logs.filter((log) => log.timestamp >= cutoffDate);
    
    // Keep only the most recent MAX_LOGS
    const logsToSave = filteredLogs
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, MAX_LOGS);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logsToSave));
  } catch (error) {
    console.error('Error saving activity logs:', error);
  }
};

/**
 * Log a user action (with shadow role/delegation support)
 */
export const logUserAction = (
  actionType: ActionType,
  entityType: EntityType,
  entityId: string | null,
  entityName: string | null,
  description: string,
  details: Record<string, any> = {},
  userId?: string | null,
  userName?: string | null,
  userRole?: string | null,
  displayedUserId?: string | null, // Technical manager ID (shown in front end)
  displayedUserName?: string | null, // Technical manager name (shown in front end)
  displayedUserRole?: string | null // Technical manager role
): void => {
  const isDelegated = displayedUserId && displayedUserId !== userId;
  
  const log: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: userId || null, // Actual user (for accountability)
    userName: userName || null, // Actual user name (for accountability)
    userRole: userRole || null, // Actual user role
    displayedUserId: displayedUserId || userId || null, // Shown in front end
    displayedUserName: displayedUserName || userName || null, // Shown in front end
    displayedUserRole: displayedUserRole || userRole || null, // Shown in front end
    isDelegated: isDelegated || false,
    actionType,
    entityType,
    entityId,
    entityName,
    description: isDelegated 
      ? `${description} (Delegated by ${displayedUserName || 'Manager'})`
      : description,
    details: {
      ...details,
      delegation: isDelegated ? {
        actualUser: userName,
        displayedUser: displayedUserName,
      } : undefined,
    },
    ipAddress: '127.0.0.1', // In production, get from request
    userAgent: navigator.userAgent,
    timestamp: new Date(),
    severity: 'INFO',
  };

  const logs = getActivityLogs();
  logs.push(log);
  saveActivityLogs(logs);
};

/**
 * Log a system event
 */
export const logSystemEvent = (
  actionType: 'SYSTEM_ERROR' | 'SYSTEM_WARNING' | 'SYSTEM_INFO',
  description: string,
  details: Record<string, any> = {}
): void => {
  const log: ActivityLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: null,
    userName: 'System',
    userRole: 'SYSTEM',
    actionType,
    entityType: 'SYSTEM',
    entityId: null,
    entityName: null,
    description,
    details,
    timestamp: new Date(),
    severity: actionType === 'SYSTEM_ERROR' ? 'ERROR' : actionType === 'SYSTEM_WARNING' ? 'WARNING' : 'INFO',
  };

  const logs = getActivityLogs();
  logs.push(log);
  saveActivityLogs(logs);
};

/**
 * Filter logs by various criteria
 */
export const filterLogs = (
  logs: ActivityLog[],
  filters: {
    userId?: string;
    actionType?: ActionType;
    entityType?: EntityType;
    severity?: 'INFO' | 'WARNING' | 'ERROR';
    startDate?: Date;
    endDate?: Date;
    searchText?: string;
  }
): ActivityLog[] => {
  return logs.filter((log) => {
    if (filters.userId && log.userId !== filters.userId) return false;
    if (filters.actionType && log.actionType !== filters.actionType) return false;
    if (filters.entityType && log.entityType !== filters.entityType) return false;
    if (filters.severity && log.severity !== filters.severity) return false;
    if (filters.startDate && log.timestamp < filters.startDate) return false;
    if (filters.endDate && log.timestamp > filters.endDate) return false;
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      const matchesSearch =
        log.description.toLowerCase().includes(searchLower) ||
        log.userName?.toLowerCase().includes(searchLower) ||
        log.entityName?.toLowerCase().includes(searchLower) ||
        log.actionType.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }
    return true;
  });
};

/**
 * Export logs to CSV
 */
export const exportLogsToCSV = (logs: ActivityLog[]): string => {
  const headers = [
    'ID',
    'Timestamp',
    'User ID',
    'User Name',
    'User Role',
    'Action Type',
    'Entity Type',
    'Entity ID',
    'Entity Name',
    'Description',
    'Severity',
    'IP Address',
    'Details',
  ];

  const rows = logs.map((log) => [
    log.id,
    log.timestamp.toISOString(),
    log.userId || '',
    log.userName || '',
    log.userRole || '',
    log.actionType,
    log.entityType,
    log.entityId || '',
    log.entityName || '',
    log.description,
    log.severity,
    log.ipAddress || '',
    JSON.stringify(log.details),
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  return csvContent;
};

/**
 * Export logs to JSON
 */
export const exportLogsToJSON = (logs: ActivityLog[]): string => {
  return JSON.stringify(logs, null, 2);
};

/**
 * Clear old logs (older than retention period)
 */
export const clearOldLogs = (): number => {
  const logs = getActivityLogs();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
  
  const filteredLogs = logs.filter((log) => log.timestamp >= cutoffDate);
  saveActivityLogs(filteredLogs);
  
  return logs.length - filteredLogs.length;
};

