import { Badge, Card, PageHeading } from "@/components/ui";
import { getRuntimeDiagnostics } from "@/lib/runtime/diagnostics";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const d = await getRuntimeDiagnostics();
  const rows = [
    { label: "Tema", value: "Dark (Liquid Glass)" },
    { label: "FPS default", value: "30" },
    { label: "Versi aplikasi", value: "0.1.0" },
    { label: "Mode runtime", value: d.adapter.mode === "mock" ? "MOCK" : "Real (belum terhubung)" },
    { label: "Status renderer", value: d.adapter.health.message },
    { label: "AM Runtime terpasang dan diuji", value: d.verified.videoRendered ? "Ya" : "Belum" },
  ];

  return (
    <>
      <PageHeading title="Settings" description="Pengaturan dasar dan diagnostik runtime." />
      <Card>
        <div className="card-head">
          <h2>Umum</h2>
          <Badge tone="muted">Hanya tampilan</Badge>
        </div>
        <dl className="settings-list">
          {rows.map((r) => (
            <div key={r.label} className="settings-row">
              <dt>{r.label}</dt>
              <dd>{r.value}</dd>
            </div>
          ))}
        </dl>
        <p className="muted">Detail teknis ada di /api/runtime/diagnostics. Renderer asli belum terhubung.</p>
      </Card>
    </>
  );
}
