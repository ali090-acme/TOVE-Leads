/**
 * Sticker Usage Tracking System
 * Tracks which stickers are allocated to which job orders for accountability
 */

export interface StickerUsage {
  id: string;
  stickerStockId: string; // ID of the sticker stock item
  stickerLotNumber: string;
  stickerNumber?: string; // Specific sticker number if applicable
  jobOrderId: string;
  jobOrderNumber: string;
  allocatedBy: string; // User ID who allocated
  allocatedByName: string;
  allocatedAt: Date;
  status: 'Allocated' | 'Used' | 'Returned' | 'Cancelled';
  usedAt?: Date;
  returnedAt?: Date;
}

const STORAGE_KEY_STICKER_USAGE = 'sticker-usage-tracking';

/**
 * Allocate a sticker to a job order
 */
export const allocateStickerToJob = (
  stickerStockId: string,
  stickerLotNumber: string,
  stickerNumber: string | undefined,
  jobOrderId: string,
  jobOrderNumber: string,
  allocatedBy: string,
  allocatedByName: string
): StickerUsage => {
  const usage: StickerUsage = {
    id: `usage-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    stickerStockId,
    stickerLotNumber,
    stickerNumber,
    jobOrderId,
    jobOrderNumber,
    allocatedBy,
    allocatedByName,
    allocatedAt: new Date(),
    status: 'Allocated',
  };

  const existing = getAllStickerUsage();
  existing.push(usage);
  localStorage.setItem(STORAGE_KEY_STICKER_USAGE, JSON.stringify(existing));

  return usage;
};

/**
 * Mark sticker as used
 */
export const markStickerAsUsed = (usageId: string): boolean => {
  const allUsage = getAllStickerUsage();
  const usage = allUsage.find((u) => u.id === usageId);
  
  if (!usage) return false;
  
  usage.status = 'Used';
  usage.usedAt = new Date();
  
  localStorage.setItem(STORAGE_KEY_STICKER_USAGE, JSON.stringify(allUsage));
  return true;
};

/**
 * Get all sticker usage records
 */
export const getAllStickerUsage = (): StickerUsage[] => {
  const stored = localStorage.getItem(STORAGE_KEY_STICKER_USAGE);
  if (!stored) return [];
  
  const parsed = JSON.parse(stored);
  return parsed.map((u: any) => ({
    ...u,
    allocatedAt: new Date(u.allocatedAt),
    usedAt: u.usedAt ? new Date(u.usedAt) : undefined,
    returnedAt: u.returnedAt ? new Date(u.returnedAt) : undefined,
  }));
};

/**
 * Get sticker usage for a specific job order
 */
export const getStickerUsageForJob = (jobOrderId: string): StickerUsage | undefined => {
  const allUsage = getAllStickerUsage();
  return allUsage.find((u) => u.jobOrderId === jobOrderId && u.status !== 'Cancelled');
};

/**
 * Get sticker usage for a specific sticker stock item
 */
export const getStickerUsageForStock = (stickerStockId: string): StickerUsage[] => {
  const allUsage = getAllStickerUsage();
  return allUsage.filter(
    (u) => u.stickerStockId === stickerStockId && (u.status === 'Allocated' || u.status === 'Used')
  );
};

/**
 * Get available sticker quantity (total - allocated - used)
 */
export const getAvailableStickerQuantity = (
  totalQuantity: number,
  stickerStockId: string
): number => {
  const usage = getStickerUsageForStock(stickerStockId);
  const allocatedOrUsed = usage.filter((u) => u.status === 'Allocated' || u.status === 'Used').length;
  return Math.max(0, totalQuantity - allocatedOrUsed);
};

/**
 * Check if a sticker can be allocated (has available quantity)
 */
export const canAllocateSticker = (
  stickerStockId: string,
  totalQuantity: number
): boolean => {
  const available = getAvailableStickerQuantity(totalQuantity, stickerStockId);
  return available > 0;
};

/**
 * Get sticker usage history for an inspector
 */
export const getStickerUsageForInspector = (inspectorId: string): StickerUsage[] => {
  const allUsage = getAllStickerUsage();
  return allUsage.filter((u) => u.allocatedBy === inspectorId);
};

/**
 * Get all job orders that have sticker allocations
 */
export const getJobOrdersWithStickers = (): string[] => {
  const allUsage = getAllStickerUsage();
  return [...new Set(allUsage.map((u) => u.jobOrderId))];
};

