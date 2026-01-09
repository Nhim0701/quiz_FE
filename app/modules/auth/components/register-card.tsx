import type { ReactNode } from "react";
import { Link } from "react-router";
import { useTranslation } from "@/i18n";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface RegisterCardProps {
  children: ReactNode;
}

export function RegisterCard({ children }: RegisterCardProps) {
  const { t } = useTranslation();

  return (
    <Card className="shadow-xl rounded-2xl p-6 sm:p-8">
      <CardContent className="p-0">
        {children}

        {/* Divider */}
        <div className="relative my-5 sm:my-6">
          <Separator />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="px-4 bg-card text-slate-500 dark:text-slate-400 text-sm">
              {t("auth.register.alreadyHaveAccount")}
            </span>
          </div>
        </div>

        {/* Login Link */}
        <Button
          asChild
          variant="outline"
          className="w-full"
        >
          <Link to="/login">
            {t("auth.register.signInInstead")}
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
