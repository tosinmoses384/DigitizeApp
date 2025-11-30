/* Pinterest image URLs (like https://i.pinimg.com/originals/...) are CDN-protected.
  When you try to load them directly, the request is rejected with 403: Access Denied.
  So you rewrite the URL to "564x" if it contains "originals"
 */
export const normalizePinterestUrl = (url: string): string => {
  if (url.includes("/originals/")) {
    return url.replace("/originals/", "/564x/");
  }
  return url;
};

export const getFileNameFromUrl = (url: string | null | undefined): string | null => {
  if (!url) {
    return null;
  }

  const [pathWithoutQuery] = url.split("?");

  if (!pathWithoutQuery) {
    return 'null';
  }

  const segments = pathWithoutQuery.split("/");
  const lastSegment = segments[segments.length - 1];

  if (!lastSegment) {
    return 'null';
  }

  return lastSegment;
};

