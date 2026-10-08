// SPRINT (reel): the same 15 s film as sprint.ts, laid out for 1080x1920 (9:16).
// Type stacks vertically, the four dashboard cards swap one at a time at full width, and everything
// sits inside the Reels/Shorts safe area (clear of the top ~14% and bottom ~22% where the app draws its UI).
import type * as THREE from 'three';
import { Scene, type Frame, type PostOverrides } from '../engine/scene';
import { Layer2D } from '../engine/gl';
import { rgba } from '../engine/palette';
import { F } from '../engine/type';
import { clamp, ease, lerp, prog, pulse } from '../engine/util';
import { Cam2D, gridPass, setGrid, drawKaraoke, placeRow, fitRow, setWorld, label, shake, type KWord } from './_vo';

const W = 1080, H = 1920;
const ARCH = F.archivo(62, 900);
const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');
const hms = (s: number) => `${pad(s / 3600)}:${pad((s % 3600) / 60)}:${pad(s % 60)}`;

export default class SprintReel extends Scene {
  cam = new Cam2D();
  grid = gridPass(24, 96);
  ui = new Layer2D();
  kw: KWord[] = [];
  g: Record<string, [number, number]> = {};
  rows: Record<string, KWord[]> = {};
  T: { s: number; e: number }[] = [];

  override init() {
    const ws = this.ctx.lyrics.words;
    if (ws.length < 33) throw new Error(`sprint-reel: expected 33 words, got ${ws.length}`);
    this.T = ws.map((w) => ({ s: w.start, e: w.end }));
    const row = (id: string, from: number, to: number, texts: string[], y: number, size: number, o: { hot?: string; done?: string } = {}) => {
      const r = placeRow(ws.slice(from, to + 1), 0, y, size, ARCH, id, { texts, ant: 0.12, hot: o.hot, done: o.done });
      for (const k of r.words) k.x -= r.width / 2;
      this.rows[id] = r.words;
      this.kw.push(...r.words);
    };
    const fit = (texts: string[], width: number, cap: number) => fitRow(texts, width, ARCH, cap);

    // two hours / one skill: four stacked slabs
    let s = fit(['HOURS.'], 960, 330);
    const p = s * 0.78, y0 = -250;
    row('a1', 0, 0, ['TWO'], y0, s);
    row('a1b', 1, 1, ['HOURS.'], y0 + p, s);
    row('a2', 2, 2, ['ONE'], y0 + 2 * p, s);
    row('a2b', 3, 3, ['SKILL.'], y0 + 3 * p, s);
    // no course / no excuses
    s = Math.min(fit(['NO', 'COURSE.'], 980, 260), fit(['NO', 'EXCUSES.'], 980, 260));
    row('b1', 4, 5, ['NO', 'COURSE.'], -80, s, { done: 'ash' });
    row('b2', 6, 7, ['NO', 'EXCUSES.'], -80 + s * 1.0, s, { done: 'ash' });
    // meet sprint
    s = fit(['SPRINT.'], 980, 330);
    row('c1', 8, 8, ['MEET'], -40, s, { done: 'bone' });
    row('c2', 9, 9, ['SPRINT.'], -40 + s * 0.8, s, { done: 'signal' });
    // the sentence, top block
    const L: [string, number, number, string[]][] = [
      ['d1', 10, 13, ['A', 'COACH', 'INSIDE', 'CLAUDE']],
      ['d2', 14, 17, ['THAT', 'MAPS', 'THE', 'SKILL,']],
      ['d3', 18, 21, ['FINDS', 'THE', 'BEST', 'VIDEOS,']],
      ['d4', 22, 23, ['DRILLS', 'YOU,']],
      ['d5', 24, 26, ['AND', 'TALKS', 'BACK.']],
    ];
    s = Math.min(...L.map((l) => fit(l[3], 980, 96)));
    L.forEach((l, i) => row(l[0], l[1], l[2], l[3], -545 + i * s * 1.1, s, { done: i === 4 ? 'signal' : undefined }));
    // learn anything / in two hours: stacked, each row fitted to the width
    const E: [string, number, number, string[], string?][] = [
      ['e1', 27, 27, ['LEARN']], ['e2', 28, 28, ['ANYTHING.']], ['e3', 29, 30, ['IN', 'TWO'], 'signal'], ['e4', 31, 31, ['HOURS.'], 'signal'],
    ];
    const sizes = E.map((e) => fit(e[3], 980, 340));
    let top = -560;
    E.forEach((e, i) => { const cap = sizes[i]! * 0.72; row(e[0], e[1], e[2], e[3], top + cap, sizes[i]!, { done: e[4] }); top += cap + 36; });
    // go
    s = fit(['GO.'], 1000, 780);
    row('f', 32, 32, ['GO.'], 240, s, { done: 'signal' });

    this.g = {
      a1: [2.2, 2.3], a1b: [2.2, 2.3], a2: [2.2, 2.3], a2b: [2.2, 2.3], b1: [4.28, 4.4], b2: [4.28, 4.4], c1: [5.3, 5.42], c2: [5.3, 5.42],
      d1: [11.85, 12.0], d2: [11.85, 12.0], d3: [11.85, 12.0], d4: [11.85, 12.0], d5: [11.85, 12.0],
      e1: [14.22, 14.32], e2: [14.22, 14.32], e3: [14.22, 14.32], e4: [14.22, 14.32], f: [99, 100],
    };
    const K = this.cam;
    K.key(0, 0, 0, 1.0, 0);
    K.key(2.3, 0, 0, 1.06, 0.004, ease.linear);
    K.key(2.34, 0, 0, 1.0, -0.006, ease.outExpo);
    K.key(4.4, 0, 0, 1.08, 0.004, ease.linear);
    K.key(4.45, 0, 0, 1.0, 0, ease.outExpo);
    K.key(5.4, 0, 0, 1.05, 0, ease.linear);
    K.key(5.46, 0, 0, 1.0, 0, ease.outExpo);
    K.key(12.0, 0, 0, 1.03, 0, ease.linear);
    K.key(12.08, 0, 0, 1.0, 0, ease.outExpo);
    K.key(14.3, 0, 0, 1.07, 0.003, ease.linear);
    K.key(14.38, 0, 0, 0.95, 0, ease.outExpo);
    K.key(this.ctx.end, 0, 0, 1.0, 0, ease.outCubic);
  }

