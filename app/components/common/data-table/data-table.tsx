import { cn } from "@/lib/utils";
import type { DataTableProps } from "./types";
import { ActionButtons } from "./action-buttons";
import { ActionDropdown } from "./action-dropdown";

export function DataTable<T extends { id: string | number }>({
  columns,
  data,
  actions,
  loading = false,
  emptyMessage = "No data available",
  className,
  scroll = false,
  actionDisplay = "buttons",
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="w-full">
        <div className="rounded-lg border bg-card shadow-sm">
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

  if (data.length === 0) {
    return (
      <div className="w-full">
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-12 text-center">
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          </div>
        </div>
      </div>
    );
  }

  const tableContent = (
    <table className="w-full border-collapse">
      <thead className={scroll ? "sticky top-0 z-10" : ""}>
        <tr className="border-b border-border bg-muted/30">
          {columns.map((column) => (
            <th
              key={column.key}
              className={cn(
                "h-12 px-4 align-middle text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                column.meta?.center ? "text-center" : "text-left",
                column.className
              )}
            >
              {column.header}
            </th>
          ))}
          {actions && actions.length > 0 && (
            <th
              className={cn(
                "h-12 px-4 text-right align-middle text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                actionDisplay === "dropdown" ? "w-[70px]" : "w-auto"
              )}
            >
              Actions
            </th>
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-border bg-card">
        {data.map((item, rowIndex) => (
          <tr
            key={item.id}
            className="border-b border-border transition-colors hover:bg-muted/30"
          >
            {columns.map((column) => (
              <td
                key={column.key}
                className={cn(
                  "px-4 py-3 align-middle text-sm text-foreground",
                  column.meta?.center && "text-center",
                  column.className
                )}
              >
                {column.render
                  ? column.render(item)
                  : (() => {
                      const value = (item as Record<string, unknown>)[
                        column.key
                      ];
                      return value != null ? String(value) : "";
                    })()}
              </td>
            ))}
            {actions && actions.length > 0 && (
              <td className="px-4 py-3 align-middle text-right">
                {actionDisplay === "dropdown" ? (
                  <ActionDropdown actions={actions} item={item} />
                ) : (
                  <ActionButtons actions={actions} item={item} />
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
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
        </div>
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">{tableContent}</div>
      </div>
    </div>
  );
}
