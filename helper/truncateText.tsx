export const truncateByCharacters = (text: string, maxLength: any) => {
  return text?.length > maxLength ? text?.slice(0, maxLength) + "..." : text;
};
