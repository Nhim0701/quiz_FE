// UI Text Constants
export const UI_TEXT = {
  // Buttons
  BUTTONS: {
    SIGN_IN: "Sign In",
    SIGNING_IN: "Signing In...",
    CREATE_ACCOUNT: "Create Account",
    CREATING_ACCOUNT: "Creating Account...",
    BACK_TO_DASHBOARD: "Back to Dashboard",
    TAKE_ANOTHER_TEST: "Take Another Test",
    FINISH_TEST: "Finish Test",
    SUBMITTING: "Submitting...",
    PREVIOUS: "Previous",
    PREV: "Prev",
    NEXT: "Next",
    FLAG: "Flag",
    CLOSE: "Close",
  },

  // Form Labels
  LABELS: {
    EMAIL_ADDRESS: "Email Address",
    PASSWORD: "Password",
    CONFIRM_PASSWORD: "Confirm Password",
    FULL_NAME: "Full Name",
  },

  // Placeholders
  PLACEHOLDERS: {
    EMAIL: "you@example.com",
    PASSWORD: "••••••••",
    NAME: "John Doe",
  },

  // Headers
  HEADERS: {
    TEST_COMPLETED: "Test Completed!",
    YOUR_ANSWERS: "Your Answers",
    PROGRESS: "Progress",
    QUESTIONS: "Questions",
  },

  // Status
  STATUS: {
    ANSWERED: "Answered",
    FLAGGED: "Flagged",
    NOT_ANSWERED: "Not answered",
    FLAGGED_LABEL: "Flagged",
    MULTIPLE_ANSWERS: "Multiple Answers",
  },

  // Explanations
  EXPLANATION: {
    SHOW: "Show Explanation",
    HIDE: "Hide Explanation",
    TITLE: "Explanation",
  },
} as const;

// Toast class names
export const TOAST_CLASSES = {
  ERROR: "toast-error",
  SUCCESS: "toast-success",
  INFO: "toast-info",
  WARNING: "toast-warning",
} as const;
