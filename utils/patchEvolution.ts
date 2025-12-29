import { SynthPatch, Waveform, OscillatorParams, FilterType, LFOParams, PolyphonyParams } from '../types';

// --- GENETIC EVOLUTION LOGIC ---

/**
 * Clamps a number between min and max
 */
const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

/**
 * Drifts a value by a percentage variance, keeping it within bounds.
 */
const drift = (value: number, variance: number, min: number, max: number, integer: boolean = false): number => {
  const range = max - min;
  const delta = (Math.random() * 2 - 1) * (range * variance); 
  let result = clamp(value + delta, min, max);
  return integer ? Math.round(result) : result;
};

/**
 * Picks a random item from an array
 */
const pick = <T>(options: T[]): T => options[Math.floor(Math.random() * options.length)];

/**
 * Determines if a mutation should occur based on probability
 */
const shouldMutate = (probability: number): boolean => Math.random() < probability;

// --- COMPONENT MUTATORS ---

const evolveOscillators = (oscs: OscillatorParams[]): OscillatorParams[] => {
  return oscs.map(osc => {
    // 1. Waveform Mutation
    const isMutation = shouldMutate(0.40); 
    
    let type = osc.type;
    if (isMutation) {
      const waves = Object.values(Waveform);
      const options = waves.filter(w => w !== type);
      type = pick(options);
    }

    // 2. Harmonic Tuning
    let semitone = osc.semitone;
    if (shouldMutate(0.15)) {
        const intervals = [-24, -12, -7, 0, 7, 12, 19, 24];
        if (Math.random() > 0.6) {
             semitone = pick(intervals);
        } else {
             semitone = intervals.reduce((prev, curr) => 
                Math.abs(curr - semitone) < Math.abs(prev - semitone) ? curr : prev
            , 0);
        }
    }

    // INTELLIGENT RULE: If pitched extremely low (Bass), prefer Saw or Square for visibility
    if (semitone <= -12 && (type === Waveform.SINE || type === Waveform.TRIANGLE) && shouldMutate(0.5)) {
        type = pick([Waveform.SAWTOOTH, Waveform.SQUARE]);
    }

    // 3. Analog Detune Drift
    const detune = drift(osc.detune, 0.05, -15, 15);

    // 4. Gain Balancing
    const gain = drift(osc.gain, 0.1, 0.3, 0.8);

    return { ...osc, type, semitone, detune, gain };
  });
};

const evolveFilter = (flt: SynthPatch['filter']): SynthPatch['filter'] => {
  const isMutation = shouldMutate(0.25); 
  let res = drift(flt.resonance, 0.1, 0.5, 12);
  let cutoffVariance = res > 8 ? 0.05 : 0.25; 
  
  let cutoff = drift(flt.cutoff, cutoffVariance, 100, 10000);

  // INTELLIGENT RULE: Prevent high resonance with very low cutoff (prevents sub-bass screaming)
  if (res > 8 && cutoff < 300) {
      cutoff = 300;
  }

  return {
    cutoff, 
    resonance: res,
    envAmount: drift(flt.envAmount, 0.15, -3000, 3000),
    type: isMutation ? pick([FilterType.LOWPASS, FilterType.HIGHPASS, FilterType.BANDPASS]) : flt.type
  };
};

const evolveEnvelope = (env: SynthPatch['ampEnvelope'], isAmp: boolean): SynthPatch['ampEnvelope'] => {
  const attack = drift(env.attack, 0.2, 0.001, isAmp ? 1.5 : 2.5); 
  const decay = drift(env.decay, 0.2, 0.1, 3.0);
  const sustain = drift(env.sustain, 0.2, isAmp ? 0.3 : 0, 1.0);
  const release = drift(env.release, 0.2, 0.1, 4.0);

  return { attack, decay, sustain, release };
};