  groupAlpha(id: string, t: number) {
    const f = this.g[id];
    return f ? 1 - prog(t, f[0], f[1]) : 1;
  }

  /** A full-width card that slides up, holds, and hands over to the next one. Body is drawn in a 400x320 space. */
  card(ctx: CanvasRenderingContext2D, c: ReturnType<Cam2D['at']>, t: number, t0: number, t1: number, cy: number, title: string, tag: string, body: () => void) {
    const a = ease.outExpo(prog(t, t0, t0 + 0.4)) * (1 - prog(t, t1 - 0.04, t1 + 0.14));
    if (a <= 0.003) return;
    const k = 2.0, w = 400 * k, h = 320 * k;
    const slide = (1 - ease.outExpo(prog(t, t0, t0 + 0.4))) * 70;
    setWorld(ctx, c, 0, cy + slide, 1);
    ctx.globalAlpha = a;
    ctx.fillStyle = rgba('ink2', 0.96); ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = rgba('bone', 0.22); ctx.lineWidth = 2.5; ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = rgba('signal', 1); ctx.fillRect(-w / 2, -h / 2, 10, h);
    label(ctx, title, -w / 2 + 44, -h / 2 + 70, { size: 38, col: rgba('bone', 0.8), spacing: 7 });
    label(ctx, tag, w / 2 - 36, -h / 2 + 70, { size: 38, col: rgba('signal', 1), spacing: 5, align: 'right' });
    ctx.save(); ctx.translate(-w / 2, -h / 2); ctx.scale(k, k); body(); ctx.restore();
    ctx.globalAlpha = 1;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  }

