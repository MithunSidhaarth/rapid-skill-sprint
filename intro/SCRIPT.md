# Intro script: "Rapid Skill Sprint" (15 s)

Voiceover (ElevenLabs, voice "Isaac"). Timings come from forced alignment of the real read.

| Time | Voiceover | On screen |
|---|---|---|
| 0.07 | **Two hours.** | A slab of white type slams in. The corner clock starts at 02:00:00. |
| 1.32 | **One skill.** | Second slam underneath; "SKILL." goes signal orange. |
| 2.32 | **No course. No excuses.** | Each phrase gets struck through by an orange bar as soon as it is said. |
| 4.43 | **Meet Sprint.** | Camera punches in. "SPRINT." burns orange with an underline. |
| 5.44 | **A coach inside Claude that maps the skill,** | The sentence builds on the left. A skill-map card pops in: squares fill one by one. |
| 8.33 | **finds the best videos,** | A video card: play triangle, scrub bar, "WATCH 02:10 to 11:40". |
| 9.92 | **drills you,** | A drill card: loops 0 to 3, pass rate climbing to 67%. |
| 11.08 | **and talks back.** | A live voice card: the waveform comes alive. |
| 12.07 | **Learn anything.** | The cards drop away. Giant type. The 7-phase timeline starts filling. |
| 13.23 | **In two hours.** | The timeline races to full while the clock runs down. |
| 14.35 | **Go.** | One giant word, flash, shake. The clock hits 00:00:00 on the exact word. |

Rules the film follows: every cut sits on a word, every number on screen is real (2:00:00 clock, 7 phases, the same 5/5/10/15/60/15/10 minute split as the dashboard), and the palette is the dashboard's (ink, bone, signal orange).

## Rebuild it
Built with the "Motion as Code" starter kit (TypeScript + three.js, pdoom-video engine by mexicat, MIT, see LICENSE.pdoom-engine).
1. Drop `sprint.ts` into the kit's `app/src/scenes/` and replace `app/src/timeline.ts` with `timeline.ts` here.
2. Put the voiceover at `audio/voiceover.mp3`, set `SCRIPT` in `analysis/align_vo.py` to the lines above (and `SPOKEN = {}`), then run the alignment and audio analysis from the kit guide.
3. `cd app && bun --bun x vite` and `bun scripts/render.ts video --samples auto --min-samples 4 --max-samples 12 --shutter 0.5 --crf 17 --out ../out/sprint-intro.mp4`.

## Reel version (9:16, 1080x1920)
`sprint-reel.ts` is the same film laid out for Reels/Shorts/TikTok: type stacks vertically, the four dashboard cards swap one at a time, and everything sits inside the safe area. Rendered file: [`assets/reel.mp4`](../assets/reel.mp4).
1. Apply the small engine patch that adds a `?vertical=1` mode (it only changes the canvas size constants and the renderer's viewport): `patch -p1 < vertical.patch` from the kit's `app/` parent.
2. Copy `sprint-reel.ts` next to `sprint.ts` and use the `timeline.ts` here (it picks the layout from `?vertical`).
3. `bun scripts/render.ts video --vertical --samples auto --min-samples 4 --max-samples 12 --shutter 0.5 --crf 17 --out ../out/sprint-reel.mp4`

Note: `bunx vite` can fail on some Node installs; `bun --bun x vite` runs it under bun instead. If another project already uses port 5173, start vite on a free port and pass `--url http://localhost:<port>` to `render.ts`.
