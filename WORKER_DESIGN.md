# TracMotion Render Worker Design (Stage 2)

**Status: design only. No worker exists yet and AM Runtime has not been run.**

## Separation
- Frontend (Next.js, Vercel): UI only. Never imports `am-render`, never touches FFmpeg, never sees worker secrets.
- TracMotion API (Next.js route handlers): validates input and talks to the worker through `RuntimeAdapter` (`src/lib/runtime/adapter.ts`).
- Render worker (separate Node.js process on its own host): the only place that may install AM Runtime and FFmpeg.

## Worker host requirements (as documented, not verified)
- Node.js 24+, npm.
- FFmpeg and FFprobe with libx264 and AAC.
- Linux/Windows x64 or ARM64 use a prebuilt renderer binary per the docs. Linux headless needs EGL/GLES libraries.
- Vercel and Codespaces default images are not assumed to satisfy this. Check first.

## Proposed worker HTTP contract (TracMotion-owned)
| Method | Path | Purpose |
|---|---|---|
| GET | /health | Liveness and runtime readiness |
| POST | /jobs | Submit `RenderJobInput`, returns `RenderJob` |
| GET | /jobs/:id | Status and progress |
| POST | /jobs/:id/cancel | Cancel a job |

- Auth: `Authorization: Bearer <TRACMOTION_WORKER_TOKEN>`, set only in server env.
- The API route calls the worker. The browser only calls the API route.

## Job handling
- One isolated job context per job. The docs mention `createAM()` for separate job instances and `close()` for cleanup. Exact signatures must be taken from the official docs when implementing.
- Temporary directory per job, deleted when the job ends.
- Limits to define before launch: upload size, preset size, render duration, concurrent jobs, per-job timeout.
- Never return filesystem paths to the browser. Serve output through a signed or proxied URL.
- Never log secrets.

## Compatibility test plan (to run on a real worker host)
1. Check `node -v` is 24+ and `ffmpeg -version` lists libx264 and aac.
2. Download and install the package from the official link in `docs/AM_RUNTIME_RESEARCH.md`.
3. Run the documented setup and doctor commands for the platform. Save the output.
4. Load one user-provided preset and read its state.
5. Render a short clip and inspect the MP4 (codec, duration, audio).
6. Record time, memory and failures. Then decide on limits and concurrency.
7. Review the package license and redistribution terms.

Only after all steps pass may the `real` adapter be implemented.
