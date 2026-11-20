# AM Web Runtime — Research Notes for TracMotion

**Official documentation:** https://am.zervida.my.id/runtime/docs.html#install  
**Documentation page checked:** 20 November 2026  
**Documented package version:** `am-render v0.2.2`  
**Shared API version:** `v1.0`

> This file is a concise technical summary, not a replacement for the official documentation. “Documented” does not mean independently installed or tested in the TracMotion environment.

## Documented facts

### Purpose
The documentation describes `am-render` as a Node.js package for loading Alight Motion presets, editing preset text/media and exporting video. It also describes browser-side automation through `window.AM` on the AM preset player.

### Requirements and platforms
- Node.js 24+ and npm.
- FFmpeg and FFprobe, with libx264 and AAC support.
- Windows and Linux x64 / ARM64 use a ready-to-use renderer binary, according to the docs.
- Termux/Android requires build tools because the renderer is built locally.
- The Termux install instructions list `x11-repo`, `nodejs-lts`, Python, Clang, Make, pkg-config, tar, Mesa, FFmpeg and curl.
- Linux headless instructions mention EGL/GLES libraries and `EGL_PLATFORM=surfaceless`.
- Windows instructions require Node.js and FFmpeg tools on PATH.

### Install commands shown in the official docs

Termux preparation:
```bash
pkg update
pkg install x11-repo
pkg install nodejs-lts python clang make pkg-config tar mesa ffmpeg curl
```

Install package in a Node project:
```bash
npm init -y
curl -fL https://am.zervida.my.id/downloads/am-render.tgz -o am-render.tgz
npm install ./am-render.tgz
```

Android renderer setup:
```bash
npx am-render setup --backend android-system
npx am-render doctor
```

These are documentation instructions only. They have not been run or validated as part of generating this TracMotion starter ZIP.

### Documented API groups
The docs list these shared API methods (Node.js import uses `import { AM } from 'am-render'`; browser uses `window.AM`):
- Project: `loadPreset`, `waitReady`, `getState`, `getCapabilities`, `getAvailableProjects`, `selectProject`
- Layers/playhead: `getLayers`, `getLayer`, `seek`
- Text/media/audio/fonts: `getTextLayers`, `setText`, `getMediaSlots`, `applyMedia`, `cropMedia`, `getAudioTracks`, `setAudio`, `setLayerVolume`, `getFonts`, `loadFont`
- Layer controls: `setLayerVisibility`, `setLayerTransform`, `setLayerTiming`
- Effects: `getEffects`, `setEffectsEnabled`, `setEffectEnabled`, `setEffectParam`, `addEffect`, `removeEffect`
- Render/diagnostics: `renderFrame`, `renderVideo`, `checkExportSupport`, `onLog`, `getRenderProgress`, `cancelRender`
- Node lifecycle: docs mention `createAM()` for separate job instances and `close()` for cleanup.

Consult the official docs for exact signatures, accepted values and examples before implementing a call.

### Documented render behavior and limitations
- Node.js video output is described as H.264/AAC MP4.
- Browser results expose Blob, Blob URL and Base64; actual video MIME type depends on the device encoder and should be checked from `result.type`.
- Documented video options include resolution/height, FPS, quality, start/duration, audio/effects toggles, progress callback, signal, output file and overwrite.
- `setLayerTransform` and effect parameter setters replace selected keyframe channels with constant values.
- Audio retiming/looping is documented as unsupported in Node.js.
- `getLayers()` returns snapshots; mutating snapshots does not modify the project. Use setters.

## Not yet verified in TracMotion
- Package installation in the target Codespaces/worker environment.
- Whether the package tarball can be fetched from the target network.
- Successful `am-render setup` and `doctor` output.
- Successful preset loading with a user-provided preset.
- Real rendering, output quality, runtime stability and resource use.
- Licensing/redistribution terms for the package and any bundled assets. Review the package's license/README before distribution.
- Production suitability, concurrency limits and isolation requirements.

## Recommended TracMotion architecture
1. Next.js frontend for dashboard/editor UI.
2. TracMotion API for authenticated/validated job requests (authentication can be added later if product requirements change).
3. Separate Node.js worker process for AM Runtime and FFmpeg, only after compatibility tests.
4. Per-job temporary workspace, strict file/size/time/concurrency limits and cleanup.
5. Never expose worker secrets or filesystem paths to browser code.

## Internal adapter contract
The starter project defines `RuntimeAdapter` methods `healthCheck`, `submitJob`, `getJobStatus`, and `cancelJob`. These are **TracMotion-owned abstractions**, not AM Runtime methods. `mockRuntimeAdapter` is explicitly a mock and does not render video.

## Sources
- Official AM Web Runtime API documentation: https://am.zervida.my.id/runtime/docs.html#install
- Official package archive link shown in docs: https://am.zervida.my.id/downloads/am-render.tgz

Last reviewed: 20 November 2026.
