// Define a constant for the API base URL
export const API_BASE_URL = 'https://webhookservice-production.up.railway.app';

// Helper function to construct valid API URLs that avoid double-slash issues
export function buildApiUrl(path: string, queryParams: Record<string, string | number> = {}): string {
  // Ensure path starts with a slash but the base URL doesn't end with one
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const baseUrl = API_BASE_URL.endsWith('/')
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  
  // Combine base URL and path
  let url = `${baseUrl}${normalizedPath}`;
  
  // Add query parameters if provided
  if (Object.keys(queryParams).length > 0) {
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });
    url += `?${searchParams.toString()}`;
  }
  
  return url;
}

// Standardized fetch function with proper error handling
export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {},
  queryParams: Record<string, string | number> = {}
): Promise<T> {
  const url = buildApiUrl(path, queryParams);
  
  // Set default headers if not provided
  if (!options.headers) {
    options.headers = {
      'Content-Type': 'application/json',
    };
  }
  
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      // Try to parse error response
      let errorMessage;
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || `HTTP error: ${response.status}`;
      } catch {
        errorMessage = `HTTP error: ${response.status}`;
      }
      throw new Error(errorMessage);
    }
    
    // Check if response is empty (e.g. 204 No Content)
    if (response.status === 204) {
      return {} as T;
    }
    
    return await response.json() as T;
  } catch (error) {
    console.error('API fetch error:', error);
    throw error;
  }
} 