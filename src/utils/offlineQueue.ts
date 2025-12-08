import { JobOrder, ServiceType } from '@/types';

export interface OfflineJobOrder extends Omit<JobOrder, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string; // Temporary ID for offline jobs
  createdAt?: Date;
  updatedAt?: Date;
  offlineId: string; // Unique offline identifier
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed';
  stickerPhoto?: string; // Base64 encoded photo of sticker attachment
  stickerNumber?: string; // Sticker number used
  syncAttempts?: number;
  lastSyncAttempt?: Date;
  errorMessage?: string;
}

const STORAGE_KEY_OFFLINE_QUEUE = 'offline-job-queue';
const STORAGE_KEY_SYNC_STATUS = 'sync-status';

export interface SyncStatus {
  isOnline: boolean;
  lastSyncTime: Date | null;
  pendingItems: number;
  syncing: boolean;
}

/**
 * Check if device is online
 */
export const isOnline = (): boolean => {
  return navigator.onLine;
};

/**
 * Get sync status
 */
export const getSyncStatus = (): SyncStatus => {
  const stored = localStorage.getItem(STORAGE_KEY_SYNC_STATUS);
  const queue = getOfflineQueue();
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        isOnline: isOnline(),
        pendingItems: queue.filter((item) => item.syncStatus === 'pending' || item.syncStatus === 'failed').length,
        lastSyncTime: parsed.lastSyncTime ? new Date(parsed.lastSyncTime) : null,
      };
    } catch (e) {
      console.error('Failed to parse sync status', e);
    }
  }
  
  return {
    isOnline: isOnline(),
    lastSyncTime: null,
    pendingItems: queue.length,
    syncing: false,
  };
};

/**
 * Update sync status
 */
export const updateSyncStatus = (updates: Partial<SyncStatus>) => {
  const current = getSyncStatus();
  const updated = {
    ...current,
    ...updates,
    lastSyncTime: updates.lastSyncTime || current.lastSyncTime,
  };
  localStorage.setItem(STORAGE_KEY_SYNC_STATUS, JSON.stringify(updated));
};

/**
 * Get offline queue
 */
export const getOfflineQueue = (): OfflineJobOrder[] => {
  const stored = localStorage.getItem(STORAGE_KEY_OFFLINE_QUEUE);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((item: any) => ({
        ...item,
        dateTime: new Date(item.dateTime),
        createdAt: item.createdAt ? new Date(item.createdAt) : undefined,
        updatedAt: item.updatedAt ? new Date(item.updatedAt) : undefined,
        lastSyncAttempt: item.lastSyncAttempt ? new Date(item.lastSyncAttempt) : undefined,
      }));
    } catch (e) {
      console.error('Failed to parse offline queue', e);
      return [];
    }
  }
  return [];
};

/**
 * Add job order to offline queue
 */
