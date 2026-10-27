// Centralized API client with credentials (cookies) and standardized error handling

export async function apiRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const config = {
    method: options.method || 'GET',
    headers,
    credentials: 'include', // Automatically transmit HttpOnly cookie across localhost
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const res = await fetch(url, config);
    let data = null;

    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    }

    if (!res.ok) {
      const errorMsg = data?.message || `Request failed with status ${res.status}`;
      const err = new Error(errorMsg);
      err.status = res.status;
      err.code = data?.code;
      err.data = data;
      throw err;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      // Backend is unreachable or network is down
      const networkError = new Error(
        'Unable to reach the PLAYARENA server. Please ensure the backend is running at http://localhost:5000 and MongoDB is connected.'
      );
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
}

// Convenience methods
export const api = {
  get: (url, options) => apiRequest(url, { ...options, method: 'GET' }),
  post: (url, body, options) => apiRequest(url, { ...options, method: 'POST', body }),
  put: (url, body, options) => apiRequest(url, { ...options, method: 'PUT', body }),
  delete: (url, options) => apiRequest(url, { ...options, method: 'DELETE' }),
};
