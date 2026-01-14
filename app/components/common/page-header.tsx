import { cn } from "@/lib";

interface PageHeaderProps {
  title: string;
  className?: string;
}

export function PageHeader({ title, className }: PageHeaderProps) {
  return (
    <div className={cn("space-y-2 mb-6", className)}>
      <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
    </div>
  );
}
