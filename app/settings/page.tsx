import { Badge, Card, PageHeading } from "@/components/ui";

const rows = [
  { label: "Tema", value: "Dark (Liquid Glass)" },
  { label: "FPS default", value: "30" },
  { label: "Versi aplikasi", value: "0.1.0" },
  { label: "AM Runtime", value: "Belum terhubung" },
];

export default function SettingsPage() {
  return (
    <>
      <PageHeading title="Settings" description="Pengaturan dasar aplikasi." />
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
        <p className="muted">Pengaturan di atas belum bisa diubah pada tahap ini.</p>
      </Card>
    </>
  );
}
