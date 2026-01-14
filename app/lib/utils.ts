import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, fromUnixTime } from "date-fns";
import packageJson from "package.json";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format epoch unix timestamp to readable date string
 * @param timestamp Epoch unix timestamp in seconds
 * @param formatPattern Optional date-fns format pattern (default: "MMM d, yyyy 'at' HH:mm")
 * @returns Formatted date string
 */
export function formatUnixTimestamp(
  timestamp: number | null | undefined,
  formatPattern: string = "dd/MM/yyyy 'at' HH:mm"
): string | null {
  if (!timestamp) {
    return null;
  }

  try {
    return format(fromUnixTime(timestamp), formatPattern);
  } catch (error) {
    console.error("Failed to format timestamp:", error);
    return null;
  }
}

/**
 * Get initials from a full name
 * @param fullName The full name to extract initials from
 * @param maxLength Maximum number of characters to return (default: 2)
 * @returns Uppercase initials string
 */
export function getInitials(
  fullName: string | null | undefined,
  maxLength: number = 2
): string {
  if (!fullName || !fullName.trim()) {
    return "";
  }

  const initials = fullName
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return initials.slice(0, maxLength);
}

/**
 * Create page meta function with formatted title
 * @param pageTitle The page title
 * @returns Meta function that returns array with formatted title in format: "HEL - <page-title>"
 */
export function pageMeta(pageTitle: string) {
  return () => [
    {
      title: `${packageJson.name.toUpperCase()} - ${pageTitle}`,
    },
  ];
}
