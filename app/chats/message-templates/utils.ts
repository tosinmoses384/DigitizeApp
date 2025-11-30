/**
 * Helper function to safely get boolean value from metadata
 * @param value - The string value from metadata
 * @param defaultValue - Default boolean value if conversion fails
 */
export const getMessageCardStatus = (
  value: string | undefined,
  defaultValue: boolean = false
): boolean => {
  if (!value) return defaultValue;
  return value === "True" || value === "1";
};

/**
 * Helper function to check if metadata value equals false
 * @param value - The string value from metadata
 */
export const isMessageCardActive = (value: string | undefined): boolean => {
  if (!value) return true;
  return value === "True" || value === "1";
};

/**
 * Extract currency symbol with fallback logic
 */
export const getCurrencySymbol = (
  metadata: Record<string, any>,
  defaultCurrency: string
): string => {
  return (
    metadata?.order_currency_symbol ||
    metadata?.product_currency_symbol ||
    defaultCurrency
  );
};
