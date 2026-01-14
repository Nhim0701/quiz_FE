/**
 * Dialog mode constants
 */
export type FormDialogMode = "create" | "view" | "edit";

export const DIALOG_MODES = {
  CREATE: "create",
  VIEW: "view",
  EDIT: "edit",
} as const;
