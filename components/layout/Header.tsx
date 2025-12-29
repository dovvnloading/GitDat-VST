
import React from 'react';
import { Activity, Zap, Info } from 'lucide-react';
import { Visualizer } from '../Visualizer';
import { Knob } from '../Knob';
import { SynthPatch } from '../../types';

interface HeaderProps {
    activeNotes: Set<number>;
    patch: SynthPatch;
    setPatch: React.Dispatch<React.SetStateAction<SynthPatch>>;
    analyser: AnalyserNode | null;
    onEvolve: () => void;
    onShowInfo: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    activeNotes, 
    patch, 
    setPatch, 
    analyser, 
    onEvolve, 
    onShowInfo 
}) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-vst-border pb-6 mb-2">
             <div className="flex flex-col items-start">
                <div className="flex items-baseline gap-2">
                    <h1 className="text-3xl font-black italic tracking-tighter text-white">GIT-DAT <span className="text-vst-accent">VST</span></h1>
                    <span className="text-[10px] font-mono text-vst-muted bg-vst-panel px-1.5 py-0.5 rounded border border-vst-border">BETA / PROTOTYPE</span>
                </div>
                <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2 text-[10px] text-vst-muted font-mono">
                        <Activity size={12} className={activeNotes.size > 0 ? "text-vst-accent animate-pulse" : "text-vst-border"} />
                        <span>VOICES: {activeNotes.size}/16</span>
                    </div>
                </div>
             </div>

             {/* Main Visualizer Window */}
             <div className="flex-1 w-full h-24 md:h-20 mx-4 max-w-2xl">
                 <Visualizer analyser={analyser} />
             </div>

             {/* Master Output & Evolve */}
             <div className="flex items-center gap-6 pl-6 border-l border-vst-border/50">
                 <div className="flex flex-col items-center">
                    <Knob size="lg" label="MASTER" value={patch.masterVolume} min={0} max={1} step={0.01} onChange={(v) => setPatch(p => ({...p, masterVolume: v}))} color="#10b981" />
                 </div>
                 
                 {/* EVOLVE BUTTON (Reactor Core Style) */}
                 <button 
                    onClick={onEvolve}
                    className="relative group w-16 h-16 rounded-full bg-vst-panel border border-vst-border shadow-inner flex items-center justify-center active:scale-95 transition-all"
                 >
                    <div className="absolute inset-0 rounded-full border border-vst-accent/30 animate-[spin_4s_linear_infinite] group-hover:border-vst-accent/80"></div>
                    <div className="absolute inset-2 rounded-full border border-vst-accent/10 animate-[spin_3s_linear_infinite_reverse]"></div>
                    <Zap className="w-6 h-6 text-vst-accent group-hover:text-white transition-colors fill-current" />
                    <div className="absolute -bottom-5 text-[9px] font-bold text-vst-accent tracking-widest opacity-80 group-hover:opacity-100">EVOLVE</div>
                 </button>

                 {/* INFO BUTTON */}
                 <button 
                    onClick={onShowInfo}
                    className="w-8 h-8 rounded flex items-center justify-center text-vst-muted hover:text-vst-accent hover:bg-vst-light/20 transition-all border border-transparent hover:border-vst-accent/30"
                    title="Developer Info"
                 >
                    <Info size={18} />
                 </button>
             </div>
         </div>
    );
};