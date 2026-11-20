# TracMotion Architecture (initial)

```text
Browser (Next.js)
  ├─ Dashboard / Editor UI
  ├─ Project metadata (IndexedDB)
  └─ TracMotion API
        └─ Render job queue
              └─ Separate Node.js worker
                    ├─ AM Runtime (only after verified setup)
                    └─ FFmpeg
```

The browser must not import the native Node.js renderer package. The mock adapter is for UI development only and does not create media output.
