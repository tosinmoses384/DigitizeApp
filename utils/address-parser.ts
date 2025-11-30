/**
 * Address parsing utilities for shipping label functionality
 * These utilities help parse and format addresses according to API requirements
 */

/**
 * Parses a full address string into street number and street name components
 * This is required for shipping label API which expects separate streetNumber and streetName
 * 
 * @param address - Full address string (e.g., "123 Main Street" or "71 Oxford street")
 * @returns Object containing parsed streetNumber and streetName
 * 
 * @example
 * ```typescript
 * const result = parseAddressForSubmission("123 Main Street");
 * // Returns: { streetNumber: "123", streetName: "Main Street" }
 * 
 * const result2 = parseAddressForSubmission("71 Oxford street");
 * // Returns: { streetNumber: "71", streetName: "Oxford street" }
 * ```
 */
export const parseAddressForSubmission = (
  address: string
): { streetNumber: string; streetName: string } => {
  if (!address || typeof address !== 'string') {
    return { streetNumber: '', streetName: '' };
  }

  // Remove any non-digit characters from the start of the string
  const cleanedStreet = address.replace(/^[^0-9]+/, '').trim();

  // Match pattern: <number> <rest of address>
  const streetMatch = cleanedStreet.match(/^(\d+)\s+(.+)$/i);

  if (streetMatch) {
    return {
      streetNumber: streetMatch[1],
      streetName: streetMatch[2],
    };
  }

  // If no number found, return the whole address as streetName
  return {
    streetNumber: '',
    streetName: address,
  };
};

/**
 * Formats address components into a display string
 * Combines street number and street name into a single readable string
 * 
 * @param streetNumber - The street number portion
 * @param streetName - The street name portion
 * @returns Formatted address string
 * 
 * @example
 * ```typescript
 * const formatted = formatAddressDisplay("123", "Main Street");
 * // Returns: "123 Main Street"
 * ```
 */
export const formatAddressDisplay = (
  streetNumber: string,
  streetName: string
): string => {
  if (!streetNumber && !streetName) {
    return '';
  }

  if (!streetNumber) {
    return streetName;
  }

  if (!streetName) {
    return streetNumber;
  }

  return `${streetNumber} ${streetName}`.trim();
};

/**
 * Validates if an address string contains a street number
 * Used for form validation to ensure address has required components
 * 
 * @param address - Full address string to validate
 * @returns True if address contains a street number, false otherwise
 * 
 * @example
 * ```typescript
 * hasStreetNumber("123 Main St"); // true
 * hasStreetNumber("Main Street"); // false
 * ```
 */
export const hasStreetNumber = (address: string): boolean => {
  if (!address || typeof address !== 'string') {
    return false;
  }

  const cleanedStreet = address.replace(/^[^0-9]+/, '').trim();
  const streetMatch = cleanedStreet.match(/^(\d+)\s+/);

  return !!streetMatch;
};

/**
 * Capitalizes the first letter of each sentence in a string
 * Used for displaying addresses and names consistently
 * 
 * @param text - Text to capitalize
 * @returns Capitalized text
 * 
 * @example
 * ```typescript
 * capitalizeSentences("main street"); // "Main street"
 * capitalizeSentences("john doe"); // "John doe"
 * ```
 */
export const capitalizeSentences = (text: string | undefined | null): string => {
  if (!text) {
    return '';
  }

  return text.charAt(0).toUpperCase() + text.slice(1);
};

