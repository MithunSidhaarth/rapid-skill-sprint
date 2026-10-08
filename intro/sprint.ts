// SPRINT: the 15 s intro for "Rapid Skill Sprint". One plate, locked to the voiceover by word index.
//   "Two hours. One skill."            two slams, stacked
//   "No course. No excuses."           each struck through in signal as it is said
//   "Meet Sprint."                     the name, signal hot
//   "A coach inside Claude that ..."   the sentence on the left; four dashboard cards pop in on the right,
//                                      one per verb: maps, finds, drills, talks back
//   "Learn anything. In two hours."    the phase timeline fills while the 2:00:00 clock runs out
//   "Go."                              one giant word and a full-frame flash
// The clock in the corner counts 2 h to zero across the whole film and lands on zero at "Go".
import type * as THREE from 'three';
import { Scene, type Frame, type PostOverrides } from '../engine/scene';
import { Layer2D } from '../engine/gl';
import { rgba } from '../engine/palette';
import { F } from '../engine/type';
import { clamp, ease, lerp, prog, pulse } from '../engine/util';
import { Cam2D, gridPass, setGrid, drawKaraoke, placeRow, fitRow, setWorld, label, shake, type KWord } from './_vo';

const W = 1920, H = 1080;
const ARCH = F.archivo(62, 900);
const pad = (n: number) => String(Math.floor(n)).padStart(2, '0');
const hms = (s: number) => `${pad(s / 3600)}:${pad((s % 3600) / 60)}:${pad(s % 60)}`;

export default class Sprint extends Scene {
  cam = new Cam2D();
  grid = gridPass(24, 96);
  ui = new Layer2D();
  kw: KWord[] = [];
  g: Record<string, [number, number]> = {}; // group -> [fade start, fade end]
  rows: Record<string, KWord[]> = {};
  T: { s: number; e: number }[] = [];

  override init() {
    const ws = this.ctx.lyrics.words;
    if (ws.length < 33) throw new Error(`sprint: expected 33 words, got ${ws.length}`);
    this.T = ws.map((w) => ({ s: w.start, e: w.end }));
    const row = (id: string, from: number, to: number, texts: string[], x: number, y: number, size: number, o: { hot?: string; done?: string; center?: boolean } = {}) => {
      const words = ws.slice(from, to + 1);
      const r = placeRow(words, x, y, size, ARCH, id, { texts, ant: 0.12, hot: o.hot, done: o.done });
      if (o.center) for (const k of r.words) k.x -= r.width / 2;
      this.rows[id] = r.words;
      this.kw.push(...r.words);
      return r;
    };
    const fit = (texts: string[], width: number, cap: number) => fitRow(texts, width, ARCH, cap);

    // 0-1 TWO HOURS. / ONE SKILL.
    let s = Math.min(fit(['TWO', 'HOURS.'], 1640, 380), fit(['ONE', 'SKILL.'], 1640, 380));
    row('a1', 0, 1, ['TWO', 'HOURS.'], 0, -50, s, { center: true });
    row('a2', 2, 3, ['ONE', 'SKILL.'], 0, 270, s, { center: true });
    // 2 NO COURSE. / NO EXCUSES.
    s = Math.min(fit(['NO', 'COURSE.'], 1500, 300), fit(['NO', 'EXCUSES.'], 1500, 300));
    row('b1', 4, 5, ['NO', 'COURSE.'], 0, -30, s, { center: true, done: 'ash' });
    row('b2', 6, 7, ['NO', 'EXCUSES.'], 0, 250, s, { center: true, done: 'ash' });
    // 3 MEET SPRINT.
    s = fit(['MEET', 'SPRINT.'], 1700, 400);
    row('c', 8, 9, ['MEET', 'SPRINT.'], 0, 150, s, { center: true, done: 'signal' });
    // 4 the sentence, left column
    const L: [string, number, number, string[]][] = [
      ['d1', 10, 13, ['A', 'COACH', 'INSIDE', 'CLAUDE']],
      ['d2', 14, 17, ['THAT', 'MAPS', 'THE', 'SKILL,']],
      ['d3', 18, 21, ['FINDS', 'THE', 'BEST', 'VIDEOS,']],
      ['d4', 22, 23, ['DRILLS', 'YOU,']],
      ['d5', 24, 26, ['AND', 'TALKS', 'BACK.']],
    ];
    s = Math.min(...L.map((l) => fit(l[3], 760, 92)));
    const pitch = s * 1.16, y0 = -(pitch * 4) / 2 + s * 0.34;
    L.forEach((l, i) => row(l[0], l[1], l[2], l[3], -880, y0 + i * pitch, s, { done: i === 4 ? 'signal' : undefined }));
    // 5 LEARN ANYTHING. / IN TWO HOURS.
    s = Math.min(fit(['LEARN', 'ANYTHING.'], 1700, 330), fit(['IN', 'TWO', 'HOURS.'], 1700, 330));
    row('e1', 27, 28, ['LEARN', 'ANYTHING.'], 0, -30, s, { center: true });
    row('e2', 29, 31, ['IN', 'TWO', 'HOURS.'], 0, 260, s, { center: true, done: 'signal' });
    // 6 GO.
    s = fit(['GO.'], 1500, 820);
    row('f', 32, 32, ['GO.'], 0, 300, s, { center: true, done: 'signal' });

    const T = this.T;
    this.g = {
      a1: [2.2, 2.3], a2: [2.2, 2.3], b1: [4.28, 4.4], b2: [4.28, 4.4], c: [5.3, 5.42],
      d1: [11.85, 12.0], d2: [11.85, 12.0], d3: [11.85, 12.0], d4: [11.85, 12.0], d5: [11.85, 12.0],
      e1: [14.22, 14.32], e2: [14.22, 14.32], f: [99, 100],
    };
    const K = this.cam;
    K.key(0, 0, -20, 1.0, 0);
    K.key(2.3, 0, -20, 1.07, 0.004, ease.linear);
    K.key(2.34, 0, 0, 1.02, -0.006, ease.outExpo);
    K.key(4.4, 0, 0, 1.09, 0.004, ease.linear);
    K.key(4.45, 0, 20, 1.0, 0, ease.outExpo);
    K.key(5.4, 0, 20, 1.06, 0, ease.linear);
    K.key(5.46, 0, 0, 1.0, 0, ease.outExpo);
    K.key(12.0, 0, 0, 1.03, 0, ease.linear);
    K.key(12.08, 0, 0, 1.0, 0, ease.outExpo);
    K.key(14.3, 0, 0, 1.08, 0.003, ease.linear);
    K.key(14.38, 0, 0, 0.94, 0, ease.outExpo);
    K.key(this.ctx.end, 0, 0, 1.0, 0, ease.outCubic);
    void T;
  }

