/**
 * Tag Tracking System
 * Tracks physical tags with unique numbers for traceability
 * Tags are NOT printable - they are ready-to-use physical items entered in system
 */

import { Tag } from '@/types';

const STORAGE_KEY_TAGS = 'tag-tracking';

/**
 * Get all tags
 */
export const getAllTags = (): Tag[] => {
  const stored = localStorage.getItem(STORAGE_KEY_TAGS);
  if (!stored) return [];
  
  const parsed = JSON.parse(stored);
  return parsed.map((t: any) => ({
    ...t,
    allocatedAt: t.allocatedAt ? new Date(t.allocatedAt) : undefined,
    removedAt: t.removedAt ? new Date(t.removedAt) : undefined,
    removalReportedAt: t.removalReportedAt ? new Date(t.removalReportedAt) : undefined,
    createdAt: new Date(t.createdAt),
  }));
};

/**
 * Create a new tag (manager enters ready-to-use tags)
 */
export const createTag = (
  tagNumber: string,
  createdBy: string,
  notes?: string
): Tag => {
  // Check if tag number already exists
  const existingTags = getAllTags();
  if (existingTags.some(t => t.tagNumber === tagNumber)) {
    throw new Error(`Tag number ${tagNumber} already exists`);
  }

  const tag: Tag = {
    id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    tagNumber,
    status: 'Available',
    createdAt: new Date(),
    createdBy,
    notes,
  };

  const updated = [...existingTags, tag];
  localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(updated));
  
  return tag;
};

/**
 * Allocate a tag to a job order
 */
export const allocateTagToJob = (
  tagId: string,
  jobOrderId: string,
  allocatedBy: string
): boolean => {
  const allTags = getAllTags();
  const tag = allTags.find(t => t.id === tagId);
  
  if (!tag) return false;
  if (tag.status !== 'Available') return false;
  
  tag.status = 'Allocated';
  tag.allocatedTo = jobOrderId;
  tag.allocatedAt = new Date();
  tag.allocatedBy = allocatedBy;
  
  localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(allTags));
  return true;
};

/**
 * Get tag by ID
 */
export const getTagById = (tagId: string): Tag | undefined => {
  return getAllTags().find(t => t.id === tagId);
};

/**
 * Get tag by tag number
 */
export const getTagByNumber = (tagNumber: string): Tag | undefined => {
  return getAllTags().find(t => t.tagNumber === tagNumber);
};

/**
 * Get tag allocated to a job order
 */
export const getTagForJob = (jobOrderId: string): Tag | undefined => {
  return getAllTags().find(t => t.allocatedTo === jobOrderId && t.status !== 'Removed');
};

/**
 * Report tag removal (removal detection)
 */
export const reportTagRemoval = (
  tagId: string,
  reportedBy: string
): boolean => {
  const allTags = getAllTags();
  const tag = allTags.find(t => t.id === tagId);
  
  if (!tag) return false;
  if (tag.status === 'Removed') return false; // Already reported
  
  tag.status = 'Removed';
  tag.removedAt = new Date();
  tag.removedBy = reportedBy;
  tag.removalReportedAt = new Date();
  
  localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(allTags));
  return true;
};

/**
 * Report tag removal by tag number (for traceability)
 */
export const reportTagRemovalByNumber = (
  tagNumber: string,
  reportedBy: string
): boolean => {
  const tag = getTagByNumber(tagNumber);
  if (!tag) return false;
  return reportTagRemoval(tag.id, reportedBy);
};

/**
 * Get available tags (not allocated or used)
 */
export const getAvailableTags = (): Tag[] => {
  return getAllTags().filter(t => t.status === 'Available');
};

/**
 * Get tags by status
 */
export const getTagsByStatus = (status: Tag['status']): Tag[] => {
  return getAllTags().filter(t => t.status === status);
};

/**
 * Get all removed tags (for removal detection tracking)
 */
export const getRemovedTags = (): Tag[] => {
  return getAllTags().filter(t => t.status === 'Removed');
};

/**
 * Mark tag as used (when job is completed)
 */
export const markTagAsUsed = (tagId: string): boolean => {
  const allTags = getAllTags();
  const tag = allTags.find(t => t.id === tagId);
  
  if (!tag) return false;
  if (tag.status !== 'Allocated') return false;
  
  tag.status = 'Used';
  
  localStorage.setItem(STORAGE_KEY_TAGS, JSON.stringify(allTags));
  return true;
};

