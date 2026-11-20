import { ArrowUpRight, Clapperboard, FolderOpen, Layers3, Plus, Settings2, Sparkles, Upload } from "lucide-react";

const projects = [
  { name: "Welcome Project", detail: "Starter workspace", status: "Draft", updated: "Baru saja" },
  { name: "Social Motion Study", detail: "9:16 · 30 FPS", status: "Draft", updated: "Contoh" },
  { name: "Typography Experiment", detail: "16:9 · 30 FPS", status: "Draft", updated: "Contoh" },
];

export default function Home() {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#"><span className="brand-mark">T</span><span>TracMotion<small>CREATIVE STUDIO</small></span></a>
        <div className="side-label">WORKSPACE</div>
        <a className="nav-item active" href="#"><Layers3 size={18}/> Overview</a>
        <a className="nav-item" href="#projects"><FolderOpen size={18}/> Projects</a>
        <a className="nav-item" href="#editor"><Clapperboard size={18}/> Editor</a>
        <div className="side-bottom"><a className="nav-item" href="#settings"><Settings2 size={18}/> Settings</a><div className="user-chip"><span className="avatar">T</span><span>TracMotion<small>Local workspace</small></span></div></div>
      </aside>

      <section className="main-area">
        <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> Overview</div><div className="top-actions"><span className="local-pill"><i/> Local mode</span><button className="icon-button" aria-label="Settings"><Settings2 size={18}/></button></div></header>
        <div className="content">
          <section className="welcome-row"><div><div className="eyebrow"><Sparkles size={14}/> YOUR CREATIVE WORKSPACE</div><h1>Make something <em>move.</em></h1><p>Kelola project motion graphic dari satu ruang kerja.</p></div><button className="primary-button"><Plus size={17}/> New project</button></section>

          <section className="hero-panel" id="editor"><div className="hero-copy"><span className="hero-tag">EDITOR WORKSPACE</span><h2>Your next idea<br/>starts here.</h2><p>Ruang kerja editor sedang disiapkan. Impor preset dan alat editing akan hadir pada tahap berikutnya.</p><button className="secondary-button"><Upload size={16}/> Import preset <ArrowUpRight size={15}/></button></div><div className="preview-placeholder"><div className="preview-frame"><div className="play-symbol">▶</div><span>PREVIEW AREA</span><small>Belum ada project terbuka</small></div><div className="preview-meta"><span>CANVAS</span><b>— × —</b><span>STATUS</span><b>Not loaded</b></div></div></section>

          <section className="section-head" id="projects"><div><h3>Recent projects</h3><p>Project yang terakhir kamu kerjakan.</p></div><a href="#projects" className="text-link">View all <ArrowUpRight size={14}/></a></section>
          <div className="project-grid">{projects.map((p, i) => <article className="project-card" key={p.name}><div className={`project-thumb thumb-${i+1}`}><div className="thumb-shape"/><span>{i===0?"STARTER":i===1?"MOTION":"TYPE"}</span></div><div className="project-info"><div><h4>{p.name}</h4><p>{p.detail}</p></div><span className="status">{p.status}</span></div><div className="project-foot"><span>{p.updated}</span><button aria-label={`Open ${p.name}`}><ArrowUpRight size={16}/></button></div></article>)}</div>
          <section className="notice" id="settings"><div className="notice-icon"><Sparkles size={17}/></div><div><b>Stage 1 foundation</b><p>Ini adalah kerangka awal. Fungsi import, timeline, preview, dan export belum aktif dan tidak ditampilkan sebagai fitur jadi.</p></div></section>
          <footer>TRACMOTION <span>·</span> CREATE. ANIMATE. RENDER.</footer>
        </div>
      </section>
    </main>
  );
}
