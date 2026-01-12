import { create } from "zustand";
import { useEffect } from "react";
import type { DependencyList } from "react";

export interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbState {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  clearBreadcrumbs: () => void;
}

const useBreadcrumbStore = create<BreadcrumbState>((set) => ({
  breadcrumbs: [],
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => {
    set({ breadcrumbs });
  },
  clearBreadcrumbs: () => {
    set({ breadcrumbs: [] });
  },
}));

export default useBreadcrumbStore;

/**
 * Hook to set breadcrumbs for a page
 * @param breadcrumbs - Array of breadcrumb items
 * @param deps - Optional dependency array to control when breadcrumbs update
 */
export function useBreadcrumb(
  breadcrumbs: BreadcrumbItem[],
  deps?: DependencyList
) {
  const setBreadcrumbs = useBreadcrumbStore((state) => state.setBreadcrumbs);
  const clearBreadcrumbs = useBreadcrumbStore(
    (state) => state.clearBreadcrumbs
  );

  useEffect(
    () => {
      setBreadcrumbs(breadcrumbs);
      return () => {
        clearBreadcrumbs();
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    deps ? [breadcrumbs, ...deps] : [breadcrumbs]
  );
}
