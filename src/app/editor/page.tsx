import { Play } from "lucide-react";
import { ImportInspector } from "@/components/import/ImportInspector";
import { Badge, Button, Card, PageHeading, PlaceholderNote } from "@/components/ui";

export default function EditorPage() {
  return (
    <>
      <PageHeading
        title="Editor"
        description="Impor fixture dan lihat layer."
        action={
          <Button variant="primary" disabled title="Belum tersedia">
            Export
          </Button>
        }
      />

      <div className="editor-grid">
        <Card className="preview-card">
          <div className="card-head">
            <h2>Preview</h2>
            <Badge tone="accent">Placeholder</Badge>
          </div>
          <div className="preview-frame">
            <span className="play-symbol">
              <Play size={16} />
            </span>
            <span>Preview belum aktif</span>
          </div>
        </Card>

        <ImportInspector />
      </div>

      <Card className="timeline-card">
        <div className="card-head">
          <h2>Timeline</h2>
          <Badge tone="accent">Placeholder</Badge>
        </div>
        <div className="timeline-track" aria-hidden="true" />
        <p className="muted">Timeline belum aktif.</p>
      </Card>

      <PlaceholderNote>Preview, timeline, dan export belum berfungsi. Import dan inspector hanya membaca fixture TracMotion.</PlaceholderNote>
    </>
  );
}
