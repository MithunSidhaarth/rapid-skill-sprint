# Rapid Skill Sprint

**Learn any skill to functional competence in 2 hours, inside Claude.**
A Claude skill that turns Claude into *Coach Sprint*: a sharp, warm coach that plans the sprint, finds the best YouTube videos and real certifications, drills you with feedback, tests you, and tracks everything on a live dashboard. It can talk too, through ElevenLabs.

**[Watch the 15-second intro](assets/intro.mp4)**

> Two hours will not make you an expert. It gets you past the "incompetent" barrier with a real, observable result and a plan to keep going. The skill says that out loud, and then makes you earn it.

## What it does

| | |
|---|---|
| **Seven-phase sprint** | Intake, target, deconstruct, minimum knowledge, deliberate practice, integration test, lock it in. 120 minutes, on a visible clock. |
| **Mastery gate** | A sub-skill is only "got it" after two clean attempts. The final test is scored against 3 pass/fail criteria, followed by a teach-back. |
| **Live dashboard** | A Claude Artifact: rolling clock, phase timeline, skill map, success criteria, practice stats, optional tests. Updates in real time. |
| **Best videos** | Opened and checked YouTube picks per sub-skill, with the exact timestamps to watch. |
| **Certifications** | Real credentials from the issuer's page, cross-checked on Reddit. One marked as your next step. |
| **Community picks** | Reddit / forum consensus on mistakes and resources, with sources. |
| **Optional tests** | Quick checks after each phase and a final exam. Never forced. |
| **Voice** | Real-time conversation with an ElevenLabs agent, plus spoken lines in-chat. Optional. |
| **No made-up links** | Every URL, price and rating must come from a page the skill actually opened. |

## Install

Copy this folder to `~/.claude/skills/rapid-skill-sprint/` (or a project's `.claude/skills/`), then in Claude Code or Claude:

```
teach me <anything> in 2 hours
```

First run: it publishes the dashboard artifact and saves the URL to `references/config.local.md` (git-ignored). It needs the Artifact tool, web search and fetch. Voice needs the ElevenLabs connector; create the agent from [`voice/agent-prompt.md`](voice/agent-prompt.md).

## Layout

```
SKILL.md                      workflow, mastery gate, voice rules
references/persona.md         Coach Sprint's personality
references/research-playbook  how videos, certs and Reddit picks are found and verified
references/dashboard-spec.md  the live state schema
references/*-template.md      skill map, cheat sheet
assets/dashboard-template.html  the dashboard (Archivo + signal orange, one accent)
voice/agent-prompt.md         ElevenLabs agent prompt and settings
intro/                        source for the 15 s intro film (script, plate, timeline)
evals/evals.md                test prompts
```

## The intro film

15 seconds, locked to the voiceover word by word, built from code with the "Motion as Code" kit. Script and rebuild steps: [`intro/SCRIPT.md`](intro/SCRIPT.md). The visual engine is [pdoom-video](https://github.com/mexicat/pdoom-video) by mexicat (MIT, see `intro/LICENSE.pdoom-engine`).

## License

MIT, see [LICENSE](LICENSE). Voiceover generated with ElevenLabs; check your plan's terms before reusing generated audio.
