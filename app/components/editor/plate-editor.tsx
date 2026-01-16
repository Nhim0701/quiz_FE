"use client";

import { Plate, usePlateEditor } from "platejs/react";

import { Editor, EditorContainer } from "../ui/editor";
import { createSlateEditor, type Value } from "platejs";
import { EditorStatic } from "../ui/editor-static";
import { serializeHtml } from "platejs/static";
import { BaseEditorKit } from "./editor-base-kit";
import { EditorKit } from "./editor-kit";
import { t } from "@/i18n";

export const editorPlugins = [...EditorKit];

export const serializeHtmlContent = async (content: Value) => {
  const editorStatic = createSlateEditor({
    plugins: BaseEditorKit,
    value: content,
  });

  const editorHtml = await serializeHtml(editorStatic, {
    editorComponent: EditorStatic,
    props: { style: { padding: "0 calc(50% - 350px)", paddingBottom: "" } },
  });

  return editorHtml;
};

export default function PlateEditor({
  editor,
}: {
  editor: ReturnType<typeof usePlateEditor>;
}) {
  return (
    <Plate editor={editor}>
      <EditorContainer>
        {/* <Toolbar /> */}
        <Editor
          id="editor"
          variant="default"
          placeholder={t("common.editorPlaceholder")}
        />
      </EditorContainer>
    </Plate>
  );
}
