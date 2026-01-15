"use client";

import { Plate, usePlateEditor } from "platejs/react";

import { Editor, EditorContainer } from "../ui/editor";
import { EditorKit } from "./editor-kit";

export function PlateEditor() {
  const editor = usePlateEditor({
    plugins: [...EditorKit],
  });

  return (
    <Plate editor={editor}>
      <EditorContainer>
        {/* <Toolbar /> */}
        <Editor variant="demo" placeholder="Type..." />
      </EditorContainer>
    </Plate>
  );
}
