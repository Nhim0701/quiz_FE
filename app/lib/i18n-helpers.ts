import { useTranslation } from "@/i18n";

export const useI18nMessages = () => {
  const { t } = useTranslation();

  return {
    errors: {
      networkError: t("errors.networkError"),
      requestError: t("errors.requestError"),
      httpError: (status: number) => `${t("errors.httpError")} ${status}`,
      loginFailed: t("errors.loginFailed"),
      registrationFailed: t("errors.registrationFailed"),
      fetchUserFailed: (error?: string) =>
        `${t("errors.fetchUserFailed")}${error ? ` ${error}` : ""}`,
      sessionExpired: t("errors.sessionExpired"),
      fetchQuestionsFailed: t("errors.fetchQuestionsFailed"),
      fetchDashboardFailed: t("errors.fetchDashboardFailed"),
      submitResponsesFailed: t("errors.submitResponsesFailed"),
      genericError: t("errors.genericError"),
    },
    success: {
      loginSuccess: t("success.loginSuccess"),
      registrationSuccess: t("success.registrationSuccess"),
      submitSuccess: t("success.submitSuccess"),
    },
    info: {
      noResultData: t("info.noResultData"),
      noQuestions: t("info.noQuestions"),
      loading: t("common.loading"),
    },
    ui: {
      buttons: {
        backToDashboard: t("ui.buttons.backToDashboard"),
        takeAnotherTest: t("ui.buttons.takeAnotherTest"),
        finishTest: t("ui.buttons.finishTest"),
        submitting: t("ui.buttons.submitting"),
        previous: t("ui.buttons.previous"),
        prev: t("ui.buttons.prev"),
        next: t("ui.buttons.next"),
        flag: t("ui.buttons.flag"),
      },
      headers: {
        testCompleted: t("ui.headers.testCompleted"),
        yourAnswers: t("ui.headers.yourAnswers"),
        progress: t("ui.headers.progress"),
        questions: t("ui.headers.questions"),
      },
      status: {
        answered: t("ui.status.answered"),
        flagged: t("ui.status.flagged"),
        notAnswered: t("ui.status.notAnswered"),
        flaggedLabel: t("ui.status.flagged"),
        multipleAnswers: t("ui.status.multipleAnswers"),
      },
      explanation: {
        show: t("ui.explanation.show"),
        hide: t("ui.explanation.hide"),
        title: t("ui.explanation.title"),
      },
    },
  };
};
