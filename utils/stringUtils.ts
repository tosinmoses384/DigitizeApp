/**
 * String utility functions for text manipulation and formatting
 */

/**
 * Capitalizes the first letter of a string and converts the rest to lowercase
 * 
 * @param text - The string to capitalize
 * @returns The capitalized string
 * 
 * @example
 * ```typescript
 * capitalizeFirstLetter("royal mail"); // "Royal mail"
 * capitalizeFirstLetter("EVRI"); // "Evri"
 * capitalizeFirstLetter("dhl"); // "Dhl"
 * ```
 */
export const capitalizeFirstLetter = (text: string): string => {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

/**
 * Capitalizes the first letter of each word in a string
 * 
 * @param text - The string to title case
 * @returns The title cased string
 * 
 * @example
 * ```typescript
 * toTitleCase("royal mail express"); // "Royal Mail Express"
 * toTitleCase("next day delivery"); // "Next Day Delivery"
 * ```
 */
export const toTitleCase = (text: string): string => {
  if (!text) return text;
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
