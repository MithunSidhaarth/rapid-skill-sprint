// The intro is one plate, locked to the voiceover by word index (see scenes/sprint.ts).
import type { TimelineEntry } from './engine/engine';
import type { SceneClass } from './engine/scene';
import type { Lyrics } from './engine/lyrics';
import type { AudioData } from './engine/audio';

const modules = import.meta.glob<{ default: SceneClass }>('./scenes/sprint.ts');

export function makeTimeline(_ly: Lyrics, au: AudioData): TimelineEntry[] {
  return [{ id: 'sprint', load: () => modules['./scenes/sprint.ts']!(), start: 0, end: au.duration }];
}
