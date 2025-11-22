// API utility for backend communication
// Use empty string to use relative URLs (Vite proxy will forward to backend)
const API_BASE_URL = '';

// Token management
export const tokenManager = {
  getToken: () => localStorage.getItem('access_token'),
  setToken: (token) => localStorage.setItem('access_token', token),
  removeToken: () => localStorage.removeItem('access_token'),
  hasToken: () => !!localStorage.getItem('access_token'),
};

// Base fetch wrapper with error handling
async function apiFetch(url, options = {}) {
  const token = tokenManager.getToken();

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// Authentication APIs
export const authAPI = {
  register: async (userData) => {
    const response = await apiFetch('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        user_email: userData.email,
        account_name: userData.name,
        user_password: userData.password,
      }),
    });

    // Store token on successful registration
    if (response.access_token) {
      tokenManager.setToken(response.access_token);
    }

    return response;
  },

  login: async (credentials) => {
    const response = await apiFetch('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        user_email: credentials.email,
        user_password: credentials.password,
      }),
    });

    // Store token on successful login
    if (response.access_token) {
      tokenManager.setToken(response.access_token);
    }

    return response;
  },

  logout: () => {
    tokenManager.removeToken();
  },
};

// User APIs
export const userAPI = {
  getCurrentUser: async () => {
    return apiFetch('/api/v1/users/me');
  },
};

// Question APIs
export const questionAPI = {
  getCategories: async () => {
    return apiFetch('/api/v1/questions/categories');
  },
  getCategoriesWithSets: async () => {
    return apiFetch('/api/v1/questions/categories-with-sets');
  },
  getQuestionsByCategory: async (category) => {
    return apiFetch(`/api/v1/questions/by-category/${category}`);
  },
  getQuestionsByCategoryAndSet: async (category, questionSet) => {
    return apiFetch(`/api/v1/questions/by-category/${category}/set/${questionSet}`);
  },
};

// Response APIs
export const responseAPI = {
  getDashboard: async () => {
    return apiFetch('/api/v1/responses/dashboard');
  },
  submitBulk: async (responses) => {
    return apiFetch('/api/v1/responses/submit-bulk', {
      method: 'POST',
      body: JSON.stringify({ responses }),
    });
  },
};

export default apiFetch;
