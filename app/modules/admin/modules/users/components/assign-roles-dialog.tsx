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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Label } from "@/components/ui/label";
import { useApp } from "@/hooks";
import { useUsersStore, type User } from "../hooks";
import { useRolesStore } from "@/modules/admin/modules/roles-permissions/hooks";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  const [selectedRoleId, setSelectedRoleId] = useState<string>("");
  const [comboboxOpen, setComboboxOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchRoles(1, 100);
      // Initialize with user's current roleId if available
      setSelectedRoleId(user?.roleId || "");
    }
  }, [open, user, fetchRoles]);

  const handleClose = () => {
    setSelectedRoleId("");
    setComboboxOpen(false);
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    if (!user) return;

    try {
      await assignRoles(user.id, selectedRoleId);
      showSuccess(t("admin.users.assignRoles.success"));
      handleClose();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.genericError");
      showError(errorMessage);
    }
  };

  const roleOptions = roles.map((role) => ({
    value: role.id,
    label: role.name,
  }));

  const selectedRole = roles.find((role) => role.id === selectedRoleId);
  const displayValue = selectedRole?.name || t("common.selectPlaceholder");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
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
            <div className="space-y-2">
              <Label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                {t("admin.users.assignRoles.roleLabel")}
              </Label>
              <Popover
                open={comboboxOpen}
                onOpenChange={setComboboxOpen}
                modal={true}
              >
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className={cn(
                      "w-full justify-between",
                      !selectedRoleId && "text-muted-foreground"
                    )}
                    disabled={loading || rolesLoading}
                    type="button"
                  >
                    <span className="truncate flex-1 text-left">
                      {displayValue}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[var(--radix-popover-trigger-width)] p-0"
                  align="start"
                  sideOffset={4}
                >
                  <Command className="overflow-hidden">
                    <CommandInput
                      placeholder={t("common.comboboxSearchPlaceholder")}
                    />
                    <ScrollArea>
                      <CommandList>
                        <CommandEmpty className="p-4 text-center">
                          {t("common.noResultsFound")}
                        </CommandEmpty>
                        <CommandGroup>
                          {roleOptions.map((option) => (
                            <CommandItem
                              key={option.value}
                              value={option.value}
                              onSelect={() => {
                                setSelectedRoleId(
                                  option.value === selectedRoleId
                                    ? ""
                                    : option.value
                                );
                                setComboboxOpen(false);
                              }}
                              keywords={[option.label]}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedRoleId === option.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {option.label}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </ScrollArea>
                  </Command>
                </PopoverContent>
              </Popover>
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
            disabled={loading || rolesLoading || !selectedRoleId}
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
