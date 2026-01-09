import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, fromUnixTime } from "date-fns";

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
