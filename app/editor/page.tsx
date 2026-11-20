import { Layers, Play, Type } from "lucide-react";
import { Badge, Button, Card, PageHeading, PlaceholderNote } from "@/components/ui";

export default function EditorPage() {
  return (
    <>
      <PageHeading
        title="Editor"
        description="Kerangka workspace editor."
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
            <span>Belum ada project terbuka</span>
          </div>
        </Card>

        <Card>
          <div className="card-head">
            <Layers size={18} />
            <h2>Layers</h2>
            <Badge tone="accent">Placeholder</Badge>
          </div>
          <p className="muted">Daftar layer dan inspector akan muncul di sini.</p>
          <div className="card-head">
            <Type size={18} />
            <h2>Inspector</h2>
          </div>
          <p className="muted">Belum ada layer yang dipilih.</p>
        </Card>
      </div>

      <Card className="timeline-card">
        <div className="card-head">
          <h2>Timeline</h2>
          <Badge tone="accent">Placeholder</Badge>
        </div>
        <div className="timeline-track" aria-hidden="true" />
        <p className="muted">Timeline belum aktif.</p>
      </Card>

      <PlaceholderNote>Preview, timeline, dan export belum berfungsi. Semuanya akan dibuat bertahap.</PlaceholderNote>
    </>
  );
}
