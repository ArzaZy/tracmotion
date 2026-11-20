import Link from "next/link";
import { ArrowUpRight, Clapperboard, Plus, Upload } from "lucide-react";
import { Badge, Button, Card, PageHeading, PlaceholderNote } from "@/components/ui";

const projects = [
  { name: "Welcome Project", detail: "Workspace awal", tag: "STARTER" },
  { name: "Social Motion Study", detail: "9:16 · 30 FPS", tag: "MOTION" },
  { name: "Typography Experiment", detail: "16:9 · 30 FPS", tag: "TYPE" },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeading
        title="Dashboard"
        description="Kelola project motion graphics dari satu ruang kerja."
        action={
          <Button variant="primary" disabled title="Belum tersedia">
            <Plus size={16} /> New project
          </Button>
        }
      />

      <div className="quick-grid">
        <Card>
          <div className="card-head">
            <Clapperboard size={18} />
            <h2>Buka editor</h2>
          </div>
          <p className="muted">Lihat kerangka workspace editor.</p>
          <Link href="/editor" className="btn btn-secondary">
            Ke editor <ArrowUpRight size={15} />
          </Link>
        </Card>
        <Card>
          <div className="card-head">
            <Upload size={18} />
            <h2>Import preset</h2>
            <Badge tone="accent">Placeholder</Badge>
          </div>
          <p className="muted">Import preset belum aktif dan akan dibuat di tahap berikutnya.</p>
          <Button disabled title="Belum tersedia">
            Import preset
          </Button>
        </Card>
      </div>

      <div className="section-head">
        <h2>Recent projects</h2>
        <Badge tone="muted">Data contoh</Badge>
      </div>
      <div className="project-grid">
        {projects.map((p, i) => (
          <article key={p.name} className="card project-card">
            <div className={`project-thumb thumb-${i + 1}`}>
              <span>{p.tag}</span>
            </div>
            <h3>{p.name}</h3>
            <p className="muted">{p.detail}</p>
          </article>
        ))}
      </div>

      <PlaceholderNote>
        Ini adalah kerangka tahap 1. Daftar project di atas hanya contoh. Import, timeline, preview, dan export belum berfungsi.
      </PlaceholderNote>
    </>
  );
}
