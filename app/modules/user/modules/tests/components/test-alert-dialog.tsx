import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ACTION_VARIANT_CLASSES = {
  default: "",
  destructive:
    "bg-gradient-to-r from-red-500 to-rose-600 dark:from-red-500 dark:to-rose-500 text-white border-0 hover:from-red-600 hover:to-rose-700 dark:hover:from-red-600 dark:hover:to-rose-600 shadow-sm",
  amber:
    "bg-gradient-to-r from-amber-500 to-yellow-600 dark:from-amber-500 dark:to-yellow-500 text-white border-0 hover:from-amber-600 hover:to-yellow-700 dark:hover:from-amber-600 dark:hover:to-yellow-600 shadow-sm",
  green:
    "bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-500 dark:to-emerald-500 text-white border-0 hover:from-green-600 hover:to-emerald-700 dark:hover:from-green-600 dark:hover:to-emerald-600 shadow-sm",
} as const;

export type TestAlertDialogActionVariant =
  keyof typeof ACTION_VARIANT_CLASSES;

export interface TestAlertDialogAction {
  label: string;
  onClick: () => void;
  variant?: TestAlertDialogActionVariant;
  disabled?: boolean;
}

interface TestAlertDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description: React.ReactNode;
  cancelLabel?: string;
  actions: TestAlertDialogAction[];
}

export function TestAlertDialog({
  open,
  onOpenChange,
  title,
  description,
  cancelLabel,
  actions,
}: TestAlertDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {cancelLabel && (
            <AlertDialogCancel>{cancelLabel}</AlertDialogCancel>
          )}
          {actions.map(({ label, onClick, variant = "default", disabled }) => (
            <AlertDialogAction
              key={label}
              onClick={onClick}
              disabled={disabled}
              className={ACTION_VARIANT_CLASSES[variant] || undefined}
            >
              {label}
            </AlertDialogAction>
          ))}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
