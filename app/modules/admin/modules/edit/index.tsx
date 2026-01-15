import { createSlateEditor } from "platejs";
import { EditorKit } from "@/components/editor/editor-kit";
import { PlateEditor } from "@/components/editor/plate-editor";

const editor = createSlateEditor({
  plugins: EditorKit,
});

// Render statically
export default function MyStaticPage() {
  return <PlateEditor />;
}
