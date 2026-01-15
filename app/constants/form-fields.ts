import {
  User,
  Mail,
  Lock,
  Phone,
  Hash,
  FileText,
  Key,
  Tag,
  Folder,
  Calendar,
  type LucideIcon,
} from "lucide-react";

// Form field icon colors
export const FORM_FIELD_COLORS = {
  BLUE: "text-blue-500 dark:text-blue-400",
  EMERALD: "text-emerald-500 dark:text-emerald-400",
  PURPLE: "text-purple-500 dark:text-purple-400",
  GREEN: "text-green-500 dark:text-green-400",
} as const;

// Form field error styles
export const FORM_FIELD_ERROR_CLASSES = {
  INPUT:
    "!ring-1 !ring-red-500 dark:!ring-red-600 focus-visible:!ring-red-500 dark:focus-visible:!ring-red-600 !text-red-600 dark:!text-red-400",
  TEXT: "mt-1 text-xs text-red-600 dark:text-red-400",
  REQUIRED_MARKER: "text-red-500 dark:text-red-400 ml-1",
} as const;

// Form field label styles
export const FORM_FIELD_LABEL_CLASSES = {
  BASE: "text-xs text-slate-500 dark:text-slate-400 flex",
  CONTAINER: "flex items-center gap-2",
} as const;

// Form field input styles
export const FORM_FIELD_INPUT_CLASSES = {
  BASE: "mt-2",
} as const;

// Icon configuration type
export interface IconConfig {
  Icon: LucideIcon;
  color: string;
}

// Field ID patterns for icon matching
export const FIELD_ID_PATTERNS = {
  PHONE: "phone",
  NUMBER: "number",
  NAME: "name",
  NAMESPACE: "namespace",
  PERMISSION: "permission",
  KEY: "key",
  DESCRIPTION: "description",
  CATEGORY: "category",
  TAG: "tag",
  PREFIX: "prefix",
  DATE: "date",
  BIRTHDAY: "birthday",
} as const;

// Icon mapping configuration
export const FIELD_ICON_MAP: Array<{
  match: (id: string, type?: string) => boolean;
  config: IconConfig;
}> = [
  // Type-based matches (higher priority)
  {
    match: (_, type) => type === "email",
    config: { Icon: Mail, color: FORM_FIELD_COLORS.BLUE },
  },
  {
    match: (_, type) => type === "password",
    config: { Icon: Lock, color: FORM_FIELD_COLORS.BLUE },
  },
  {
    match: (id, type) => type === "tel" || id.includes(FIELD_ID_PATTERNS.PHONE),
    config: { Icon: Phone, color: FORM_FIELD_COLORS.BLUE },
  },
  {
    match: (id, type) =>
      type === "number" || id.includes(FIELD_ID_PATTERNS.NUMBER),
    config: { Icon: Hash, color: FORM_FIELD_COLORS.BLUE },
  },
  // ID-based matches
  {
    match: (id) =>
      id.includes(FIELD_ID_PATTERNS.NAME) &&
      !id.includes(FIELD_ID_PATTERNS.NAMESPACE),
    config: { Icon: User, color: FORM_FIELD_COLORS.EMERALD },
  },
  {
    match: (id) =>
      id.includes(FIELD_ID_PATTERNS.PERMISSION) ||
      id.includes(FIELD_ID_PATTERNS.KEY),
    config: { Icon: Key, color: FORM_FIELD_COLORS.PURPLE },
  },
  {
    match: (id) => id.includes(FIELD_ID_PATTERNS.DESCRIPTION),
    config: { Icon: FileText, color: FORM_FIELD_COLORS.PURPLE },
  },
  {
    match: (id) => id.includes(FIELD_ID_PATTERNS.CATEGORY),
    config: { Icon: Folder, color: FORM_FIELD_COLORS.GREEN },
  },
  {
    match: (id) =>
      id.includes(FIELD_ID_PATTERNS.TAG) ||
      id.includes(FIELD_ID_PATTERNS.PREFIX),
    config: { Icon: Tag, color: FORM_FIELD_COLORS.BLUE },
  },
  {
    match: (id) =>
      id.includes(FIELD_ID_PATTERNS.DATE) ||
      id.includes(FIELD_ID_PATTERNS.BIRTHDAY),
    config: { Icon: Calendar, color: FORM_FIELD_COLORS.BLUE },
  },
  // Default fallback
  {
    match: () => true,
    config: { Icon: FileText, color: FORM_FIELD_COLORS.BLUE },
  },
];
