import { SynthPatch, Waveform, FilterType, NoteEvent, LFOParams } from '../types';

class Voice {
  private ctx: AudioContext;
  private output: AudioNode;
  private oscs: OscillatorNode[] = [];
  private gains: GainNode[] = [];
  private filter: BiquadFilterNode;
  private vca: GainNode;
  private patch: SynthPatch;
  private note: number;
  private startTime: number;

  // LFO Components
  private lfo: OscillatorNode;
  private lfoGain: GainNode;

  constructor(ctx: AudioContext, output: AudioNode, patch: SynthPatch, noteEvent: NoteEvent) {
    this.ctx = ctx;
    this.output = output;
    this.patch = patch;
    this.note = noteEvent.note;
    this.startTime = ctx.currentTime;

    // Filter
    this.filter = ctx.createBiquadFilter();
    this.filter.type = patch.filter.type as BiquadFilterType;
    this.filter.Q.value = patch.filter.resonance;
    
    // Filter Envelope logic
    const fEnv = patch.filterEnvelope;
    const baseCutoff = Math.max(0, patch.filter.cutoff);
    this.filter.frequency.setValueAtTime(baseCutoff, ctx.currentTime);
    const peakCutoff = Math.max(0, Math.min(22000, baseCutoff + patch.filter.envAmount));
    
    this.filter.frequency.linearRampToValueAtTime(peakCutoff, ctx.currentTime + fEnv.attack);
    this.filter.frequency.setTargetAtTime(baseCutoff + (peakCutoff - baseCutoff) * fEnv.sustain, ctx.currentTime + fEnv.attack, fEnv.decay);

    // VCA (Amplifier)
    this.vca = ctx.createGain();
    this.vca.gain.setValueAtTime(0, ctx.currentTime);
    
    // Amp Envelope
    const aEnv = patch.ampEnvelope;
    this.vca.gain.linearRampToValueAtTime(noteEvent.velocity / 127, ctx.currentTime + aEnv.attack);
    this.vca.gain.setTargetAtTime((noteEvent.velocity / 127) * aEnv.sustain, ctx.currentTime + aEnv.attack, aEnv.decay);

    // Oscillators
    this.initOscillators(this.note, 0);

    // LFO Setup
    this.lfo = ctx.createOscillator();
    this.lfo.type = patch.lfo.shape as OscillatorType;
    this.lfo.frequency.value = patch.lfo.rate;
    this.lfoGain = ctx.createGain();
    this.lfo.connect(this.lfoGain);
    this.lfo.start();

    // Initial LFO Routing
    this.updateLFO(patch.lfo);

    // Signal chain: Oscs -> Filter -> VCA -> Output (which goes to Master/Delay)
    this.filter.connect(this.vca);
    this.vca.connect(this.output);
  }

