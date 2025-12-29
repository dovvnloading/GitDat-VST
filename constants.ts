import { SynthPatch, Waveform, FilterType } from './types';

export const INITIAL_PATCH: SynthPatch = {
  oscillators: [
    { id: 0, type: Waveform.SAWTOOTH, detune: 0, semitone: 0, gain: 0.8 },
    { id: 1, type: Waveform.SQUARE, detune: 10, semitone: 0, gain: 0.6 },
    { id: 2, type: Waveform.SINE, detune: -5, semitone: -12, gain: 0.4 },
  ],
  filter: {
    cutoff: 2000,
    resonance: 5,
    type: FilterType.LOWPASS,
    envAmount: 2000,
  },
  ampEnvelope: {
    attack: 0.01,
    decay: 0.2,
    sustain: 0.6,
    release: 0.5,
  },
  filterEnvelope: {
    attack: 0.05,
    decay: 0.3,
    sustain: 0.2,
    release: 0.8,
  },
  lfo: {
    rate: 4.0,
    depth: 0.2,
    target: 'filter',
    shape: Waveform.SINE,
  },
  unison: {
    amount: 0.0,
    detune: 0.5,
    spread: 0.5,
  },
  delay: {
    time: 0.4,
    feedback: 0.3,
    mix: 0.2,
  },
  reverb: {
    mix: 0.3,
    decay: 2.0,
    tone: 3000,
  },
  polyphony: {
    mode: 'poly',
    glide: 0.0, // 0s default
  },
  masterVolume: 0.7,
};

// Map computer keys to MIDI notes (FL Studio / Ableton style)
export const KEYBOARD_MAP: Record<string, number> = {
  // Lower Row (Z-M + ,./) -> C4 to E5
  'z': 60, // C4
  's': 61, // C#4
  'x': 62, // D4
  'd': 63, // D#4
  'c': 64, // E4
  'v': 65, // F4
  'g': 66, // F#4
  'b': 67, // G4
  'h': 68, // G#4
  'n': 69, // A4
  'j': 70, // A#4
  'm': 71, // B4
  ',': 72, // C5
  'l': 73, // C#5
  '.': 74, // D5
  ';': 75, // D#5
  '/': 76, // E5

  // Upper Row (Q-P + []) -> C5 to G6
  'q': 72, // C5
  '2': 73, // C#5
  'w': 74, // D5
  '3': 75, // D#5
  'e': 76, // E5
  'r': 77, // F5
  '5': 78, // F#5
  't': 79, // G5
  '6': 80, // G#5
  'y': 81, // A5
  '7': 82, // A#5
  'u': 83, // B5
  'i': 84, // C6
  '9': 85, // C#6
  'o': 86, // D6
  '0': 87, // D#6
  'p': 88, // E6
  '[': 89, // F6
  '=': 90, // F#6
  ']': 91, // G6
};