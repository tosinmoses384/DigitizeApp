export const getInitials = (name: string) => {
  if (!name) return ""; // Handle empty or undefined name
  const words = name.trim().split(" ");
  return words
    .map((word) => word.charAt(0).toUpperCase()) // Take the first character and make it uppercase
    .join("");
};
