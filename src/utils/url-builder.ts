/**
 * Builds a full URL from a base URL template, path parameters, and query parameters.
 *
 * @param baseUrl - Server base URL (e.g., 'https://api.example.com/v1')
 * @param path - Path template (e.g., '/pets/{petId}')
 * @param pathParams - Values for path parameters
 * @param queryParams - Values for query string parameters
 * @returns Fully resolved URL string
 */
export function buildUrl(
  baseUrl: string,
  path: string,
  pathParams: Record<string, string> = {},
  queryParams: Record<string, string> = {},
): string {
  // Replace path parameters
  let resolvedPath = path;
  for (const [name, value] of Object.entries(pathParams)) {
    if (value) {
      resolvedPath = resolvedPath.replace(
        new RegExp(`\\{${name}\\}`, 'g'),
        encodeURIComponent(value),
      );
    }
  }

  // Combine base URL and path
  const base = baseUrl.replace(/\/+$/, '');
  const cleanPath = resolvedPath.startsWith('/') ? resolvedPath : `/${resolvedPath}`;
  let url = `${base}${cleanPath}`;

  // Add query parameters
  const queryEntries = Object.entries(queryParams).filter(
    ([, value]) => value !== '',
  );
  if (queryEntries.length > 0) {
    const params = new URLSearchParams();
    for (const [key, value] of queryEntries) {
      params.set(key, value);
    }
    url += `?${params.toString()}`;
  }

  return url;
}
