import type { ReactNode } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Container } from "@/components/ui/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AdminPageWrapperProps {
  /**
   * Tiêu đề của page
   */
  title: string;
  /**
   * Tiêu đề của card
   */
  cardTitle: string;
  /**
   * Nội dung list component
   */
  children: ReactNode;
  /**
   * Có quyền create không
   */
  canCreate?: boolean;
  /**
   * Label cho button create
   */
  createButtonLabel?: string;
  /**
   * Handler khi click create button
   */
  onCreateClick?: () => void;
  /**
   * Form dialog component
   */
  formDialog?: ReactNode;
  /**
   * Có quyền read không (nếu false, hiển thị no permission message)
   */
  canRead?: boolean;
  /**
   * Message khi không có quyền
   */
  noPermissionMessage?: string;
}

/**
 * Shared wrapper component cho admin pages
 * Cung cấp layout chuẩn: PageHeader, Card với header và create button, CardContent cho list
 */
export function AdminPageWrapper({
  title,
  cardTitle,
  children,
  canCreate = false,
  createButtonLabel,
  onCreateClick,
  formDialog,
  canRead = true,
  noPermissionMessage,
}: AdminPageWrapperProps) {
  if (!canRead) {
    return (
      <Container>
        <PageHeader title={title} />
        <Card>
          <CardContent className="p-6">
            <p className="text-muted-foreground">
              {noPermissionMessage || "Bạn không có quyền truy cập trang này"}
            </p>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container className="p-2">
      <PageHeader title={title} />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>{cardTitle}</CardTitle>
          {canCreate && createButtonLabel && onCreateClick && (
            <Button
              onClick={onCreateClick}
              size="sm"
              className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 dark:from-emerald-600 dark:to-green-700 dark:hover:from-emerald-700 dark:hover:to-green-800 text-white shadow-md hover:shadow-lg transition-all duration-200 font-medium"
            >
              <Plus className="mr-2 h-4 w-4" />
              {createButtonLabel}
            </Button>
          )}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
      {formDialog}
    </Container>
  );
}
