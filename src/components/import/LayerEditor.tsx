"use client";

import { useRef } from "react";
import { RotateCcw } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { MEDIA_ACCEPT, MEDIA_LABEL } from "@/lib/edit/media";
import { MAX_TEXT_LENGTH } from "@/lib/edit/mock-edit-adapter";
import { currentText, type LayerEditState } from "@/lib/edit/session";
import type { FixtureLayer } from "@/lib/import/types";
import { formatBytes } from "@/lib/import/validate";
import "./edit.css";

interface LayerEditorProps {
  layer: FixtureLayer;
  state: LayerEditState;
  draft: string | undefined;
  busy: boolean;
  error: string | null;
  onDraftChange: (text: string) => void;
  onApplyText: () => void;
  onDiscardDraft: () => void;
  onApplyMedia: (file: File) => void;
  onRevert: () => void;
}

const STATE_LABEL: Record<LayerEditState, string> = {
  unsaved: "Belum diterapkan",
  applied: "Diterapkan ke salinan kerja (hanya sesi ini)",
  original: "Sama dengan sumber",
};

export function LayerEditor(props: LayerEditorProps) {
  const { layer, state, draft, busy, error } = props;
  const fileRef = useRef<HTMLInputElement>(null);

  if (layer.type !== "text" && layer.type !== "media") {
    return <p className="ed-note">Layer bertipe {layer.type} belum bisa diedit pada tahap ini.</p>;
  }

  const mediaFile = layer.properties.mediaFile;
  const mediaSize = layer.properties.mediaSize;
  const value = draft ?? currentText(layer);

  return (
    <div className="ed">
      <div className="ed-row">
        <span className="ed-label">{layer.type === "text" ? "Edit teks" : "Media layer"}</span>
        <Badge tone={state === "unsaved" ? "accent" : state === "applied" ? "default" : "muted"}>{STATE_LABEL[state]}</Badge>
      </div>

      {layer.type === "text" ? (
        <>
          <textarea
            className="ed-textarea"
            aria-label="Teks layer"
            value={value}
            onChange={(e) => props.onDraftChange(e.target.value)}
            disabled={busy}
          />
          <div className="ed-row">
            <span className={`ed-count${value.length > MAX_TEXT_LENGTH ? " ed-count-over" : ""}`}>
              {value.length}/{MAX_TEXT_LENGTH}
            </span>
            <div className="ed-actions">
              <Button variant="primary" onClick={props.onApplyText} disabled={busy || draft === undefined}>
                {busy ? "Menerapkan..." : "Terapkan"}
              </Button>
              <Button variant="ghost" onClick={props.onDiscardDraft} disabled={busy || draft === undefined}>
                Batalkan
              </Button>
            </div>
          </div>
        </>
      ) : (
        <>
          <p className="ed-note">
            File saat ini: {typeof mediaFile === "string" ? `${mediaFile}${typeof mediaSize === "number" ? ` (${formatBytes(mediaSize)})` : ""}` : "belum ada"}
          </p>
          <input
            ref={fileRef}
            className="ed-input"
            type="file"
            accept={MEDIA_ACCEPT}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) props.onApplyMedia(file);
            }}
          />
          <div className="ed-actions">
            <Button variant="primary" onClick={() => fileRef.current?.click()} disabled={busy}>
              {busy ? "Menerapkan..." : "Pilih media"}
            </Button>
          </div>
          <p className="ed-note">Validasi mock: {MEDIA_LABEL}. Ini bukan daftar resmi AM Runtime.</p>
        </>
      )}

      {error ? <p className="imp-alert" role="alert">{error}</p> : null}

      {state !== "original" ? (
        <div className="ed-actions">
          <Button variant="ghost" onClick={props.onRevert} disabled={busy}>
            <RotateCcw size={14} /> Kembalikan ke sumber
          </Button>
        </div>
      ) : null}

      <p className="ed-note">
        Mode MOCK: perubahan hanya ada di memori halaman ini. Tidak dikirim ke AM Runtime, tidak disimpan permanen, dan hilang saat halaman dimuat ulang.
      </p>
    </div>
  );
}
