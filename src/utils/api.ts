// API utility for backend communication
// Use empty string to use relative URLs (Vite proxy will forward to backend)
const API_BASE_URL = 'https://harinezumi.myddns.me';

interface UserData {
  email: string;
  name: string;
  password: string;
}

interface Credentials {
  email: string;
  password: string;
}

interface AuthResponse {
  access_token?: string;
  [key: string]: unknown;
}

interface UserResponse {
  account_name: string;
  user_email: string;
  [key: string]: unknown;
}

interface ResponseItem {
  question_id: number;
  selected_options: number[];
  [key: string]: unknown;
}

// Token management
export const tokenManager = {
  getToken: (): string | null => localStorage.getItem('access_token'),
  setToken: (token: string): void => localStorage.setItem('access_token', token),
  removeToken: (): void => localStorage.removeItem('access_token'),
  hasToken: (): boolean => !!localStorage.getItem('access_token'),
};

// Base fetch wrapper with error handling
async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = tokenManager.getToken();

  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);
    const data = await response.json() as T & { detail?: string };

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
  register: async (userData: UserData): Promise<AuthResponse> => {
    const response = await apiFetch<AuthResponse>('/api/v1/auth/register', {
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

  login: async (credentials: Credentials): Promise<AuthResponse> => {
    const response = await apiFetch<AuthResponse>('/api/v1/auth/login', {
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

  logout: (): void => {
    tokenManager.removeToken();
  },
};

// User APIs
export const userAPI = {
  getCurrentUser: async (): Promise<UserResponse> => {
    return apiFetch<UserResponse>('/api/v1/users/me');
  },
};

// Question APIs
export const questionAPI = {
  getCategories: async (): Promise<unknown[]> => {
    return apiFetch<unknown[]>('/api/v1/questions/categories');
  },
  getCategoriesWithSets: async (): Promise<unknown[]> => {
    return apiFetch<unknown[]>('/api/v1/questions/categories-with-sets');
  },
  getQuestionsByCategory: async (category: string): Promise<unknown[]> => {
    return apiFetch<unknown[]>(`/api/v1/questions/by-category/${category}`);
  },
  getQuestionsByCategoryAndSet: async (category: string, questionSet: string): Promise<unknown[]> => {
    return apiFetch<unknown[]>(`/api/v1/questions/by-category/${category}/set/${questionSet}`);
  },
};

// Response APIs
export const responseAPI = {
  getDashboard: async (): Promise<unknown> => {
    return apiFetch('/api/v1/responses/dashboard');
  },
  submitBulk: async (responses: ResponseItem[]): Promise<unknown> => {
    return apiFetch('/api/v1/responses/submit-bulk', {
      method: 'POST',
      body: JSON.stringify({ responses }),
    });
  },
};

export default apiFetch;

