import { useMemo, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Edit, Trash2, Save, X, type LucideIcon } from "lucide-react";
import { useTranslation } from "@/i18n";
import type { FormDialogMode } from "@/constants";

type TitleConfig = string | { create: string; view: string; edit: string };
type DescriptionConfig =
  | string
  | { create: string; view: string; edit: string };

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: FormDialogMode;
  isEditMode?: boolean;
  title: TitleConfig;
  description?: DescriptionConfig;
  children: ReactNode;
  // Callbacks
  onEdit?: () => void;
  onDelete?: () => void;
  onCancel?: () => void;
  onSubmit?: () => void;
  // States
  loading?: boolean;
  isSubmitting?: boolean;
  isDeleting?: boolean;
  hasChanges?: boolean;
  canSubmit?: boolean;
  // Labels
  createLabel?: string;
  saveLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  cancelLabel?: string;
}

// Button style constants
const PRIMARY_BUTTON_CLASSES =
  "bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-600 dark:to-green-700 dark:hover:from-emerald-700 dark:hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium border-0";

// Icon map for buttons
const BUTTON_ICONS: Record<string, LucideIcon> = {
  edit: Edit,
  delete: Trash2,
  save: Save,
  cancel: X,
} as const;

// Helper function to get title/description based on mode
const getTextByMode = (
  config: TitleConfig | DescriptionConfig | undefined,
  mode: FormDialogMode,
  isViewEditMode: boolean
): string | undefined => {
  if (!config) return undefined;
  if (typeof config === "string") return config;
  if (isViewEditMode) return config.edit;
  return config[mode];
};

// Button components
interface ActionButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  children: ReactNode;
  variant?: "default" | "destructive" | "outline";
  className?: string;
}

const ActionButton = ({
  onClick,
  disabled,
  children,
  variant = "outline",
  className,
}: ActionButtonProps) => (
  <Button
    type="button"
    variant={variant}
    size="sm"
    onClick={onClick}
    disabled={disabled}
    className={className}
  >
    {children}
  </Button>
);

interface SubmitButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  isSubmitting?: boolean;
  label: string;
}

const SubmitButton = ({
  onClick,
  disabled,
  loading,
  isSubmitting,
  label,
}: SubmitButtonProps) => (
  <Button
    type="button"
    size="sm"
    disabled={disabled}
    className={PRIMARY_BUTTON_CLASSES}
    onClick={onClick}
  >
    {(loading || isSubmitting) && (
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
    )}
    <Save className="mr-2 h-4 w-4" />
    {label}
  </Button>
);

type ButtonConfig = {
  key: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline";
  className?: string;
  icon: string;
  label: string;
  type: "action" | "submit";
};

export function FormDialog({
  open,
  onOpenChange,
  mode,
  isEditMode = false,
  title,
  description,
  children,
  onEdit,
  onDelete,
  onCancel,
  onSubmit,
  loading = false,
  isSubmitting = false,
  isDeleting = false,
  hasChanges = false,
  canSubmit = true,
  createLabel,
  saveLabel,
  editLabel,
  deleteLabel,
  cancelLabel,
}: FormDialogProps) {
  const { t } = useTranslation();

  // Default labels map with i18n support
  const defaultLabels = useMemo(
    () => ({
      create: createLabel ?? "Create",
      save: saveLabel ?? t("common.save"),
      edit: editLabel ?? t("common.edit"),
      delete: deleteLabel ?? "Delete",
      cancel: cancelLabel ?? t("common.cancel"),
    }),
    [createLabel, saveLabel, editLabel, deleteLabel, cancelLabel, t]
  );

  // Compute derived values
  const isViewMode = mode === "view";
  const isViewEditMode = isViewMode && isEditMode;

  const dialogTitle = useMemo(
    () => getTextByMode(title, mode, isViewEditMode) ?? "",
    [title, mode, isViewEditMode]
  );

  const dialogDescription = useMemo(
    () => getTextByMode(description, mode, isViewEditMode),
    [description, mode, isViewEditMode]
  );

  const submitLabel = useMemo(
    () =>
      isViewEditMode || mode === "edit"
        ? defaultLabels.save
        : defaultLabels.create,
    [isViewEditMode, mode, defaultLabels]
  );

  const isSubmitDisabled = useMemo(
    () =>
      loading || isSubmitting || (isViewEditMode && !hasChanges) || !canSubmit,
    [loading, isSubmitting, isViewEditMode, hasChanges, canSubmit]
  );

  // Button configurations
  const buttonConfigs = useMemo<ButtonConfig[]>(() => {
    const isViewOnly = isViewMode && !isEditMode;

    // Helper to create action button config
    const createActionButton = (
      key: string,
      onClick: (() => void) | undefined,
      options: Partial<ButtonConfig> = {}
    ): ButtonConfig | null => {
      if (!onClick) return null;
      return {
        key,
        onClick,
        icon: key,
        label: defaultLabels[key as keyof typeof defaultLabels] || "",
        type: "action",
        ...options,
      };
    };

    // Helper to create submit button config
    const createSubmitButton = (): ButtonConfig | null => {
      if (!onSubmit) return null;
      return {
        key: "submit",
        onClick: onSubmit,
        disabled: isSubmitDisabled,
        icon: "save",
        label: submitLabel,
        type: "submit",
      };
    };

    if (isViewOnly) {
      // View mode (not in edit mode)
      return [
        createActionButton("edit", onEdit, {
          disabled: loading,
          className: PRIMARY_BUTTON_CLASSES,
        }),
        createActionButton("delete", onDelete, {
          disabled: loading || isDeleting,
          variant: "destructive",
        }),
        createActionButton("cancel", onCancel, {
          disabled: loading,
        }),
      ].filter((btn): btn is ButtonConfig => btn !== null);
    }

    // Create or Edit mode
    return [
      createActionButton("cancel", onCancel, {
        disabled: loading || isSubmitting,
      }),
      createSubmitButton(),
    ].filter((btn): btn is ButtonConfig => btn !== null);
  }, [
    isViewMode,
    isEditMode,
    loading,
    isSubmitting,
    isDeleting,
    isSubmitDisabled,
    submitLabel,
    onEdit,
    onDelete,
    onCancel,
    onSubmit,
    defaultLabels,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          {dialogDescription && (
            <DialogDescription>{dialogDescription}</DialogDescription>
          )}
        </DialogHeader>
        {children}
        <DialogFooter>
          {buttonConfigs.map((config) => {
            const Icon = BUTTON_ICONS[config.icon];

            if (config.type === "submit") {
              return (
                <SubmitButton
                  key={config.key}
                  onClick={config.onClick}
                  disabled={config.disabled}
                  loading={loading}
                  isSubmitting={isSubmitting}
                  label={config.label}
                />
              );
            }

            return (
              <ActionButton
                key={config.key}
                onClick={config.onClick}
                disabled={config.disabled}
                variant={config.variant}
                className={config.className}
              >
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                {config.label}
              </ActionButton>
            );
          })}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
