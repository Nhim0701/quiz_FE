/**
 * Pagination constants
 */

export const DEFAULT_PAGE_SIZE = 10;

export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

export const MAX_PAGE_SIZE_FOR_ALL = 1000;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  MAX_PAGE_SIZE_FOR_ALL,
  MAX_VISIBLE_PAGES: 3, // Number of page buttons to show around current page
} as const;
