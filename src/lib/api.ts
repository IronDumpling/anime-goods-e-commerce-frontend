interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
}

// This function should be used outside of React components
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
    const response = await fetch(`/api${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        error: data?.message || 'An error occurred',
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
      error: 'Network error',
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
export const del = <T>(endpoint: string) => apiRequest<T>(endpoint, { method: 'DELETE' });