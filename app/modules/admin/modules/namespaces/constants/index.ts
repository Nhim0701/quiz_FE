export const ROUTES = {
  INDEX: "/admin/namespaces",
} as const;

export const ENDPOINTS = {
  LIST: "/api/v1/namespaces",
  GET: (id: string) => `/api/v1/namespaces/${id}`,
  CREATE: "/api/v1/namespaces",
  UPDATE: (id: string) => `/api/v1/namespaces/${id}`,
  DELETE: (id: string) => `/api/v1/namespaces/${id}`,
};
