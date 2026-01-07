// Error Messages
export const ERROR_MESSAGES = {
  // API Errors
  NETWORK_ERROR: "Network error: No response received from server",
  REQUEST_ERROR: "Request error",
  HTTP_ERROR: "HTTP error! status:",

  // Auth Errors
  LOGIN_FAILED: "Login failed. Please check your credentials.",
  REGISTRATION_FAILED: "Registration failed. Please try again.",
  FETCH_USER_FAILED: "Failed to fetch user:",
  SESSION_EXPIRED: "Session expired. Please login again.",

  // Data Fetch Errors
  FETCH_QUESTIONS_FAILED: "Failed to fetch questions. Please try again.",
  FETCH_DASHBOARD_FAILED: "Failed to fetch dashboard data. Please try again.",
  SUBMIT_RESPONSES_FAILED: "Failed to submit responses. Please try again.",

  // General
  GENERIC_ERROR: "Something went wrong. Please try again.",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: "Login successful!",
  REGISTRATION_SUCCESS: "Registration successful!",
  SUBMIT_SUCCESS: "Test submitted successfully!",
} as const;

// Info Messages
export const INFO_MESSAGES = {
  LOADING: "Loading...",
  NO_RESULT_DATA: "No result data. Please start a test from your profile.",
  NO_QUESTIONS: "No questions found for this test type.",
} as const;

