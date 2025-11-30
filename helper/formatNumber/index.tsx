export const formatCurrency = (value: any) => {
  if (!value) return "";
  // Remove non-numeric characters
  const numericValue = value.replace(/[^0-9]/g, "");
  // Add commas for thousands separators
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
