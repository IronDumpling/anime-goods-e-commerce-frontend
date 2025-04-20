export interface ApiError {
  error: string;
  details?: Array<string>;
}

interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
  status: number;
}

export const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        error: {
          error: data?.error || 'Unknown error',
          details: data?.details
        },
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    console.error('API request error:', error);
    return {
      error: {
        error: error instanceof Error ? error.message : 'Network error',
        details: ['Failed to connect to the server. Please check your internet connection.']
      },
      status: 0,
    };
  }
};

// Helper functions for common API operations
export const get = <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'GET' });
export const post = <T>(endpoint: string, body: any) =>
  apiRequest<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });
export const put = <T>(endpoint: string, body: any) =>
  apiRequest<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) });
export const patch = <T>(endpoint: string, body: any) =>
  apiRequest<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
export const del = <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' });