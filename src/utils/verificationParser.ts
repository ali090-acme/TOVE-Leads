/**
 * Three-Part Verification Code Parser
 * Parses structured verification codes like: VER-001-STK-001-CERT-001
 * Format: VER-{verificationId}-STK-{stickerId}-CERT-{certificateId}
 */

export interface ParsedVerificationCode {
  isValid: boolean;
  type: 'certificate-number' | 'three-part-code' | 'invalid';
  certificateNumber?: string;
  verificationId?: string;
  stickerId?: string;
  certificateId?: string;
  originalInput: string;
}

/**
 * Parse verification input to determine type and extract components
 */
export const parseVerificationInput = (input: string): ParsedVerificationCode => {
  const trimmed = input.trim();

  // Check if it's a three-part verification code format: VER-XXX-STK-XXX-CERT-XXX
  const threePartPattern = /^VER-(\d+)-STK-(\d+)-CERT-(\d+)$/i;
  const threePartMatch = trimmed.match(threePartPattern);

  if (threePartMatch) {
    const [, verificationId, stickerId, certificateId] = threePartMatch;
    
    // Extract certificate number from the certificate ID
    // Format: CERT-{certificateId} -> CERT-2025-{certificateId}
    const certificateNumber = `CERT-2025-${certificateId.padStart(3, '0')}`;

    return {
      isValid: true,
      type: 'three-part-code',
      certificateNumber,
      verificationId,
      stickerId,
      certificateId,
      originalInput: trimmed,
    };
  }

  // Check if it's a standard certificate number format: CERT-YYYY-XXX
  const certPattern = /^CERT-\d{4}-\d+$/i;
  if (certPattern.test(trimmed)) {
    return {
      isValid: true,
      type: 'certificate-number',
      certificateNumber: trimmed.toUpperCase(),
      originalInput: trimmed,
    };
  }

  // Invalid format
  return {
    isValid: false,
    type: 'invalid',
    originalInput: trimmed,
  };
};

/**
 * Extract certificate number from verification input
 * Handles both certificate numbers and three-part verification codes
 */
export const extractCertificateNumber = (input: string): string | null => {
  const parsed = parseVerificationInput(input);
  return parsed.certificateNumber || null;
};

/**
 * Format three-part code components into display string
 */
export const formatThreePartCode = (
  verificationId: string,
  stickerId: string,
  certificateId: string
): string => {
  return `VER-${verificationId}-STK-${stickerId}-CERT-${certificateId}`;
};

/**
 * Validate three-part code format
 */
export const isValidThreePartCode = (input: string): boolean => {
  const parsed = parseVerificationInput(input);
  return parsed.isValid && parsed.type === 'three-part-code';
};

