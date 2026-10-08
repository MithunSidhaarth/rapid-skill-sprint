# Dashboard spec

Artifact built from `assets/dashboard-template.html`, capabilities `db` + `user`. It subscribes to one document and re-renders live; you never republish the page to update progress.

Write with the `ArtifactData` tool: collection `sprint`, doc `current`. Use `set` once at phase 1, then `update` (arrays replace wholesale, so send the whole array you change). Pin with `if_version`.

## Document shape
```json
{
  "skill": "SQL basics",
  "target": "One-line Target Performance",
  "startedAt": 1791496000000,
  "endsAt": 1791503200000,
  "phase": 4,
  "phases": [{"name":"Intake","planned":5,"used":5}, "... 7 entries, planned 5,5,10,15,60,15,10"],
  "skillMap": [{"name":"JOIN","priority":"must|nice|skip","mastery":"none|practicing|got"}],
  "criteria": [{"text":"...","done":false}],
  "practice": {"loops":2,"attempts":9,"passes":6,"mistakes":[{"text":"...","count":3}]},
  "tests": [{"name":"...","status":"offered|done|skipped","score":4,"total":5,"weak":"optional"}],
  "videos": [{"title":"","channel":"","length":"18 min","watch":"02:10 to 11:40","why":"","url":"https://...","checked":"2026-10-09"}],
  "certs": [{"name":"","issuer":"","level":"Entry","cost":"check official site","prep":"~20 h","type":"exam","best":true,"url":"https://...","note":""}],
  "community": [{"summary":"","source":"r/learnprogramming","url":"https://...","score":"1.2k upvotes"}],
  "week": [{"day":"Day 1","task":"","done":false}],
  "voiceUrl": "https://elevenlabs.io/app/talk-to?agent_id=...",
  "updatedAt": 0
}
```
Times are epoch milliseconds. `phase` is 0-6. Set `updatedAt` on every write. Remove `example` (or set the whole doc) when a real sprint starts, so the "Example data" pill disappears.

## Rules
- Links must be http(s) and verified (see research-playbook). The page ignores anything else.
- Never put secrets or personal data in the doc.
- Design: narrow single column (quarter-width side panel), light/dark tokens, one accent, Archivo + JetBrains Mono. Edit the template, not the data, to change the look.
