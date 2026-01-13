import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib";
import { useApp } from "@/hooks";

export function AppDialog() {
  const {
    isDialogOpen,
    dialogTitle,
    dialogTitleClassName,
    dialogContent,
    dialogContentContainerClassName,
    dialogFooter,
    dialogFooterContainerClassName,
    closeDialog,
  } = useApp();

  return (
    <AlertDialog
      open={isDialogOpen}
      onOpenChange={(open) => !open && closeDialog()}
    >
      <AlertDialogContent>
        {dialogTitle && (
          <AlertDialogHeader>
            <AlertDialogTitle className={cn(dialogTitleClassName)}>
              {dialogTitle}
            </AlertDialogTitle>
          </AlertDialogHeader>
        )}
        {dialogContent && (
          <div className={cn("py-4", dialogContentContainerClassName)}>
            {dialogContent}
          </div>
        )}
        {dialogFooter && (
          <AlertDialogFooter className={cn(dialogFooterContainerClassName)}>
            {dialogFooter}
          </AlertDialogFooter>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}
