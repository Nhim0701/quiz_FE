import * as React from "react";

export interface ColumnMeta {
  center?: boolean;
}

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  meta?: ColumnMeta;
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

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  actions?: Action<T>[];
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  scroll?: boolean | ScrollConfig;
  actionDisplay?: "dropdown" | "buttons";
}

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  pageSizeOptions?: number[];
}
