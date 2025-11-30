/**
 * Utility functions for color generation and management
 */

/**
 * Generates a consistent color for a given string ID using a hash function
 * @param id - The string ID to generate a color for (e.g., providerId)
 * @returns A hex color code
 */
export const getRandomColorCode = (id: string): string => {
  const colors = [
    "#EAC43E", // Yellow
    "#3ECBEA", // Blue
    "#3EEA5A", // Green
    "#EA3E7C", // Pink
    "#9B59B6", // Purple
    "#E67E22", // Orange
    "#1ABC9C", // Teal
    "#E74C3C", // Red
    "#34495E", // Dark Blue
    "#F39C12", // Amber
  ];
  
  // Use id to generate consistent color for each provider
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  const colorIndex = Math.abs(hash) % colors.length;
  return colors[colorIndex];
};

/**
 * Color palette used for random color generation
 */
export const COLOR_PALETTE = [
  "#EAC43E", // Yellow
  "#3ECBEA", // Blue
  "#3EEA5A", // Green
  "#EA3E7C", // Pink
  "#9B59B6", // Purple
  "#E67E22", // Orange
  "#1ABC9C", // Teal
  "#E74C3C", // Red
  "#34495E", // Dark Blue
  "#F39C12", // Amber
] as const;