  private initOscillators(note: number, glideTime: number = 0) {
    const freq = 440 * Math.pow(2, (note - 69) / 12);
    
    this.patch.oscillators.forEach(oscParams => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = oscParams.type as OscillatorType;
      
      const oscFreq = freq * Math.pow(2, oscParams.semitone / 12);
      
      // If gliding, we might be starting from a different freq, but for init, we assume instant unless updated immediately after
      osc.frequency.setValueAtTime(oscFreq, this.ctx.currentTime);
      osc.detune.setValueAtTime(oscParams.detune, this.ctx.currentTime);

      gain.gain.value = oscParams.gain;

      osc.connect(gain);
      gain.connect(this.filter);
      osc.start();

      this.oscs.push(osc);
      this.gains.push(gain);
    });
  }

  // Used for Mono Legato Glide
  glideTo(newNote: number, glideTime: number) {
    this.note = newNote;
    const t = this.ctx.currentTime;
    const baseFreq = 440 * Math.pow(2, (newNote - 69) / 12);

    this.oscs.forEach((osc, i) => {
        const oscParams = this.patch.oscillators[i];
        const targetFreq = baseFreq * Math.pow(2, oscParams.semitone / 12);
        
        osc.frequency.cancelScheduledValues(t);
        // Exponential ramp sounds most natural for pitch glide
        try {
            osc.frequency.setTargetAtTime(targetFreq, t, glideTime || 0.001);
        } catch(e) {
            // Fallback for safety
            osc.frequency.setValueAtTime(targetFreq, t);
        }
    });

    // We do NOT re-trigger envelopes in true Legato style
  }

  updateLFO(lfo: LFOParams) {
    const t = this.ctx.currentTime;
    
    // Update basic params
    this.lfo.type = lfo.shape as OscillatorType;
    this.lfo.frequency.setTargetAtTime(lfo.rate, t, 0.1);

    // Calculate Gain and Target
    let gainAmount = 0;
    
    // Disconnect previous connections safely
    this.lfoGain.disconnect();

    if (lfo.target === 'pitch') {
        gainAmount = lfo.depth * 1000; // +/- 1000 cents
        this.oscs.forEach(osc => this.lfoGain.connect(osc.detune));
    } else if (lfo.target === 'filter') {
        gainAmount = lfo.depth * 2000; // +/- 2000Hz
        this.lfoGain.connect(this.filter.frequency);
    } else if (lfo.target === 'amp') {
        gainAmount = lfo.depth * 0.5;
        this.lfoGain.connect(this.vca.gain);
    }

    this.lfoGain.gain.setTargetAtTime(gainAmount, t, 0.1);
  }

  release() {
    const { currentTime } = this.ctx;
    const aEnv = this.patch.ampEnvelope;
    const fEnv = this.patch.filterEnvelope;

    // Release VCA
    this.vca.gain.cancelScheduledValues(currentTime);
    this.vca.gain.setValueAtTime(this.vca.gain.value, currentTime);
    this.vca.gain.exponentialRampToValueAtTime(0.001, currentTime + aEnv.release);

    // Release Filter
    this.filter.frequency.cancelScheduledValues(currentTime);
    this.filter.frequency.setValueAtTime(this.filter.frequency.value, currentTime);
    this.filter.frequency.exponentialRampToValueAtTime(Math.max(10, this.patch.filter.cutoff), currentTime + fEnv.release);

    // Stop oscillators and LFO after release
    const stopTime = currentTime + Math.max(aEnv.release, fEnv.release) + 0.1;
    
    // Schedule cleanup
    this.oscs.forEach((osc, index) => {
        osc.stop(stopTime);
        // Use the first oscillator to trigger the disconnect cleanup
        if (index === 0) {
            osc.onended = () => this.disconnect();
        }
    });
    this.lfo.stop(stopTime);
  }

  // Proper garbage collection for Web Audio nodes
  private disconnect() {
    this.oscs.forEach(o => o.disconnect());
    this.gains.forEach(g => g.disconnect());
    this.filter.disconnect();
    this.vca.disconnect();
    this.lfo.disconnect();
    this.lfoGain.disconnect();
    // We do not disconnect this.output, as that is the shared mixer bus
  }
}

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;
  
  // Unison (Hyper/Dimension style)
  private unisonInput: GainNode | null = null;
  private unisonOutput: GainNode | null = null; 
  private uniDelayL: DelayNode | null = null;
  private uniDelayR: DelayNode | null = null;
  private uniLfoL: OscillatorNode | null = null;
  private uniLfoR: OscillatorNode | null = null;
  private uniLfoGainL: GainNode | null = null;
  private uniLfoGainR: GainNode | null = null;
  private uniWet: GainNode | null = null;
  
  // Delay
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;
  private delayDry: GainNode | null = null;
  private delayWet: GainNode | null = null;

  // Reverb
  private reverbNode: ConvolverNode | null = null;
  private reverbWet: GainNode | null = null;
  private reverbDry: GainNode | null = null;
  private reverbTone: BiquadFilterNode | null = null;
  private currentReverbDecay: number = 0;

  private analyser: AnalyserNode | null = null;
  
  private activeVoices: Map<number, Voice> = new Map();
  
  // Mono Logic
  private monoVoice: Voice | null = null;
  private noteStack: number[] = []; // Stack for Last-Note Priority

  private patch: SynthPatch;

  constructor(initialPatch: SynthPatch) {
    this.patch = initialPatch;
  }

  async init() {
    if (this.ctx) return;
    
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Master Chain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.patch.masterVolume;
    
    // Dynamics Compressor (Safety Limiter for Web)
    this.compressor = this.ctx.createDynamicsCompressor();
    this.compressor.threshold.value = -20;
    this.compressor.knee.value = 30;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.25;

    // Analyser
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 2048;

    // --- Unison Setup (Dimension Expander) ---
    this.unisonInput = this.ctx.createGain();
    this.unisonOutput = this.ctx.createGain();
    this.uniWet = this.ctx.createGain();

    this.uniDelayL = this.ctx.createDelay(0.1);
    this.uniDelayR = this.ctx.createDelay(0.1);
    
    const pannerL = this.ctx.createStereoPanner();
    pannerL.pan.value = -1; 
    const pannerR = this.ctx.createStereoPanner();
    pannerR.pan.value = 1; 
    
    this.uniLfoL = this.ctx.createOscillator();
    this.uniLfoR = this.ctx.createOscillator();
    this.uniLfoGainL = this.ctx.createGain();
    this.uniLfoGainR = this.ctx.createGain();

    this.uniLfoL.connect(this.uniLfoGainL).connect(this.uniDelayL.delayTime);
    this.uniLfoR.connect(this.uniLfoGainR).connect(this.uniDelayR.delayTime);
    
    this.uniLfoL.start();
    this.uniLfoR.start();

    this.unisonInput.connect(this.unisonOutput); 
    this.unisonInput.connect(this.uniDelayL);
    this.unisonInput.connect(this.uniDelayR);
    
    this.uniDelayL.connect(pannerL);
    this.uniDelayR.connect(pannerR);
    
    pannerL.connect(this.uniWet);
    pannerR.connect(this.uniWet);
    this.uniWet.connect(this.unisonOutput);


    // --- Delay Setup ---
    this.delayNode = this.ctx.createDelay(2.0);
    this.delayFeedback = this.ctx.createGain();
    this.delayDry = this.ctx.createGain();
    this.delayWet = this.ctx.createGain();

    // --- Reverb Setup ---
    this.reverbNode = this.ctx.createConvolver();
    this.reverbWet = this.ctx.createGain();
    this.reverbDry = this.ctx.createGain();
    this.reverbTone = this.ctx.createBiquadFilter();
    this.reverbTone.type = 'lowpass';
    
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    
    this.unisonOutput.connect(this.delayNode); 
    this.unisonOutput.connect(this.delayDry);  

    this.delayNode.connect(this.delayWet);
    
    const preReverbGain = this.ctx.createGain();
    this.delayWet.connect(preReverbGain);
    this.delayDry.connect(preReverbGain);

    preReverbGain.connect(this.reverbDry);
    preReverbGain.connect(this.reverbNode);
    
    this.reverbNode.connect(this.reverbTone);
    this.reverbTone.connect(this.reverbWet);

    // Final Routing Chain
    this.reverbDry.connect(this.masterGain);
    this.reverbWet.connect(this.masterGain);

    this.masterGain.connect(this.compressor);
    this.compressor.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);

    this.updateDelayParams(this.patch.delay);
    this.updateReverbParams(this.patch.reverb);
    this.updateUnisonParams(this.patch.unison);
  }

  private buildImpulseResponse(duration: number, decay: number): AudioBuffer {
    if (!this.ctx) throw new Error("No Context");
    const rate = this.ctx.sampleRate;
    const length = rate * duration;
    const impulse = this.ctx.createBuffer(2, length, rate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
        const n = i / length;
        const env = Math.pow(1 - n, decay); 
        left[i] = (Math.random() * 2 - 1) * env;
        right[i] = (Math.random() * 2 - 1) * env;
    }
    return impulse;
  }

  updateDelayParams(params: SynthPatch['delay']) {
    if (!this.delayNode || !this.delayFeedback || !this.delayDry || !this.delayWet || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.delayNode.delayTime.setTargetAtTime(params.time, t, 0.1);
    this.delayFeedback.gain.setTargetAtTime(params.feedback, t, 0.1);
    this.delayWet.gain.setTargetAtTime(params.mix, t, 0.1);
    this.delayDry.gain.setTargetAtTime(1 - params.mix, t, 0.1);
  }

  updateReverbParams(params: SynthPatch['reverb']) {
    if (!this.reverbNode || !this.reverbWet || !this.reverbDry || !this.reverbTone || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.reverbWet.gain.setTargetAtTime(params.mix, t, 0.1);
    this.reverbDry.gain.setTargetAtTime(1 - params.mix, t, 0.1);
    this.reverbTone.frequency.setTargetAtTime(params.tone, t, 0.1);
    if (Math.abs(this.currentReverbDecay - params.decay) > 0.1) {
        this.currentReverbDecay = params.decay;
        const bufferDuration = params.decay; 
        const decayCurve = 3; 
        try {
            const buffer = this.buildImpulseResponse(bufferDuration, decayCurve);
            this.reverbNode.buffer = buffer;
        } catch (e) {
            console.error("Failed to build reverb IR", e);
        }
    }
  }

  updateUnisonParams(params: SynthPatch['unison']) {
    if (!this.uniWet || !this.uniDelayL || !this.uniDelayR || !this.uniLfoL || !this.uniLfoR || !this.uniLfoGainL || !this.uniLfoGainR || !this.ctx) return;
    const t = this.ctx.currentTime;
    this.uniWet.gain.setTargetAtTime(params.amount, t, 0.1);
    const depth = params.detune * 0.005; 
    this.uniLfoGainL.gain.setTargetAtTime(depth, t, 0.1);
    this.uniLfoGainR.gain.setTargetAtTime(depth, t, 0.1);
    const baseRate = 0.5 + (params.spread * 1.5);
    this.uniLfoL.frequency.setTargetAtTime(baseRate, t, 0.1);
    this.uniLfoR.frequency.setTargetAtTime(baseRate * 1.3, t, 0.1); 
    const delayBase = 0.010 + (params.spread * 0.020); 
    this.uniDelayL.delayTime.setTargetAtTime(delayBase, t, 0.1);
    this.uniDelayR.delayTime.setTargetAtTime(delayBase * 1.5, t, 0.1);
  }

  updatePatch(newPatch: SynthPatch) {
    this.patch = newPatch;
    if (this.masterGain && this.ctx) {
       this.masterGain.gain.setTargetAtTime(newPatch.masterVolume, this.ctx.currentTime, 0.05);
    }
    this.updateDelayParams(newPatch.delay);
    this.updateReverbParams(newPatch.reverb);
    this.updateUnisonParams(newPatch.unison);
    
    // Update active voices with new LFO settings
    this.activeVoices.forEach(voice => voice.updateLFO(newPatch.lfo));
    if (this.monoVoice) this.monoVoice.updateLFO(newPatch.lfo);
  }

  triggerAttack(noteEvent: NoteEvent) {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    if (!this.unisonInput) return;

    // --- MONO MODE LOGIC ---
    if (this.patch.polyphony.mode === 'mono') {
        // Add note to stack if not exists, move to top if exists
        this.noteStack = this.noteStack.filter(n => n !== noteEvent.note);
        this.noteStack.push(noteEvent.note);

        if (this.monoVoice) {
            // Legato glide to new note
            const glideTime = this.patch.polyphony.glide;
            this.monoVoice.glideTo(noteEvent.note, glideTime);
        } else {
            // Create new voice
            this.monoVoice = new Voice(this.ctx, this.unisonInput, this.patch, noteEvent);
        }
        return;
    }

    // --- POLY MODE LOGIC ---
    // Standard behavior: kill previous voice on same key, start new one
    if (this.activeVoices.has(noteEvent.note)) {
      this.activeVoices.get(noteEvent.note)?.release();
    }

    const voice = new Voice(this.ctx, this.unisonInput, this.patch, noteEvent);
    this.activeVoices.set(noteEvent.note, voice);
  }

  triggerRelease(note: number) {
     // --- MONO MODE LOGIC ---
     if (this.patch.polyphony.mode === 'mono') {
        // Remove from stack
        this.noteStack = this.noteStack.filter(n => n !== note);

        if (this.noteStack.length > 0) {
            // Glide back to the previous note in stack (Last-Note Priority)
            const prevNote = this.noteStack[this.noteStack.length - 1];
            if (this.monoVoice) {
                const glideTime = this.patch.polyphony.glide;
                this.monoVoice.glideTo(prevNote, glideTime);
            }
        } else {
            // No notes left, release the voice
            if (this.monoVoice) {
                this.monoVoice.release();
                this.monoVoice = null;
            }
        }
        return;
    }

    // --- POLY MODE LOGIC ---
    if (this.activeVoices.has(note)) {
      this.activeVoices.get(note)?.release();
      this.activeVoices.delete(note);
    }
  }

  getAnalyser() {
    return this.analyser;
  }
}