const evolveLFO = (lfo: LFOParams): LFOParams => {
  const isStructuralMutation = shouldMutate(0.20); 

  let newTarget = lfo.target;
  let newShape = lfo.shape;

  if (isStructuralMutation) {
     const roll = Math.random();
     if (roll < 0.7) newTarget = 'filter';
     else if (roll < 0.9) newTarget = 'amp'; 
     else newTarget = 'pitch';

     if (newTarget === 'pitch') {
         newShape = pick([Waveform.SINE, Waveform.TRIANGLE]);
     } else {
         newShape = pick([Waveform.SINE, Waveform.TRIANGLE, Waveform.SQUARE, Waveform.SAWTOOTH]);
     }
  }

  let newRate = drift(lfo.rate, 0.1, 0.1, 12);
  let newDepth = drift(lfo.depth, 0.15, 0, 1);

  if (newTarget === 'pitch') {
      newDepth = Math.min(newDepth, 0.035); 
  } else if (newTarget === 'amp') {
      newDepth = Math.min(newDepth, 0.6);
  }

  return {
    rate: newRate,
    depth: newDepth,
    target: newTarget,
    shape: newShape
  };
};

const evolvePolyphony = (poly: PolyphonyParams): PolyphonyParams => {
    // 20% Chance to switch mode
    let mode = poly.mode;
    if (shouldMutate(0.2)) {
        mode = mode === 'poly' ? 'mono' : 'poly';
    }

    // Drift glide time, but prioritize keeping it tight for most patches
    let glide = drift(poly.glide, 0.2, 0, 0.8);
    // If we switched to poly, glide usually should be 0 unless specific effect wanted
    if (mode === 'poly' && Math.random() > 0.2) glide = 0;
    
    // If mono, encourage some glide
    if (mode === 'mono' && glide < 0.01 && Math.random() > 0.5) glide = 0.1;

    return { mode, glide };
};

const evolveEffects = (current: SynthPatch): Partial<SynthPatch> => {
    const unison = {
        amount: drift(current.unison.amount, 0.1, 0, 0.7),
        detune: drift(current.unison.detune, 0.1, 0, 0.8),
        spread: drift(current.unison.spread, 0.1, 0, 1)
    };

    const delay = {
        time: drift(current.delay.time, 0.05, 0.1, 1.0),
        feedback: drift(current.delay.feedback, 0.1, 0, 0.7), 
        mix: drift(current.delay.mix, 0.1, 0, 0.4)
    };

    const reverb = {
        decay: drift(current.reverb.decay, 0.1, 0.5, 4.0),
        tone: drift(current.reverb.tone, 0.1, 1000, 5000),
        mix: drift(current.reverb.mix, 0.1, 0, 0.5)
    };

    return { unison, delay, reverb };
};

/**
 * THE EVOLUTION ENGINE
 */
export const generateEvolvedPatch = (current: SynthPatch): SynthPatch => {
  console.log('[Genetic Engine] Mutating DNA...');
  
  const oscs = evolveOscillators(current.oscillators);
  const filter = evolveFilter(current.filter);
  const ampEnv = evolveEnvelope(current.ampEnvelope, true);
  const filtEnv = evolveEnvelope(current.filterEnvelope, false);
  const lfo = evolveLFO(current.lfo);
  const fx = evolveEffects(current);
  const poly = evolvePolyphony(current.polyphony);

  // Intelligent Volume Compensation
  // If we have high Unison and Delay mix, we should slightly lower the master volume to prevent limiting
  let volTarget = 0.7;
  if (fx.unison!.amount > 0.5 || fx.delay!.mix > 0.3) volTarget = 0.6;
  if (poly.mode === 'mono') volTarget = 0.8; // Mono can be louder

  return {
    ...current,
    oscillators: oscs,
    filter: filter,
    ampEnvelope: ampEnv,
    filterEnvelope: filtEnv,
    lfo: lfo,
    unison: fx.unison!,
    delay: fx.delay!,
    reverb: fx.reverb!,
    polyphony: poly,
    masterVolume: drift(current.masterVolume, 0.05, volTarget - 0.1, volTarget + 0.1) 
  };
};