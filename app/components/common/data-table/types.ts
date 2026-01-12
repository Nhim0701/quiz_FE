import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";

export interface ColumnMeta {
  center?: boolean;
  className?: string;
}

// Legacy Column type for backward compatibility
// Will be converted to ColumnDef internally
export interface Column<T> {
  key: string;
  header: string | React.ReactNode;
  render?: (item: T) => React.ReactNode;
  className?: string;
  meta?: ColumnMeta;
}

// Helper function to convert legacy Column to ColumnDef
export function convertColumnToColumnDef<T extends { id: string | number }>(
  column: Column<T>
): ColumnDef<T> {
  return {
    accessorKey: column.key,
    header:
      typeof column.header === "string"
        ? column.header
        : () => column.header as React.ReactNode,
    cell: column.render
      ? ({ row }) => column.render!(row.original)
      : ({ row }) => {
          const value = (row.original as Record<string, unknown>)[column.key];
          return value != null ? String(value) : "";
        },
    meta: {
      ...column.meta,
      className: column.className || column.meta?.className,
    },
  };
}

export interface Action<T> {
  label: string;
  onClick: (item: T) => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost";
  icon?: React.ReactNode;
}

export interface ScrollConfig {
  maxHeight?: number;
}

export interface DataTableProps<T extends { id: string | number }> {
  columns: ColumnDef<T>[] | Column<T>[];
  data: T[];
  actions?: Action<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  scroll?: boolean | ScrollConfig;
  actionDisplay?: "dropdown" | "buttons";
  pagination?: PaginationProps;
}

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: readonly number[];
}
