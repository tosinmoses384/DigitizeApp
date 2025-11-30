export const getEmptyStateCountLoader = (arrayLength: any) => {
  let getEmptyData = [];
  for (var i = 1; i <= arrayLength; i++) {
    getEmptyData.push({});
  }
  return getEmptyData;
};
