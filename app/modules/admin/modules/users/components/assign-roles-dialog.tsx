import { useEffect, useState } from "react";
import { useTranslation, type TranslationParams } from "@/i18n";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useApp } from "@/hooks";
import { useUsersStore, type User } from "../hooks";
import { useRolesStore } from "@/modules/admin/modules/roles-permissions/hooks";
import { Loader2, X } from "lucide-react";

interface AssignRolesDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignRolesDialog({
  user,
  open,
  onOpenChange,
}: AssignRolesDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useApp();
  const { assignRoles, loading } = useUsersStore();
  const { fetchRoles, roles, loading: rolesLoading } = useRolesStore();
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      fetchRoles(1, 100);
      // Initialize with user's current roles if available
      if (user?.permissions) {
        // Assuming permissions contains role IDs or we need to map them
        // This might need adjustment based on actual API response structure
        setSelectedRoleIds(user.permissions || []);
      } else {
        setSelectedRoleIds([]);
      }
    }
  }, [open, user, fetchRoles]);

  const handleClose = () => {
    setSelectedRoleIds([]);
    onOpenChange(false);
  };

  const handleToggleRole = (roleId: string) => {
    setSelectedRoleIds((prev) =>
      prev.includes(roleId)
        ? prev.filter((id) => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      await assignRoles(user.id, selectedRoleIds);
      showSuccess(t("admin.users.assignRoles.success"));
      handleClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.genericError");
      showError(errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("admin.users.assignRoles.title")}</DialogTitle>
          <DialogDescription>
            {t("admin.users.assignRoles.description", {
              name: user?.fullName || "",
            } as TranslationParams<"admin.users.assignRoles.description">)}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-4">
          {rolesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : roles.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              {t("admin.users.assignRoles.noRoles")}
            </p>
          ) : (
            <div className="space-y-3">
              {roles.map((role) => (
                <div
                  key={role.id}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-accent transition-colors"
                >
                  <Checkbox
                    id={role.id}
                    checked={selectedRoleIds.includes(role.id)}
                    onCheckedChange={() => handleToggleRole(role.id)}
                    disabled={loading}
                  />
                  <label
                    htmlFor={role.id}
                    className="flex-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {role.name}
                    {role.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {role.description}
                      </p>
                    )}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClose}
            disabled={loading || rolesLoading}
          >
            <X className="mr-2 h-4 w-4" />
            {t("common.cancel")}
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={loading || rolesLoading}
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-600 dark:to-green-700 dark:hover:from-emerald-700 dark:hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t("admin.users.assignRoles.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
