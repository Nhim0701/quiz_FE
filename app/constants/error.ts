// API Endpoints
export const ERROR = {
  // Auth endpoints
  INCORRECT_EMAIL_OR_PASSWORD: {
    CODE: "INCORRECT_EMAIL_OR_PASSWORD",
    MESSAGE_KEY: "errors.loginFailed",
  },
  // HTTP Status Codes
  PERMISSION_DENIED: {
    CODE: "PERMISSION_DENIED",
    MESSAGE_KEY: "errors.permissionDenied",
  },
} as const;
