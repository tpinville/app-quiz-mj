const API_BASE = '/api';

let getToken = () => localStorage.getItem('token');

// Allow setting a custom token getter (for use with AuthContext)
export function setTokenGetter(getter) {
  getToken = getter;
}

async function handleResponse(response) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Une erreur est survenue');
  }
  return data;
}

function getHeaders(includeAuth = true, includeContentType = true) {
  const headers = {};

  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

const apiClient = {
  get: async (endpoint, { auth = true } = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers: getHeaders(auth, false)
    });
    return handleResponse(response);
  },

  post: async (endpoint, data, { auth = true } = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'POST',
      headers: getHeaders(auth),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  put: async (endpoint, data, { auth = true } = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'PUT',
      headers: getHeaders(auth),
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  delete: async (endpoint, { auth = true } = {}) => {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      method: 'DELETE',
      headers: getHeaders(auth, false)
    });
    // DELETE might return 204 No Content
    if (response.status === 204) {
      return null;
    }
    return handleResponse(response);
  }
};

export default apiClient;
