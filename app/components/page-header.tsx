import { Breadcrumb } from "./ui/breadcrumb";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  breadcrumbItems?: Array<{ label: string; href?: string }>;
  className?: string;
}

export function PageHeader({
  title,
  breadcrumbItems,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-2 mb-6", className)}>
      <Breadcrumb items={breadcrumbItems} />
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
    </div>
  );
}
