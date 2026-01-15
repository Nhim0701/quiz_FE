import { createSlateEditor } from "platejs";
import { BaseEditorKit } from "@/components/editor/editor-base-kit";
import { PlateEditor } from "@/components/editor/plate-editor";

const editor = createSlateEditor({
  plugins: BaseEditorKit,
});

// Render statically
export default function MyStaticPage() {
  return <PlateEditor />;
}