  override render(f: Frame, out: THREE.WebGLRenderTarget): PostOverrides {
    const { renderer, comp } = this.ctx;
    const t = f.t, T = this.T;
    const c = this.cam.at(t);
    setGrid(this.grid, c, { reveal: [0, 0, 1e5], ink: 0.8 });
    this.grid.render(renderer, out);
    const U = this.ui; U.clear();
    const ctx = U.ctx;

    for (const [id, wi] of [['b1', 5], ['b2', 7]] as const) {
      const r = this.rows[id]!;
      const k = prog(t, T[wi]!.e + 0.04, T[wi]!.e + 0.26, ease.outExpo);
      if (k <= 0) continue;
      const first = r[0]!, last = r[r.length - 1]!;
      const x0 = first.x - 24, x1 = last.x + (last.lay.width / 100) * last.size + 24;
      setWorld(ctx, c, 0, 0);
      ctx.globalAlpha = this.groupAlpha(id, t);
      ctx.fillStyle = rgba('signal', 1);
      const th = first.size * 0.1;
      ctx.fillRect(x0, first.y - first.size * 0.31 - th / 2, (x1 - x0) * k, th);
      ctx.globalAlpha = 1;
    }
    {
      const k = prog(t, T[9]!.s + 0.05, T[9]!.e + 0.2, ease.outExpo);
      if (k > 0) {
        const r = this.rows.c2!, a = this.groupAlpha('c2', t);
        const x0 = r[0]!.x, x1 = x0 + (r[0]!.lay.width / 100) * r[0]!.size;
        setWorld(ctx, c, 0, 0);
        ctx.globalAlpha = a; ctx.fillStyle = rgba('signal', 1);
        ctx.fillRect(x0, r[0]!.y + 30, (x1 - x0) * k, 14);
        ctx.globalAlpha = 1;
      }
    }

    // the four cards, one at a time
    const CY = 190;
    this.card(ctx, c, t, T[15]!.s - 0.05, T[18]!.s - 0.05, CY, 'SKILL MAP', '3 / 5', () => {
      ['SELECT + WHERE', 'JOIN', 'GROUP BY', 'SUBQUERIES'].forEach((nm, i) => {
        const y = 110 + i * 54, k = ease.outExpo(prog(t, T[16]!.s + 0.2 + i * 0.26, T[16]!.s + 0.5 + i * 0.26));
        ctx.strokeStyle = rgba('bone', 0.3); ctx.lineWidth = 2; ctx.strokeRect(26, y - 16, 22, 22);
        ctx.fillStyle = rgba('signal', 1); ctx.fillRect(26, y - 16, 22 * k, 22);
        label(ctx, nm, 66, y + 2, { size: 22, col: rgba('bone', lerp(0.55, 1, k)), spacing: 2 });
      });
    });
    this.card(ctx, c, t, T[18]!.s - 0.05, T[22]!.s - 0.05, CY, 'BEST VIDEOS', 'CHECKED', () => {
      const x = 26, y = 84, w = 348, h = 150;
      ctx.fillStyle = rgba('ink', 1); ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = rgba('bone', 0.2); ctx.lineWidth = 1.5; ctx.strokeRect(x, y, w, h);
      const pl = 1 + 0.08 * Math.sin(t * 7);
      ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(pl, pl);
      ctx.fillStyle = rgba('signal', 1); ctx.beginPath(); ctx.moveTo(-18, -26); ctx.lineTo(30, 0); ctx.lineTo(-18, 26); ctx.closePath(); ctx.fill(); ctx.restore();
      const sk = prog(t, T[18]!.s, T[22]!.s, ease.linear);
      ctx.fillStyle = rgba('bone', 0.25); ctx.fillRect(x, y + h - 8, w, 8);
      ctx.fillStyle = rgba('signal', 1); ctx.fillRect(x, y + h - 8, w * sk, 8);
      label(ctx, 'WATCH 02:10 → 11:40', x, y + h + 40, { size: 20, col: rgba('bone', 0.85), spacing: 2 });
      label(ctx, 'BEGINNER · UNDER 30 MIN', x, y + h + 70, { size: 16, col: rgba('ash', 1), spacing: 2 });
    });
    this.card(ctx, c, t, T[22]!.s - 0.05, T[24]!.s - 0.05, CY, 'DRILL LOOPS', 'LIVE', () => {
      const k = ease.outExpo(prog(t, T[22]!.s + 0.15, T[22]!.s + 0.9));
      ctx.font = `120px "${ARCH}"`; ctx.fillStyle = rgba('bone', 1); ctx.fillText(String(Math.round(3 * k)), 26, 200);
      label(ctx, 'LOOPS', 26, 238, { size: 18, col: rgba('ash', 1), spacing: 4 });
      ctx.font = `120px "${ARCH}"`; ctx.fillStyle = rgba('signal', 1); ctx.fillText(`${Math.round(67 * k)}%`, 170, 200);
      label(ctx, 'PASS RATE', 170, 238, { size: 18, col: rgba('ash', 1), spacing: 4 });
      ctx.fillStyle = rgba('bone', 0.2); ctx.fillRect(26, 264, 348, 8);
      ctx.fillStyle = rgba('signal', 1); ctx.fillRect(26, 264, 348 * 0.67 * k, 8);
      label(ctx, 'FORGOT THE JOIN CONDITION ×3', 26, 298, { size: 16, col: rgba('ash', 1), spacing: 2 });
    });
    this.card(ctx, c, t, T[24]!.s - 0.02, 11.95, CY, 'COACH SPRINT', '● LIVE', () => {
      const n = 22, bw = 348 / n, said = clamp((t - T[24]!.s) / (T[26]!.e - T[24]!.s));
      for (let i = 0; i < n; i++) {
        const env = 0.2 + 0.8 * Math.abs(Math.sin(t * 9.3 + i * 0.77)) * (0.45 + 0.55 * Math.abs(Math.sin(t * 3.7 + i * 1.9)));
        const h = (30 + 170 * env) * (t < T[26]!.e + 0.1 ? 1 : 0.2);
        ctx.fillStyle = i / n < said + 0.15 ? rgba('signal', 1) : rgba('bone', 0.35);
        ctx.fillRect(26 + i * bw + 2, 190 - h / 2, bw - 4, h);
      }
      label(ctx, 'ELEVENLABS VOICE · HANDS-FREE', 26, 296, { size: 16, col: rgba('ash', 1), spacing: 2 });
    });

    // phase timeline under the stacked "learn anything"
    {
      const a = prog(t, T[27]!.s - 0.05, T[27]!.s + 0.3) * (1 - prog(t, 14.22, 14.32));
      if (a > 0) {
        const planned = [5, 5, 10, 15, 60, 15, 10], tot = 120, gap = 6, x0 = -490, width = 980, y = 500;
        const k = ease.inOutCubic(prog(t, T[27]!.s + 0.2, 14.2));
        let acc = 0;
        setWorld(ctx, c, 0, 0);
        ctx.globalAlpha = a;
        planned.forEach((p, i) => {
          const sx = x0 + (acc / tot) * (width - gap * 6) + i * gap, sw = (p / tot) * (width - gap * 6);
          ctx.fillStyle = rgba('bone', 0.18); ctx.fillRect(sx, y, sw, 26);
          ctx.fillStyle = rgba('signal', 1); ctx.fillRect(sx, y, sw * clamp((k * tot - acc) / p), 26);
          acc += p;
        });
        label(ctx, 'PHASE 0 → 6  ·  FUNCTIONAL IN 2 HOURS', x0, y + 62, { size: 22, col: rgba('bone', 0.7), spacing: 4 });
        ctx.globalAlpha = 1;
      }
    }

    drawKaraoke(ctx, c, t, this.kw, { alpha: (g, tt) => this.groupAlpha(g, tt), pop: 0.05 });

    // HUD in screen space, kept inside the safe area
    {
      const left = 7200 * (1 - clamp((t - 0.07) / (T[32]!.s - 0.07)));
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      label(ctx, 'RAPID SKILL SPRINT', 60, 300, { size: 24, col: rgba('bone', 0.75), spacing: 5 });
      label(ctx, hms(left), W - 60, 300, { size: 24, col: left < 1 ? rgba('signal', 1) : rgba('bone', 0.75), spacing: 5, align: 'right' });
      ctx.fillStyle = rgba('bone', 0.14); ctx.fillRect(60, 1495, W - 120, 4);
      ctx.fillStyle = rgba('signal', 1); ctx.fillRect(60, 1495, (W - 120) * clamp(t / this.ctx.end), 4);
      if (t > T[32]!.s) {
        ctx.globalAlpha = prog(t, T[32]!.s + 0.1, T[32]!.s + 0.35);
        label(ctx, 'A SKILL FOR CLAUDE', W / 2, 1400, { size: 38, col: rgba('bone', 0.95), spacing: 8, align: 'center' });
        label(ctx, 'github.com/MithunSidhaarth/rapid-skill-sprint', W / 2, 1450, { size: 26, col: rgba('ash', 1), spacing: 2, align: 'center' });
        ctx.globalAlpha = 1;
      }
    }
    const fl = pulse(t, T[32]!.s, 0.05);
    if (fl > 0.01) { ctx.fillStyle = rgba('signal', 0.7 * fl); ctx.fillRect(0, 0, W, H); }

    comp.draw(renderer, U.upload(), out);

    let zoom = 1;
    for (const i of [0, 1, 2, 3, 4, 6, 8, 9, 15, 18, 22, 25, 27, 29, 31]) zoom += 0.01 * pulse(t, T[i]!.s, 0.08);
    zoom += 0.05 * pulse(t, T[32]!.s, 0.14);
    const sh = shake(t, 5 * pulse(t, T[32]!.s, 0.18) + 1.5 * pulse(t, T[8]!.s, 0.1));
    return { bloom: 0.8, bloomThreshold: 0.82, vignette: 0.42, grain: 0.06, zoom, ca: 1.2 + 6 * pulse(t, T[32]!.s, 0.15), shake: sh };
  }
}
