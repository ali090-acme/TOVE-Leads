import { Client, User } from '@/types';

const STORAGE_KEY_CLIENTS = 'clients';

/**
 * Check if a client already exists in the system (by email only)
 * Returns the existing client if found, null otherwise
 * This function does NOT reveal region/team information for confidentiality
 * Note: Only email is checked - same company name is allowed for different clients
 */
export const checkClientExists = (
  email: string
): { exists: boolean; clientId?: string } => {
  const stored = localStorage.getItem(STORAGE_KEY_CLIENTS);
  if (!stored) {
    return { exists: false };
  }

  try {
    const clients: Client[] = JSON.parse(stored);
    
    // Check for duplicate by email only (case-insensitive)
    const normalizeEmail = (email: string) => email.toLowerCase().trim();
    const emailMatch = clients.find(
      (c) => normalizeEmail(c.email) === normalizeEmail(email)
    );
    if (emailMatch) {
      return { exists: true, clientId: emailMatch.id };
    }

    return { exists: false };
  } catch (error) {
    console.error('Error checking client existence:', error);
    return { exists: false };
  }
};

/**
 * Get clients filtered by user's region/team
 * Regular users only see clients from their region/team
 * Admin users see all clients
 */
export const getFilteredClients = (currentUser: User | null): Client[] => {
  const stored = localStorage.getItem(STORAGE_KEY_CLIENTS);
  if (!stored) {
    return [];
  }

  try {
    const clients: Client[] = JSON.parse(stored);
    
    // Admin/GM can see all clients
    if (currentUser?.roles.includes('gm') || currentUser?.roles.includes('manager')) {
      return clients;
    }

    // Regular users see only clients from their region/team
    if (currentUser?.regionId) {
      return clients.filter((client) => {
        // If client has regions array, check if user's region is in it
        if ((client as any).regions && Array.isArray((client as any).regions)) {
          return (client as any).regions.includes(currentUser.regionId);
        }
        // Legacy: single regionId field
        return client.regionId === currentUser.regionId;
      });
    }

    // If user has no region assigned, return empty array
    return [];
  } catch (error) {
    console.error('Error filtering clients:', error);
    return [];
  }
};

/**
 * Check if current user is admin (can see all regions)
 */
export const isAdmin = (currentUser: User | null): boolean => {
  return currentUser?.roles.includes('gm') || currentUser?.roles.includes('manager') || false;
};

