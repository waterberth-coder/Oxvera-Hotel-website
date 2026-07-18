/**
 * Resolves the absolute backend API URL.
 * Falls back to relative paths for local development and unified server deployment.
 */
export const getApiUrl = (path: string): string => {
  const apiBase = ((import.meta as any).env?.VITE_API_URL as string) || '';
  // Ensure we don't double slash
  const cleanBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${cleanBase}${cleanPath}`;
};
