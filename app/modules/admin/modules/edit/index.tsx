import * as React from "react";

import { cva } from "class-variance-authority";
import fs from "node:fs/promises";
import path from "node:path";
import { type Value, normalizeNodeId } from "platejs";
import { createStaticEditor, serializeHtml } from "platejs/static";

import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import {
  EditorClient,
  EditorViewClient,
  ExportHtmlButton,
  HtmlIframe,
} from "@/components/editor/slate-to-html";
import { createHtmlDocument } from "@/lib/create-html-document";
import { EditorStatic } from "@/components/ui/editor-static";

export default async function SlateToHtmlBlock() {
  const createValue = (): Value =>
    normalizeNodeId([
      { type: "h1", children: [{ text: "My Title" }] },
      { type: "p", children: [{ text: "My content." }] },
    ]);

  const editor = createStaticEditor({
    plugins: BaseEditorKit,
    value: createValue(),
  });

  const katexCDN = `<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.18/dist/katex.css" integrity="sha384-9PvLvaiSKCPkFKB1ZsEoTjgnJn+O3KvEwtsz37/XrkYft3DTk2gHdYvd9oWgW3tV" crossorigin="anonymous">`;

  // const cookieStore = await cookies();
  // const theme = cookieStore.get('theme')?.value;
  const theme = "light";

  // Get the editor content HTML using EditorStatic
  const editorHtml = await serializeHtml(editor, {
    editorComponent: EditorStatic,
    props: { style: { padding: "0 calc(50% - 350px)", paddingBottom: "" } },
  });

  // Create the full HTML document
  const html = createHtmlDocument({
    editorHtml,
    katexCDN,
    theme,
  });

  return (
    <div className="grid grid-cols-3 px-4">
      <div className="p-2">
        <h3 className={headingVariants()}>Editor</h3>
        <EditorClient value={createValue()} />
      </div>

      <div className="p-2">
        <h3 className={headingVariants()}>EditorView</h3>
        <EditorViewClient value={createValue()} />
      </div>

      <div className="relative p-2">
        <h3 className={headingVariants()}>HTML Iframe</h3>
        <ExportHtmlButton
          className="absolute top-10 right-0"
          html={html}
          serverTheme={theme}
        />
        <HtmlIframe
          className="h-[7500px] w-full"
          html={html}
          serverTheme={theme}
        />
      </div>
    </div>
  );
}

const headingVariants = cva(
  "group mt-8 scroll-m-20 font-heading font-semibold text-xl tracking-tight"
);
