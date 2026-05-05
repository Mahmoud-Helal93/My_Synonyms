/**
 * Web Audio API sound feedback for flashcard answers.
 * Uses a lazy singleton AudioContext to avoid browser autoplay restrictions.
 * Sounds are generated synthetically — no external files required.
 */

export const MUTE_STORAGE_KEY = "synonym-recall-sound-muted";

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined" || !("AudioContext" in window || "webkitAudioContext" in window)) {
    return null;
  }
  if (!ctx) {
    try {
      ctx = new (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return ctx;
}

function scheduleTone(
  audioCtx: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  volume = 0.18
): void {
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.value = frequency;

  // Short fade-in to avoid click, then fade to silence
  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(volume, startTime + 0.012);
  gain.gain.linearRampToValueAtTime(0, startTime + duration);

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.01);
}

/**
 * Two ascending tones: C5 (523 Hz) → G5 (784 Hz)
 */
export async function playSuccess(): Promise<void> {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  try {
    if (audioCtx.state === "suspended") await audioCtx.resume();
    const t = audioCtx.currentTime;
    scheduleTone(audioCtx, 523, t,        0.11); // C5
    scheduleTone(audioCtx, 784, t + 0.13, 0.16); // G5
  } catch {
    // Silently ignore — audio is non-critical
  }
}

/**
 * Two descending tones: Eb4 (311 Hz) → Bb3 (233 Hz)
 */
export async function playFailure(): Promise<void> {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  try {
    if (audioCtx.state === "suspended") await audioCtx.resume();
    const t = audioCtx.currentTime;
    scheduleTone(audioCtx, 311, t,        0.11); // Eb4
    scheduleTone(audioCtx, 233, t + 0.13, 0.16); // Bb3
  } catch {
    // Silently ignore
  }
}

export function loadMuted(): boolean {
  try {
    return localStorage.getItem(MUTE_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function saveMuted(muted: boolean): void {
  try {
    localStorage.setItem(MUTE_STORAGE_KEY, String(muted));
  } catch {
    // ignore
  }
}

export const AUTO_SPEAK_STORAGE_KEY = "synonym-recall-auto-speak";

/** Default ON — returns true unless the user explicitly saved false */
export function loadAutoSpeak(): boolean {
  try {
    const stored = localStorage.getItem(AUTO_SPEAK_STORAGE_KEY);
    return stored === null ? true : stored === "true";
  } catch {
    return true;
  }
}

export function saveAutoSpeak(value: boolean): void {
  try {
    localStorage.setItem(AUTO_SPEAK_STORAGE_KEY, String(value));
  } catch {
    // ignore
  }
}
