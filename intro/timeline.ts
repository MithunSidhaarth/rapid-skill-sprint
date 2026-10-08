// The intro is one plate, locked to the voiceover by word index. ?vertical=1 picks the 9:16 reel layout.
import type { TimelineEntry } from './engine/engine';
import type { SceneClass } from './engine/scene';
import type { Lyrics } from './engine/lyrics';
import type { AudioData } from './engine/audio';

const modules = import.meta.glob<{ default: SceneClass }>(['./scenes/sprint.ts', './scenes/sprint-reel.ts']);
const vertical = typeof location !== 'undefined' && new URLSearchParams(location.search).has('vertical');

export function makeTimeline(_ly: Lyrics, au: AudioData): TimelineEntry[] {
  const file = vertical ? './scenes/sprint-reel.ts' : './scenes/sprint.ts';
  return [{ id: 'sprint', load: () => modules[file]!(), start: 0, end: au.duration }];
}
