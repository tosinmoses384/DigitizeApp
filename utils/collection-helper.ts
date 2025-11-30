export function arrayRemoveDuplicatesByKey<T, K extends keyof T>(
  array: T[],
  key: K,
): T[] {
  const seen = new Set<T[K]>();
  return array.filter((item) => {
    const val = item[key];
    if (seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}

/*
  This function is to pad the data to be passed to a list component,
  in cases where items are to be rendered in multiple columns
 */
export function padFlatListData<T>(
  data: T[],
  numColumns: number = 2,
): (T | null)[] {
  const fullRows = Math.floor(data.length / numColumns);
  const itemsLastRow = data.length - fullRows * numColumns;

  if (itemsLastRow !== 0) {
    for (let i = itemsLastRow; i < numColumns; i++) {
      data.push({} as unknown as T); // pad with null
    }
  }

  return data;
}
