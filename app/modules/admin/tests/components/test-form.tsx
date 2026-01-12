import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormField, TextareaField } from "@/components/common/form-field";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
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
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import useApp from "@/hooks/use-app";
import { testSchema, type TestFormData } from "../schemas/test-schema";
import { useTestsStore } from "@/hooks/use-tests";
import { useCategoriesStore } from "../../categories/hooks";
import { usePaginationStore } from "@/hooks/use-pagination";

interface TestFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TestForm({ isOpen, onClose }: TestFormProps) {
  const { t } = useTranslation();
  const { showSuccess, showError } = useApp();
  const { page, pageSize } = usePaginationStore();
  const { createTest, refreshTests, adminLoading: loading } = useTestsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const [categoryOpen, setCategoryOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TestFormData>({
    resolver: zodResolver(testSchema(t)),
    defaultValues: {
      name: "",
      categoryId: "",
      description: "",
      timeLimit: undefined,
    },
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        name: "",
        categoryId: "",
        description: "",
        timeLimit: undefined,
      });
      // Fetch categories when form opens
      fetchCategories(1, 1000).catch((error) => {
        console.error("Failed to fetch categories:", error);
      });
    }
  }, [isOpen, reset, fetchCategories]);

  const onSubmit = async (data: TestFormData) => {
    try {
      await createTest(data);
      showSuccess(t("admin.tests.createSuccess"));
      onClose();
      await refreshTests(page, pageSize);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("errors.genericError");
      showError(errorMessage);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{t("admin.tests.createTitle")}</SheetTitle>
          <SheetDescription>
            {t("admin.tests.createDescription")}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <FormField
            id="name"
            label={t("admin.tests.form.nameLabel")}
            type="text"
            placeholder={t("admin.tests.form.namePlaceholder")}
            register={register("name")}
            error={errors.name}
            required
            disabled={loading || isSubmitting}
            labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />

          <div>
            <Label htmlFor="categoryId">
              {t("admin.tests.form.categoryLabel")}
              <span className="text-red-500 dark:text-red-400 ml-1">*</span>
            </Label>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Popover open={categoryOpen} onOpenChange={setCategoryOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={categoryOpen}
                      className={cn(
                        "mt-2 w-full justify-between",
                        !field.value && "text-muted-foreground",
                        errors.categoryId &&
                          "border-red-500 dark:border-red-600"
                      )}
                      disabled={loading || isSubmitting}
                    >
                      <span className="truncate flex-1 text-left">
                        {field.value
                          ? categories.find(
                              (category) => category.id === field.value
                            )?.name || t("admin.tests.form.selectCategory")
                          : t("admin.tests.form.selectCategory")}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder={t("admin.tests.form.searchCategory")}
                      />
                      <CommandList>
                        <CommandEmpty>
                          {t("admin.tests.form.noCategoryFound")}
                        </CommandEmpty>
                        <CommandGroup>
                          {categories.map((category) => (
                            <CommandItem
                              key={category.id}
                              value={category.id}
                              onSelect={() => {
                                field.onChange(
                                  category.id === field.value ? "" : category.id
                                );
                                setCategoryOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  field.value === category.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {category.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            />
            {errors.categoryId && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          <TextareaField
            id="description"
            label={t("admin.tests.form.descriptionLabel")}
            rows={4}
            placeholder={t("admin.tests.form.descriptionPlaceholder")}
            register={register("description")}
            error={errors.description}
            disabled={loading || isSubmitting}
            labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />

          <FormField
            id="timeLimit"
            label={t("admin.tests.form.timeLimitLabel")}
            type="number"
            min="1"
            placeholder={t("admin.tests.form.timeLimitPlaceholder")}
            register={register("timeLimit", {
              valueAsNumber: true,
            })}
            error={errors.timeLimit}
            required
            disabled={loading || isSubmitting}
            labelClassName="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2"
          />

          <SheetFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={loading || isSubmitting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading || isSubmitting}
              className="bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white"
            >
              {(loading || isSubmitting) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {t("admin.tests.create")}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
