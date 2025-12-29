import { useState, useRef, useEffect, useCallback } from 'react';
import { INITIAL_PATCH, KEYBOARD_MAP } from '../constants';
import { AudioEngine } from '../services/audioEngine';
import { SynthPatch } from '../types';
import { generateEvolvedPatch } from '../utils/patchEvolution';

export const useSynthesizer = () => {
  // Initialize state from LocalStorage if available to persist user creations on refresh
  const [patch, setPatch] = useState<SynthPatch>(() => {
    try {
      const saved = localStorage.getItem('git_dat_vst_patch');
      return saved ? JSON.parse(saved) : INITIAL_PATCH;
    } catch (e) {
      return INITIAL_PATCH;
    }
  });

  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set());
  const [isStarted, setIsStarted] = useState(false);
  const engineRef = useRef<AudioEngine | null>(null);

  const initAudio = useCallback(async () => {
    if (engineRef.current) return;
    const newEngine = new AudioEngine(patch);
    await newEngine.init();
    engineRef.current = newEngine;
    setIsStarted(true);
  }, [patch]);

  // Sync patch changes to engine and LocalStorage
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.updatePatch(patch);
    }
    // Auto-save to local storage
    localStorage.setItem('git_dat_vst_patch', JSON.stringify(patch));
  }, [patch]);

  const triggerAttack = useCallback((note: number, velocity: number = 100) => {
    if (!isStarted || !engineRef.current) return;
    setActiveNotes(prev => new Set(prev).add(note));
    engineRef.current.triggerAttack({ note, velocity });
  }, [isStarted]);

  const triggerRelease = useCallback((note: number) => {
    if (!isStarted || !engineRef.current) return;
    setActiveNotes(prev => { const n = new Set(prev); n.delete(note); return n; });
    engineRef.current.triggerRelease(note);
  }, [isStarted]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat || !isStarted) return;
      const note = KEYBOARD_MAP[e.key.toLowerCase()];
      if (note) triggerAttack(note);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const note = KEYBOARD_MAP[e.key.toLowerCase()];
      if (note) triggerRelease(note);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => { 
      window.removeEventListener('keydown', handleKeyDown); 
      window.removeEventListener('keyup', handleKeyUp); 
    };
  }, [isStarted, triggerAttack, triggerRelease]);

  const evolvePatch = useCallback(() => {
    setPatch(current => generateEvolvedPatch(current));
  }, []);

  return {
    patch,
    setPatch,
    activeNotes,
    isStarted,
    initAudio,
    evolvePatch,
    triggerAttack,
    triggerRelease,
    analyser: engineRef.current?.getAnalyser() || null
  };
};