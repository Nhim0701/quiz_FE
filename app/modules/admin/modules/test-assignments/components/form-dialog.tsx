import { useEffect, useMemo, useCallback, useState } from "react";
import { useForm, FormProvider, Form } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/i18n";
import { useApp } from "@/hooks";
import { ComboboxField } from "@/components/common/form-field";
import { FormDialog } from "@/components/common/form-dialog";
import { DIALOG_MODES } from "@/constants";
import type { FormDialogMode } from "@/constants";
import { Loader2 } from "lucide-react";
import { apiClient } from "@/lib";
import type { ApiSuccessResponse } from "@/types";
import { useTestAssignmentsStore } from "../hooks";
import {
  testAssignmentSchema,
  testAssignmentFormBuilder,
  type TestAssignmentFormData,
} from "../schemas";

interface UserOption {
  id: string;
  fullName?: string;
  email: string;
}

interface TestOption {
  id: string;
  name: string;
}

interface TestAssignmentFormDialogProps {
  onClearFilters?: (() => void) | null;
  onRefresh?: () => Promise<void>;
}

export function TestAssignmentFormDialog({
  onClearFilters,
  onRefresh,
}: TestAssignmentFormDialogProps) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useApp();
  const { isDialogOpen, dialogMode, closeDialog, createTestAssignment, loading } =
    useTestAssignmentsStore();

  const [users, setUsers] = useState<UserOption[]>([]);
  const [tests, setTests] = useState<TestOption[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);

  const mode = (dialogMode || DIALOG_MODES.CREATE) as FormDialogMode;
  const shouldShow = isDialogOpen && !!dialogMode;

  const methods = useForm<TestAssignmentFormData>({
    resolver: zodResolver(testAssignmentSchema(t)),
    defaultValues: testAssignmentFormBuilder(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = methods;

  useEffect(() => {
    if (shouldShow) {
      reset(testAssignmentFormBuilder());
      setOptionsLoading(true);
      Promise.all([
        apiClient.get<ApiSuccessResponse<UserOption[]>>("/api/v1/users", {
          params: { page: 1, pageSize: 100 },
        }),
        apiClient.get<ApiSuccessResponse<TestOption[]>>("/api/v1/tests", {
          params: { page: 1, pageSize: 100 },
        }),
      ])
        .then(([usersRes, testsRes]) => {
          setUsers(usersRes.data.data || []);
          setTests(testsRes.data.data || []);
        })
        .catch(() => {})
        .finally(() => setOptionsLoading(false));
    }
  }, [shouldShow, reset]);

  const userOptions = useMemo(
    () =>
      users.map((u) => ({
        value: u.id,
        label: u.fullName ? `${u.fullName} (${u.email})` : u.email,
      })),
    [users]
  );

  const testOptions = useMemo(
    () =>
      tests.map((test) => ({
        value: test.id,
        label: test.name,
      })),
    [tests]
  );

  const currentValues = watch();
  const canSubmit = useMemo(
    () => !!(currentValues.userId?.trim() && currentValues.testId?.trim()),
    [currentValues]
  );

  const onSubmit = useCallback(
    async (data: TestAssignmentFormData) => {
      try {
        await createTestAssignment(data);
        showSuccess(t("admin.testAssignments.createSuccess"));
        closeDialog();
        onClearFilters?.();
        onRefresh && (await onRefresh());
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : t("errors.genericError");
        showError(errorMessage);
      }
    },
    [createTestAssignment, showSuccess, showError, t, closeDialog, onClearFilters, onRefresh]
  );

  const handleFormSubmit = useCallback(() => {
    handleSubmit(onSubmit)();
  }, [handleSubmit, onSubmit]);

  const handleCancel = useCallback(() => {
    closeDialog();
  }, [closeDialog]);

  if (!shouldShow) return null;

  return (
    <FormDialog
      open={shouldShow}
      onOpenChange={(open) => !open && closeDialog()}
      mode={mode}
      title={t("admin.testAssignments.createTitle")}
      description={t("admin.testAssignments.createDescription")}
      onCancel={handleCancel}
      onSubmit={handleFormSubmit}
      loading={loading || optionsLoading}
      isSubmitting={isSubmitting}
      canSubmit={canSubmit}
      createLabel={t("admin.testAssignments.create")}
      cancelLabel={t("common.cancel")}
    >
      <FormProvider {...methods}>
        <Form className="mt-6 space-y-4">
          {optionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <ComboboxField
                id="userId"
                label={t("admin.testAssignments.form.userLabel")}
                name="userId"
                control={control}
                options={userOptions}
                error={errors.userId}
                required
                disabled={loading || isSubmitting}
                placeholder={t("common.selectPlaceholder")}
                searchPlaceholder={t("common.comboboxSearchPlaceholder")}
                emptyMessage={t("common.noResultsFound")}
                labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              />
              <ComboboxField
                id="testId"
                label={t("admin.testAssignments.form.testLabel")}
                name="testId"
                control={control}
                options={testOptions}
                error={errors.testId}
                required
                disabled={loading || isSubmitting}
                placeholder={t("common.selectPlaceholder")}
                searchPlaceholder={t("common.comboboxSearchPlaceholder")}
                emptyMessage={t("common.noResultsFound")}
                labelClassName="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
              />
            </>
          )}
        </Form>
      </FormProvider>
    </FormDialog>
  );
}
