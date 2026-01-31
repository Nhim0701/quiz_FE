"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { useEditorStore } from "@/hooks/use-editor";
import PlateEditor, {
  serializeHtmlContent,
  editorPlugins,
} from "./plate-editor";
import { usePlateEditor } from "platejs/react";
import { Info, Loader2 } from "lucide-react";
import Html from "./html";
import { type Value } from "platejs";
import { useEffect } from "react";
import { Button } from "../ui/button";
import { useTranslation } from "@/i18n/hooks";
import { ACTION_TYPE_CLASSES } from "../common/data-table/constants";
import { cn } from "@/lib";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import isHtml from "is-html";

export function PlateEditorDialog() {
  const { t } = useTranslation();
  const {
    isOpen,
    title,
    titleAction,
    content,
    close,
    mode,
    setLoading,
    loading,
    loadingLabel,
  } = useEditorStore();

  const editor = usePlateEditor({
    plugins: editorPlugins,
  });

  useEffect(() => {
    const deserializeContent = async () => {
      return new Promise((resolve) => {
        setTimeout(() => {
          const deserializedContent = editor.api.html.deserialize({
            element: isHtml(content) ? content : `<div>${content}</div>`,
          });
          editor.tf.setValue(deserializedContent as Value);
          resolve(deserializedContent);
        }, 300);
      });
    };
    const initOpen = async () => {
      if (isOpen && mode === "editor") {
        setLoading(true);
        await deserializeContent();
        setLoading(false);
      }
    };

    initOpen();
  }, [isOpen, mode]);

  const handleOpenChange = async (open: boolean) => {
    if (!open && mode === "editor") {
      const html = !editor.api.isEmpty()
        ? await serializeHtmlContent(editor.children)
        : "";
      setLoading(false);
      close(html);
    } else {
      // When closed with html mode, just close the dialog
      close();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-6xl w-full h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-4">
            <DialogTitle>{title}</DialogTitle>
            {titleAction && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className={cn(ACTION_TYPE_CLASSES.viewInfo)}
                    onClick={titleAction}
                    title={t("common.viewInfo")}
                  >
                    <Info className="h-4 w-4" />
                    <span className="sr-only">{t("common.viewInfo")}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t("common.viewInfo")}</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <DialogDescription className="sr-only">
            {t("editor.dialog.description")}
          </DialogDescription>
        </DialogHeader>
        <div className="relative flex-1 overflow-hidden px-6 pb-6">
          {loading ? (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">{loadingLabel}</p>
              </div>
            </div>
          ) : mode === "html" ? (
            <Html
              content={content}
              className="h-full w-full overflow-auto py-6"
            />
          ) : (
            <PlateEditor editor={editor} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
