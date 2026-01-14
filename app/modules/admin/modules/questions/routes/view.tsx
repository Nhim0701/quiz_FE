import { useParams } from "react-router";
import type { Route } from "./+types/view";
import { useTranslation, t } from "@/i18n";
import { ROUTES } from "../constants";
import { useBreadcrumb } from "@/hooks";
import { PageHeader } from "@/components/common/page-header";
import { Container } from "@/components/ui/container";
import { QuestionCard, AnswerList } from "../components";
import { pageMeta } from "@/lib";

export const meta: Route.MetaFunction = () => {
  return pageMeta(t("admin.questions.questionInfo"))();
};

export default function QuestionView() {
  const { t } = useTranslation();
  const { questionId } = useParams<{ questionId: string }>();

  useBreadcrumb(
    [
      {
        label: t("sidebar.admin.index"),
        href: "",
      },
      {
        label: t("sidebar.admin.questions"),
        href: ROUTES.INDEX,
      },
      {
        label: t("admin.questions.questionInfo"),
        href: ROUTES.VIEW(questionId || ""),
      },
    ],
    [t, questionId]
  );

  return (
    <Container className="p-2 space-y-4">
      <PageHeader title={t("admin.questions.questionInfo")} />

      {/* General Information Card */}
      <QuestionCard />

      {/* Answers List Card */}
      <AnswerList />
    </Container>
  );
}
