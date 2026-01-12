"use client";

import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ActionButtons } from "./action-buttons";
import { ActionDropdown } from "./action-dropdown";
import { Pagination } from "./pagination";
import type { Column, DataTableProps } from "./types";
import { convertColumnToColumnDef } from "./types";

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  actions,
  loading = false,
  emptyMessage = "No data available",
  className,
  scroll = false,
  actionDisplay = "buttons",
  pagination,
}: DataTableProps<T>) {
  // Convert legacy Column to ColumnDef if needed and add actions column
  const tableColumns = React.useMemo<ColumnDef<T>[]>(() => {
    // Check if columns are legacy Column type or ColumnDef
    const isLegacyColumn = columns.length > 0 && "key" in columns[0];

    const convertedColumns: ColumnDef<T>[] = isLegacyColumn
      ? (columns as Column<T>[]).map((col) => convertColumnToColumnDef<T>(col))
      : (columns as ColumnDef<T>[]);

    // Add actions column if actions are provided
    if (actions && actions.length > 0) {
      convertedColumns.push({
        id: "actions",
        enableHiding: false,
        cell: ({ row }) => {
          return (
            <div className="text-right">
              {actionDisplay === "dropdown" ? (
                <ActionDropdown actions={actions} item={row.original} />
              ) : (
                <ActionButtons actions={actions} item={row.original} />
              )}
            </div>
          );
        },
        header: () => <div className="text-right">Actions</div>,
        meta: {
          className: actionDisplay === "dropdown" ? "w-[70px]" : "w-auto",
        },
      } as ColumnDef<T>);
    }

    return convertedColumns;
  }, [columns, actions, actionDisplay]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (loading) {
    return (
      <div className={cn("w-full", className)}>
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-2 text-muted-foreground">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              <span className="text-sm font-medium">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tableContent = (
    <Table>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const meta = header.column.columnDef.meta as
                | { className?: string; center?: boolean }
                | undefined;
              return (
                <TableHead
                  key={header.id}
                  className={cn(meta?.center && "text-center", meta?.className)}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              data-state={row.getIsSelected() && "selected"}
            >
              {row.getVisibleCells().map((cell) => {
                const meta = cell.column.columnDef.meta as
                  | { className?: string; center?: boolean }
                  | undefined;
                return (
                  <TableCell
                    key={cell.id}
                    className={cn(
                      meta?.center && "text-center",
                      meta?.className
                    )}
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                );
              })}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell
              colSpan={tableColumns.length}
              className="h-24 text-center text-sm text-muted-foreground"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  if (scroll) {
    const scrollConfig =
      typeof scroll === "object" ? scroll : { maxHeight: 500 };
    const maxHeight = scrollConfig.maxHeight ?? 500;

    return (
      <div className={cn("w-full", className)}>
        <div className="rounded-lg border border-border bg-card shadow-sm">
          <div
            className="overflow-auto"
            style={{ maxHeight: `${maxHeight}px` }}
          >
            {tableContent}
          </div>
          {pagination && (
            <Pagination
              page={pagination.page}
              pageSize={pagination.pageSize}
              total={pagination.total}
              onPageChange={pagination.onPageChange}
              onPageSizeChange={pagination.onPageSizeChange}
              pageSizeOptions={pagination.pageSizeOptions}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">{tableContent}</div>
        {pagination && (
          <Pagination
            page={pagination.page}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onPageChange={pagination.onPageChange}
            onPageSizeChange={pagination.onPageSizeChange}
            pageSizeOptions={pagination.pageSizeOptions}
          />
        )}
      </div>
    </div>
  );
}