export const addToOfflineQueue = (jobOrder: Omit<OfflineJobOrder, 'offlineId' | 'syncStatus'>): OfflineJobOrder => {
  const queue = getOfflineQueue();
  const offlineId = `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const offlineJob: OfflineJobOrder = {
    ...jobOrder,
    offlineId,
    syncStatus: isOnline() ? 'pending' : 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
    syncAttempts: 0,
  };
  
  queue.push(offlineJob);
  localStorage.setItem(STORAGE_KEY_OFFLINE_QUEUE, JSON.stringify(queue));
  
  // Update sync status
  updateSyncStatus({
    pendingItems: queue.filter((item) => item.syncStatus === 'pending' || item.syncStatus === 'failed').length,
  });
  
  // If online, try to sync immediately
  if (isOnline()) {
    syncOfflineQueue().catch((error) => {
      console.error('Failed to sync immediately:', error);
    });
  }
  
  return offlineJob;
};

/**
 * Remove job order from offline queue
 */
export const removeFromOfflineQueue = (offlineId: string): boolean => {
  const queue = getOfflineQueue();
  const filtered = queue.filter((item) => item.offlineId !== offlineId);
  
  if (filtered.length < queue.length) {
    localStorage.setItem(STORAGE_KEY_OFFLINE_QUEUE, JSON.stringify(filtered));
    updateSyncStatus({
      pendingItems: filtered.filter((item) => item.syncStatus === 'pending' || item.syncStatus === 'failed').length,
    });
    return true;
  }
  return false;
};

/**
 * Update job order in offline queue
 */
export const updateOfflineQueueItem = (offlineId: string, updates: Partial<OfflineJobOrder>): boolean => {
  const queue = getOfflineQueue();
  const index = queue.findIndex((item) => item.offlineId === offlineId);
  
  if (index !== -1) {
    queue[index] = {
      ...queue[index],
      ...updates,
      updatedAt: new Date(),
    };
    localStorage.setItem(STORAGE_KEY_OFFLINE_QUEUE, JSON.stringify(queue));
    updateSyncStatus({
      pendingItems: queue.filter((item) => item.syncStatus === 'pending' || item.syncStatus === 'failed').length,
    });
    return true;
  }
  return false;
};

/**
 * Sync offline queue with server
 */
export const syncOfflineQueue = async (): Promise<{ synced: number; failed: number }> => {
  if (!isOnline()) {
    console.log('Device is offline, cannot sync');
    return { synced: 0, failed: 0 };
  }
  
  updateSyncStatus({ syncing: true });
  
  const queue = getOfflineQueue();
  const pendingItems = queue.filter((item) => item.syncStatus === 'pending' || item.syncStatus === 'failed');
  
  let synced = 0;
  let failed = 0;
  
  for (const item of pendingItems) {
    try {
      // Update status to syncing
      updateOfflineQueueItem(item.offlineId, {
        syncStatus: 'syncing',
        syncAttempts: (item.syncAttempts || 0) + 1,
        lastSyncAttempt: new Date(),
      });
      
      // In a real app, this would be an API call
      // For now, we'll simulate it by adding to localStorage jobOrders
      const existingJobOrders = JSON.parse(localStorage.getItem('jobOrders') || '[]');
      
      const syncedJobOrder: JobOrder = {
        id: `JO-${new Date().getFullYear()}${String(existingJobOrders.length + 1).padStart(3, '0')}`,
        clientId: item.clientId,
        clientName: item.clientName,
        serviceTypes: item.serviceTypes || (item.serviceType ? [item.serviceType as ServiceType] : []), // Support both old and new format
        dateTime: item.dateTime,
        location: item.location,
        status: item.status,
        assignedTo: item.assignedTo,
        assignedToName: item.assignedToName,
        priority: item.priority,
        createdAt: item.createdAt || new Date(),
        updatedAt: new Date(),
      };
      
      existingJobOrders.push(syncedJobOrder);
      localStorage.setItem('jobOrders', JSON.stringify(existingJobOrders));
      
      // Mark as synced and remove from queue
      updateOfflineQueueItem(item.offlineId, {
        syncStatus: 'synced',
      });
      
      // Remove from queue after successful sync
      setTimeout(() => {
        removeFromOfflineQueue(item.offlineId);
      }, 1000);
      
      synced++;
    } catch (error: any) {
      console.error(`Failed to sync item ${item.offlineId}:`, error);
      
      // Mark as failed
      updateOfflineQueueItem(item.offlineId, {
        syncStatus: 'failed',
        errorMessage: error.message || 'Sync failed',
        syncAttempts: (item.syncAttempts || 0) + 1,
        lastSyncAttempt: new Date(),
      });
      
      failed++;
    }
  }
  
  updateSyncStatus({
    syncing: false,
    lastSyncTime: new Date(),
  });
  
  // Dispatch custom event for UI updates
  window.dispatchEvent(new Event('offlineQueueSynced'));
  
  return { synced, failed };
};

/**
 * Convert file to base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Initialize offline sync listeners
 */
export const initializeOfflineSync = () => {
  // Listen for online/offline events
  window.addEventListener('online', () => {
    console.log('Device came online, syncing queue...');
    updateSyncStatus({ isOnline: true });
    syncOfflineQueue().catch((error) => {
      console.error('Failed to sync on online event:', error);
    });
  });
  
  window.addEventListener('offline', () => {
    console.log('Device went offline');
    updateSyncStatus({ isOnline: false });
  });
  
  // Try to sync periodically when online
  setInterval(() => {
    if (isOnline()) {
      const queue = getOfflineQueue();
      const pendingItems = queue.filter((item) => item.syncStatus === 'pending' || item.syncStatus === 'failed');
      if (pendingItems.length > 0) {
        console.log(`Syncing ${pendingItems.length} pending items...`);
        syncOfflineQueue().catch((error) => {
          console.error('Failed to sync periodically:', error);
        });
      }
    }
  }, 30000); // Sync every 30 seconds
};

