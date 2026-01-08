import { useCategoriesStore } from "@/hooks/useCategories";
import { useTranslation } from "@/i18n";
import { Accordion } from "@/components/ui/accordion";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { TestListEmpty } from "./test-list-empty";
import { TestCategoryItem } from "./test-category-item";

export function TestList() {
  const categories = useCategoriesStore((state) => state.categories);
  const { t } = useTranslation();

  if (!categories || categories.length === 0) {
    return <TestListEmpty />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("tests.availableTests")}</CardTitle>
      </CardHeader>
      <div className="px-6 pb-6">
        <Accordion type="single" collapsible className="w-full">
          {categories.map((category) => (
            <TestCategoryItem key={category.id} categoryId={category.id} />
          ))}
        </Accordion>
      </div>
    </Card>
  );
}
