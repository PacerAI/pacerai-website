# AD-HOC-LOG.md — pacerai-website

Append-only audit trail for ad hoc edits in this repo. See `pacerai-os/POLICY.md` for what qualifies as ad hoc versus what needs a spec, and for the escalation rule (3+ ad hoc edits to the same artifact in 7 days → promote to a spec).

One line per edit, format:

```
YYYY-MM-DD | repo/file touched | one-line description | agent or Will
```

---

<!-- entries below, newest at bottom -->
2026-05-18 | pacerai-website/README.md | Appended ceremonial "PacerAI-OS started May 18th 2026" line | ad-hoc executor (dispatched by Ike)
2026-05-19 | pacerai-website/foundation (submodule pin) | Bumped foundation submodule pin from 8757bb3 (2026-05-01) → ce2cd44 (2026-05-18); fleet alignment with content/database/plugins/platform/gtm. Trigger: Archie health-check review 2026-05-19 — website was the lone laggard. | Claude (dispatched by Will via Ike)
