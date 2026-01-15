"use client";

import { Plate, usePlateEditor } from "platejs/react";

import { Editor, EditorContainer } from "../ui/editor";
import { EditorKit } from "./editor-kit";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";
import { useEditorStore } from "@/hooks/use-editor";
import { createSlateEditor } from "platejs";
import { EditorStatic } from "../ui/editor-static";
import { serializeHtml } from "platejs/static";
import { BaseEditorKit } from "./editor-base-kit";

export function PlateEditorSheet() {
  const editor = usePlateEditor({
    plugins: [...EditorKit],
  });
  const { isOpen, title, content, close, readonly } = useEditorStore();

  const handleOpenChange = async (newOpen: boolean) => {
    const siteUrl = "https://platejs.org";
    const editorStatic = createSlateEditor({
      plugins: BaseEditorKit,
      value: editor.children,
    });

    const editorHtml = await serializeHtml(editorStatic, {
      editorComponent: EditorStatic,
      props: { style: { padding: "0 calc(50% - 350px)", paddingBottom: "" } },
    });

    const tailwindCss = `<link rel="stylesheet" href="${siteUrl}/tailwind.css">`;
    const katexCss = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.18/dist/katex.css" integrity="sha384-9PvLvaiSKCPkFKB1ZsEoTjgnJn+O3KvEwtsz37/XrkYft3DTk2gHdYvd9oWgW3tV" crossorigin="anonymous">`;

    const html = `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="color-scheme" content="light dark" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400..700&family=JetBrains+Mono:wght@400..700&display=swap"
          rel="stylesheet"
        />
        ${tailwindCss}
        ${katexCss}
        <style>
          :root {
            --font-sans: 'Inter', 'Inter Fallback';
            --font-mono: 'JetBrains Mono', 'JetBrains Mono Fallback';
          }
        </style>
      </head>
      <body>
        ${editorHtml}
      </body>
    </html>`;
    if (!newOpen) {
      close(html);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent side={"editor"}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <Plate editor={editor}>
            <EditorContainer>
              {/* <Toolbar /> */}
              <Editor
                variant="demo"
                placeholder="Type..."
                value={content}
                readOnly={readonly}
              />
            </EditorContainer>
          </Plate>
        </div>
      </SheetContent>
    </Sheet>
  );
}
