export enum Waveform {
  SINE = 'sine',
  SQUARE = 'square',
  SAWTOOTH = 'sawtooth',
  TRIANGLE = 'triangle',
}

export enum FilterType {
  LOWPASS = 'lowpass',
  HIGHPASS = 'highpass',
  BANDPASS = 'bandpass',
}

export interface OscillatorParams {
  id: number;
  type: Waveform;
  detune: number; // cents
  semitone: number;
  gain: number;
}

export interface FilterParams {
  cutoff: number; // Hz
  resonance: number;
  type: FilterType;
  envAmount: number;
}

export interface EnvelopeParams {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export interface DelayParams {
  time: number;
  feedback: number;
  mix: number;
}

export interface ReverbParams {
  mix: number;
  decay: number; // seconds
  tone: number; // Hz (Lowpass)
}

export interface UnisonParams {
  amount: number; // Mix 0-1
  detune: number; // LFO Depth for delay modulation
  spread: number; // Stereo width/LFO Rate offset
}

export interface LFOParams {
  rate: number; // Hz
  depth: number; // 0-1
  target: 'pitch' | 'filter' | 'amp';
  shape: Waveform;
}

export interface PolyphonyParams {
  mode: 'poly' | 'mono';
  glide: number; // Portamento time in seconds (0 - 1)
}

export interface SynthPatch {
  oscillators: OscillatorParams[];
  filter: FilterParams;
  ampEnvelope: EnvelopeParams;
  filterEnvelope: EnvelopeParams;
  lfo: LFOParams;
  unison: UnisonParams;
  delay: DelayParams;
  reverb: ReverbParams;
  polyphony: PolyphonyParams;
  masterVolume: number;
}

export interface NoteEvent {
  note: number; // MIDI note number
  velocity: number;
}