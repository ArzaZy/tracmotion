"use client";

import { useEffect, useRef, useState } from "react";
import { Download, RotateCcw, Trash2, Upload, X } from "lucide-react";
import { Badge, Button, Card } from "@/components/ui";
import { mockEditAdapter } from "@/lib/edit/mock-edit-adapter";
import {
  applyDraft,
  applyMediaTo,
  countPending,
  createSession,
  discardDraft,
  getLayerEditState,
  revertLayer,
  setDraft,
  type EditSession,
} from "@/lib/edit/session";
import { parseFixture } from "@/lib/import/parse-fixture";
import { createSampleFixture } from "@/lib/import/sample-fixture";
import type { FixtureProject, ImportError } from "@/lib/import/types";
import { MAX_IMPORT_BYTES, formatBytes, validateFile } from "@/lib/import/validate";
import { LayerEditor } from "./LayerEditor";
import "./import.css";

type Status = "idle" | "reading" | "ready" | "error";
type Source = { kind: "file"; name: string; size: number } | { kind: "sample" };

export function ImportInspector() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<ImportError | null>(null);
  const [session, setSession] = useState<EditSession | null>(null);
  const [source, setSource] = useState<Source | null>(null);
  const [removed, setRemoved] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const project = session ? session.working : null;
  const layers = project ? project.layers.filter((l) => !removed.includes(l.id)) : [];
  const selected = layers.find((l) => l.id === selectedId) ?? null;
  const pending = session ? countPending(session) : { unsaved: 0, applied: 0 };
  const hasPending = pending.unsaved + pending.applied > 0;

  useEffect(() => {
    if (!hasPending) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasPending]);

  function confirmDiscard(): boolean {
    return !hasPending || window.confirm("Perubahan belum disimpan permanen dan akan hilang. Lanjutkan?");
  }

  function load(next: FixtureProject, from: Source) {
    setSession(createSession(next));
    setSource(from);
    setRemoved([]);
    setSelectedId(null);
    setEditError(null);
    setError(null);
    setStatus("ready");
  }

  function fail(e: ImportError) {
    // A failed import never replaces a project that is already loaded.
    setError(e);
    setStatus("error");
  }

  function clearAll() {
    if (!confirmDiscard()) return;
    setSession(null);
    setSource(null);
    setRemoved([]);
    setSelectedId(null);
    setEditError(null);
    setError(null);
    setStatus("idle");
  }

  async function handleFile(file: File) {
    const fileError = validateFile(file.name, file.size);
    if (fileError) return fail(fileError);
    setError(null);
    setStatus("reading");
    let text: string;
    try {
      text = await file.text();
    } catch {
      return fail({ code: "read-failed", message: "File tidak bisa dibaca." });
    }
    const result = parseFixture(text);
    if (!result.ok) return fail(result.error);
    if (!confirmDiscard()) {
      setStatus(session ? "ready" : "idle");
      return;
    }
    load(result.project, { kind: "file", name: file.name, size: file.size });
  }

  function downloadSample() {
    const blob = new Blob([JSON.stringify(createSampleFixture(), null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "tracmotion-sample-fixture.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function applyText() {
    if (!session || !selected) return;
    setBusy(true);
    setEditError(null);
    const outcome = await applyDraft(session, selected.id, mockEditAdapter);
    setSession(outcome.session);
    setEditError(outcome.error ? outcome.error.message : null);
    setBusy(false);
  }

  async function applyMedia(file: File) {
    if (!session || !selected) return;
    setBusy(true);
    setEditError(null);
    const info = { name: file.name, mimeType: file.type, size: file.size };
    const outcome = await applyMediaTo(session, selected.id, info, mockEditAdapter);
    setSession(outcome.session);
    setEditError(outcome.error ? outcome.error.message : null);
    setBusy(false);
  }

  return (
    <Card className="imp">
      <div className="card-head">
        <h2>Import dan Layer</h2>
        <Badge tone="accent">Fixture</Badge>
      </div>
      <p className="muted">
        Hanya fixture TracMotion (.json, maks {formatBytes(MAX_IMPORT_BYTES)}) yang bisa dibaca. Preset Alight Motion (.xml) belum didukung.
        Data yang tampil bukan hasil render atau pembacaan AM Runtime.
      </p>

      <div className="imp-actions">
        <input
          ref={inputRef}
          className="imp-input"
          type="file"
          accept=".json,application/json"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void handleFile(file);
          }}
        />
        <Button variant="primary" onClick={() => inputRef.current?.click()} disabled={status === "reading"}>
          <Upload size={14} /> Pilih file
        </Button>
        <Button
          onClick={() => {
            if (confirmDiscard()) load(createSampleFixture(), { kind: "sample" });
          }}
        >
          Muat contoh
        </Button>
        <Button variant="ghost" onClick={downloadSample}>
          <Download size={14} /> Unduh contoh
        </Button>
        {project ? (
          <Button variant="ghost" onClick={clearAll}>
            <X size={14} /> Hapus project
          </Button>
        ) : null}
      </div>

      {status === "reading" ? <p className="imp-status" role="status">Membaca file...</p> : null}
      {error ? <p className="imp-alert" role="alert">{error.message}</p> : null}
      {status === "idle" ? <p className="imp-empty">Belum ada project. Pilih file atau muat contoh.</p> : null}

      {project && source && session ? (
        <>
          <div className="imp-section">
            <h3>PROJECT</h3>
            <dl className="imp-meta">
              <div><dt>Nama</dt><dd>{project.name}</dd></div>
              <div><dt>Canvas</dt><dd>{project.canvas.width} × {project.canvas.height} · {project.canvas.fps} FPS</dd></div>
              <div><dt>Format</dt><dd>Fixture TracMotion v{project.version}</dd></div>
              <div><dt>Sumber</dt><dd>{source.kind === "file" ? `${source.name} (${formatBytes(source.size)})` : "Contoh bawaan"}</dd></div>
              <div><dt>Layer</dt><dd>{layers.length} dari {project.layers.length}</dd></div>
              <div>
                <dt>Perubahan</dt>
                <dd>
                  {hasPending
                    ? `${pending.unsaved} belum diterapkan, ${pending.applied} diterapkan (sesi ini saja)`
                    : "Tidak ada"}
                </dd>
              </div>
            </dl>
          </div>

          <div className="imp-section">
            <h3>LAYER</h3>
            {project.layers.length === 0 ? <p className="imp-empty">Project ini tidak memiliki layer.</p> : null}
            {project.layers.length > 0 && layers.length === 0 ? <p className="imp-empty">Semua layer sudah dihapus dari tampilan.</p> : null}
            <ul className="imp-layers">
              {layers.map((layer) => {
                const state = getLayerEditState(session, layer.id);
                return (
                  <li key={layer.id} className="imp-layer">
                    <button
                      type="button"
                      className={`imp-layer-pick${layer.visible ? "" : " imp-layer-hidden"}`}
                      aria-pressed={layer.id === selectedId}
                      onClick={() => {
                        setSelectedId(layer.id);
                        setEditError(null);
                      }}
                    >
                      <span className="imp-layer-name">{layer.name}</span>
                      <span>
                        {state !== "original" ? <Badge tone="accent">{state === "unsaved" ? "draft" : "diedit"}</Badge> : null}{" "}
                        <Badge tone="muted">{layer.type}</Badge>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="imp-icon-btn"
                      aria-label={`Hapus layer ${layer.name} dari tampilan`}
                      onClick={() => {
                        setRemoved([...removed, layer.id]);
                        if (selectedId === layer.id) setSelectedId(null);
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </li>
                );
              })}
            </ul>
            {removed.length > 0 ? (
              <Button variant="ghost" onClick={() => setRemoved([])}>
                <RotateCcw size={14} /> Pulihkan {removed.length} layer
              </Button>
            ) : null}
            <p className="imp-empty">Menghapus layer hanya mengubah tampilan ini. Data asli tidak berubah.</p>
          </div>

          <div className="imp-section">
            <h3>INSPECTOR</h3>
            {selected ? (
              <>
                <dl className="imp-fields">
                  <div><dt>ID</dt><dd>{selected.id}</dd></div>
                  <div><dt>Nama</dt><dd>{selected.name}</dd></div>
                  <div><dt>Tipe</dt><dd>{selected.type}</dd></div>
                  <div><dt>Mulai</dt><dd>{selected.startTime} detik</dd></div>
                  <div><dt>Durasi</dt><dd>{selected.duration} detik</dd></div>
                  <div><dt>Terlihat</dt><dd>{selected.visible ? "Ya" : "Tidak"}</dd></div>
                  {Object.entries(selected.properties).map(([key, value]) => (
                    <div key={key}><dt>{key}</dt><dd>{String(value)}</dd></div>
                  ))}
                </dl>
                <LayerEditor
                  layer={selected}
                  state={getLayerEditState(session, selected.id)}
                  draft={session.drafts.get(selected.id)}
                  busy={busy}
                  error={editError}
                  onDraftChange={(text) => setSession((s) => (s ? setDraft(s, selected.id, text) : s))}
                  onApplyText={() => void applyText()}
                  onDiscardDraft={() => {
                    setSession((s) => (s ? discardDraft(s, selected.id) : s));
                    setEditError(null);
                  }}
                  onApplyMedia={(file) => void applyMedia(file)}
                  onRevert={() => {
                    setSession((s) => (s ? revertLayer(s, selected.id) : s));
                    setEditError(null);
                  }}
                />
              </>
            ) : (
              <p className="imp-empty">Pilih layer untuk melihat detail dan mengeditnya.</p>
            )}
          </div>
        </>
      ) : null}
    </Card>
  );
}
