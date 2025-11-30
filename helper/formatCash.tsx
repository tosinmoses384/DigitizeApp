export const formatAmount = (amount: number, currency?: any) => {
  let formattedAmount = amount?.toFixed(0);

  let parts = formattedAmount?.split(".");

  parts[0] = parts[0]?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return `${currency?.toUpperCase() || ""} ${parts.join(".")}`;
};
