export const buildUrlWithParams = (baseUrl, params) => {
  let url = new URL(baseUrl);
  let searchParams = new URLSearchParams();

  const appendParams = (key, value) => {
    if (Array.isArray(value)) {
      // For arrays, append each value with the same key
      value.forEach((item) => {
        searchParams.append(key, item);
      });
    } else if (typeof value === "object" && value !== null) {
      // For nested objects, iterate through keys
      Object.keys(value).forEach((nestedKey) => {
        appendParams(`${key}.${nestedKey}`, value[nestedKey]);
      });
    } else {
      // For single values (strings, numbers), add to searchParams
      searchParams.set(key, value);
    }
  };

  // Iterate through the keys in the params object
  Object.keys(params).forEach((key) => {
    const value = params[key];
    // Include all values except null and undefined
    if (value !== null && value !== undefined) {
      appendParams(key, value);
    }
  });

  // Construct the final URL
  return `${url.origin}${url.pathname}?${searchParams.toString()}`;
};
