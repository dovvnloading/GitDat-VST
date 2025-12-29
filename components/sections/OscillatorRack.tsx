import React from 'react';
import { SynthPatch } from '../../types';
import { RackModule } from '../shared/RackModule';
import { OscUnit } from '../controls/OscUnit';
import { Knob } from '../Knob';

interface OscillatorRackProps {
    patch: SynthPatch;
    setPatch: React.Dispatch<React.SetStateAction<SynthPatch>>;
}

export const OscillatorRack: React.FC<OscillatorRackProps> = ({ patch, setPatch }) => {
    return (
        <RackModule title="OSCILLATORS" accent="#00f0ff" className="h-full">
            <div className="flex flex-col gap-3 h-full">
                
                {/* VOICING CONTROLS */}
                <div className="flex items-center justify-between bg-vst-bg/50 p-2 rounded border border-vst-border/50">
                    <div className="flex flex-col gap-1">
                        <span className="text-[8px] text-vst-muted font-bold tracking-wider">VOICING</span>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => setPatch(p => ({...p, polyphony: {...p.polyphony, mode: 'poly'}}))}
                                className={`px-2 py-1 text-[9px] rounded font-bold border ${patch.polyphony.mode === 'poly' ? 'bg-vst-accent/20 border-vst-accent text-vst-accent shadow-[0_0_8px_rgba(0,240,255,0.3)]' : 'bg-vst-panel border-vst-border text-vst-muted hover:text-white'}`}
                            >
                                POLY
                            </button>
                            <button 
                                onClick={() => setPatch(p => ({...p, polyphony: {...p.polyphony, mode: 'mono'}}))}
                                className={`px-2 py-1 text-[9px] rounded font-bold border ${patch.polyphony.mode === 'mono' ? 'bg-vst-accent/20 border-vst-accent text-vst-accent shadow-[0_0_8px_rgba(0,240,255,0.3)]' : 'bg-vst-panel border-vst-border text-vst-muted hover:text-white'}`}
                            >
                                MONO
                            </button>
                        </div>
                    </div>
                    <div className="pl-4 border-l border-vst-border/50">
                         <Knob 
                            size="sm" 
                            label="GLIDE" 
                            value={patch.polyphony.glide} 
                            min={0} 
                            max={1} 
                            step={0.01} 
                            onChange={(v) => setPatch(p => ({...p, polyphony: {...p.polyphony, glide: v}}))} 
                            color="#00f0ff"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-3 justify-between flex-1">
                    {patch.oscillators.map((osc, i) => (
                        <OscUnit 
                        key={osc.id} 
                        index={i}
                        osc={osc} 
                        onUpdate={(newOsc) => {
                            const newOscs = [...patch.oscillators];
                            newOscs[i] = newOsc;
                            setPatch(prev => ({...prev, oscillators: newOscs}));
                        }}
                        />
                    ))}
                </div>
            </div>
        </RackModule>
    );
};