  groupAlpha(id: string, t: number) {
    const f = this.g[id];
    return f ? 1 - prog(t, f[0], f[1]) : 1;
  }

  /** Rounded-nothing card: ink2 fill, hairline, mono caption. Draws around (cx, cy) with a pop. */
  card(ctx: CanvasRenderingContext2D, c: ReturnType<Cam2D['at']>, t: number, t0: number, cx: number, cy: number, w: number, h: number, title: string, tag: string, body: () => void) {
    const a = ease.outExpo(prog(t, t0, t0 + 0.42)) * (1 - prog(t, 11.88, 12.04));
    if (a <= 0.003) return;
    setWorld(ctx, c, cx, cy, lerp(0.88, 1, a));
    ctx.globalAlpha = a;
    ctx.fillStyle = rgba('ink2', 0.96);
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = rgba('bone', 0.22);
    ctx.lineWidth = 1.5;
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = rgba('signal', 1);
    ctx.fillRect(-w / 2, -h / 2, 6, h * a);
    label(ctx, title, -w / 2 + 26, -h / 2 + 40, { size: 20, col: rgba('bone', 0.75), spacing: 4 });
    label(ctx, tag, w / 2 - 22, -h / 2 + 40, { size: 20, col: rgba('signal', 1), spacing: 3, align: 'right' });
    ctx.save();
    ctx.translate(-w / 2, -h / 2);
    body();
    ctx.restore();
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

    // strike-throughs: NO COURSE. / NO EXCUSES.
    for (const [id, wi] of [['b1', 5], ['b2', 7]] as const) {
      const r = this.rows[id]!;
      const k = prog(t, T[wi]!.e + 0.04, T[wi]!.e + 0.26, ease.outExpo);
      if (k <= 0) continue;
      const first = r[0]!, last = r[r.length - 1]!;
      const x0 = first.x - 30, x1 = last.x + (last.lay.width / 100) * last.size + 30;
      setWorld(ctx, c, 0, 0);
      ctx.globalAlpha = this.groupAlpha(id, t);
      ctx.fillStyle = rgba('signal', 1);
      const th = first.size * 0.1;
      ctx.fillRect(x0, first.y - first.size * 0.31 - th / 2, (x1 - x0) * k, th);
      ctx.globalAlpha = 1;
    }
    // underline for MEET SPRINT.
    {
      const k = prog(t, T[9]!.s + 0.05, T[9]!.e + 0.2, ease.outExpo);
      if (k > 0) {
        const r = this.rows.c!, a = this.groupAlpha('c', t);
        const x0 = r[0]!.x, x1 = r[1]!.x + (r[1]!.lay.width / 100) * r[1]!.size;
        setWorld(ctx, c, 0, 0);
        ctx.globalAlpha = a;
        ctx.fillStyle = rgba('signal', 1);
        ctx.fillRect(x0, r[0]!.y + 34, (x1 - x0) * k, 14);
        ctx.globalAlpha = 1;
      }
    }

    // the four cards (x: 40..860, y: -340..340)
    const cw = 400, ch = 320, gx = 450, gy = 190;
    this.card(ctx, c, t, T[15]!.s - 0.05, gx - 215 + 0, -gy + 10 - 0, cw, ch, 'SKILL MAP', '3 / 5', () => {
      const rowsN = ['SELECT + WHERE', 'JOIN', 'GROUP BY', 'SUBQUERIES'];
      rowsN.forEach((nm, i) => {
        const y = 92 + i * 52, k = ease.outExpo(prog(t, T[16]!.s + 0.2 + i * 0.26, T[16]!.s + 0.5 + i * 0.26));
        ctx.strokeStyle = rgba('bone', 0.3); ctx.lineWidth = 2;
        ctx.strokeRect(26, y - 16, 22, 22);
        ctx.fillStyle = rgba('signal', 1);
        ctx.fillRect(26, y - 16, 22 * k, 22);
        label(ctx, nm, 66, y + 2, { size: 22, col: rgba('bone', lerp(0.55, 1, k)), spacing: 2 });
      });
    });
    this.card(ctx, c, t, T[18]!.s - 0.05, gx + 215 + 0, -gy + 10, cw, ch, 'BEST VIDEOS', 'CHECKED', () => {
      const x = 26, y = 70, w = cw - 52, h = 150;
      ctx.fillStyle = rgba('ink', 1); ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = rgba('bone', 0.2); ctx.lineWidth = 1.5; ctx.strokeRect(x, y, w, h);
      const pl = 1 + 0.08 * Math.sin(t * 7);
      ctx.save(); ctx.translate(x + w / 2, y + h / 2); ctx.scale(pl, pl);
      ctx.fillStyle = rgba('signal', 1); ctx.beginPath(); ctx.moveTo(-18, -26); ctx.lineTo(30, 0); ctx.lineTo(-18, 26); ctx.closePath(); ctx.fill(); ctx.restore();
      const sk = prog(t, T[18]!.s, T[22]!.s, ease.linear);
      ctx.fillStyle = rgba('bone', 0.25); ctx.fillRect(x, y + h - 8, w, 8);
      ctx.fillStyle = rgba('signal', 1); ctx.fillRect(x, y + h - 8, w * sk, 8);
      label(ctx, 'WATCH 02:10 → 11:40', x, y + h + 40, { size: 20, col: rgba('bone', 0.8), spacing: 2 });
      label(ctx, 'BEGINNER · UNDER 30 MIN', x, y + h + 72, { size: 17, col: rgba('ash', 1), spacing: 2 });
    });
    this.card(ctx, c, t, T[22]!.s - 0.05, gx - 215, gy + 30, cw, ch, 'DRILL LOOPS', 'LIVE', () => {
      const k = ease.outExpo(prog(t, T[22]!.s + 0.15, T[22]!.s + 0.9));
      const loops = Math.round(3 * k), pass = Math.round(67 * k);
      ctx.fillStyle = rgba('bone', 1);
      ctx.font = `120px "${ARCH}"`;
      ctx.fillText(String(loops), 26, 190);
      label(ctx, 'LOOPS', 26, 226, { size: 18, col: rgba('ash', 1), spacing: 4 });
      ctx.font = `120px "${ARCH}"`; ctx.fillStyle = rgba('signal', 1);
      ctx.fillText(`${pass}%`, 190, 190);
      label(ctx, 'PASS RATE', 190, 226, { size: 18, col: rgba('ash', 1), spacing: 4 });
      ctx.fillStyle = rgba('bone', 0.2); ctx.fillRect(26, 262, cw - 52, 8);
      ctx.fillStyle = rgba('signal', 1); ctx.fillRect(26, 262, (cw - 52) * 0.67 * k, 8);
      label(ctx, 'FORGOT THE JOIN CONDITION ×3', 26, 296, { size: 16, col: rgba('ash', 1), spacing: 2 });
    });
    this.card(ctx, c, t, T[24]!.s - 0.02, gx + 215, gy + 30, cw, ch, 'COACH SPRINT', '● LIVE', () => {
      const n = 22, bw = (cw - 52) / n, said = clamp((t - T[24]!.s) / (T[26]!.e - T[24]!.s));
      for (let i = 0; i < n; i++) {
        const env = 0.2 + 0.8 * Math.abs(Math.sin(t * 9.3 + i * 0.77)) * (0.45 + 0.55 * Math.abs(Math.sin(t * 3.7 + i * 1.9)));
        const h = (30 + 160 * env) * (t < T[26]!.e + 0.1 ? 1 : 0.2);
        ctx.fillStyle = i / n < said + 0.15 ? rgba('signal', 1) : rgba('bone', 0.35);
        ctx.fillRect(26 + i * bw + 2, 232 - h / 2 - 20, bw - 4, h);
      }
      label(ctx, 'ELEVENLABS VOICE · HANDS-FREE', 26, 296, { size: 16, col: rgba('ash', 1), spacing: 2 });
    });

    // phase timeline under LEARN ANYTHING / IN TWO HOURS
    {
      const a = prog(t, T[27]!.s - 0.05, T[27]!.s + 0.3) * (1 - prog(t, 14.22, 14.32));
      if (a > 0) {
        const planned = [5, 5, 10, 15, 60, 15, 10], tot = 120, gap = 8, x0 = -860, width = 1720, y = 400;
        const k = ease.inOutCubic(prog(t, T[27]!.s + 0.2, 14.2));
        let acc = 0;
        setWorld(ctx, c, 0, 0);
        ctx.globalAlpha = a;
        planned.forEach((p, i) => {
          const sx = x0 + (acc / tot) * (width - gap * 6) + i * gap, sw = (p / tot) * (width - gap * 6);
          ctx.fillStyle = rgba('bone', 0.18); ctx.fillRect(sx, y, sw, 26);
          const fill = clamp((k * tot - acc) / p);
          ctx.fillStyle = rgba('signal', 1); ctx.fillRect(sx, y, sw * fill, 26);
          acc += p;
        });
        label(ctx, 'PHASE 0 → 6  ·  FUNCTIONAL IN 2 HOURS', x0, y + 62, { size: 20, col: rgba('bone', 0.7), spacing: 4 });
        ctx.globalAlpha = 1;
      }
    }

    drawKaraoke(ctx, c, t, this.kw, { alpha: (g, tt) => this.groupAlpha(g, tt), pop: 0.05 });

    // HUD (screen space): title, the 2 h clock that lands on zero at "Go", film-long progress rule
    {
      const left = 7200 * (1 - clamp((t - 0.07) / (T[32]!.s - 0.07)));
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      label(ctx, 'RAPID SKILL SPRINT', 64, 76, { size: 20, col: rgba('bone', 0.7), spacing: 5 });
      label(ctx, `TIME LEFT  ${hms(left)}`, W - 64, 76, { size: 20, col: left < 1 ? rgba('signal', 1) : rgba('bone', 0.7), spacing: 5, align: 'right' });
      ctx.fillStyle = rgba('bone', 0.14); ctx.fillRect(64, H - 60, W - 128, 3);
      ctx.fillStyle = rgba('signal', 1); ctx.fillRect(64, H - 60, (W - 128) * clamp(t / this.ctx.end), 3);
      if (t > T[32]!.s) {
        const a = prog(t, T[32]!.s + 0.1, T[32]!.s + 0.35);
        ctx.globalAlpha = a;
        label(ctx, 'A SKILL FOR CLAUDE  ·  COACH SPRINT', W / 2, H - 92, { size: 22, col: rgba('bone', 0.9), spacing: 8, align: 'center' });
        ctx.globalAlpha = 1;
      }
    }
    // GO. flash
    const fl = pulse(t, T[32]!.s, 0.05);
    if (fl > 0.01) { ctx.fillStyle = rgba('signal', 0.7 * fl); ctx.fillRect(0, 0, W, H); }

    comp.draw(renderer, U.upload(), out);

    let zoom = 1;
    for (const i of [0, 2, 4, 6, 8, 9, 15, 18, 22, 25, 27, 29, 30, 31]) zoom += 0.012 * pulse(t, T[i]!.s, 0.08);
    zoom += 0.05 * pulse(t, T[32]!.s, 0.14);
    const sh = shake(t, 5 * pulse(t, T[32]!.s, 0.18) + 1.5 * pulse(t, T[8]!.s, 0.1));
    return { bloom: 0.8, bloomThreshold: 0.82, vignette: 0.42, grain: 0.06, zoom, ca: 1.2 + 6 * pulse(t, T[32]!.s, 0.15), shake: sh };
  }
}
