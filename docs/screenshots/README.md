# Screenshots

Generated, not hand-captured. Regenerate any time with the dev server running:

```bash
cd dashboard
npm run dev            # in one terminal
npm run capture        # in another
npm run capture -- --2x     # retina, for slides and print
npm run capture -- --full   # full page instead of above-the-fold
```

| File | What |
|---|---|
| `01-login.png` | Role selector · mock auth |
| `02-drrmo.png` | EMMA-Warn · hazard map at municipal scope |
| `03-dswd.png` | EMMA-Care · beneficiary registry |
| `04-lgu.png` | EMMA-Plan · evacuation centres, Submit SITREP |
| `05-asean-queue.png` | AHA Centre · incoming SITREP queue |
| `06-architecture.png` | System architecture — the 0:15 segment asset |

Captured at 1600×900, the demo size. The ASEAN shot walks the escalation first so
the inbound Alcoy row is present; it deliberately does **not** run the pipeline,
so this is safe to re-run without spending agent calls.

The architecture shot is clipped to its content rather than the viewport, so it
drops into a slide without dead space.
