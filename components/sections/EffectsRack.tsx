import React from 'react';
import { SynthPatch } from '../../types';
import { RackModule } from '../shared/RackModule';
import { Knob } from '../Knob';

interface EffectsRackProps {
    patch: SynthPatch;
    setPatch: React.Dispatch<React.SetStateAction<SynthPatch>>;
}

export const EffectsRack: React.FC<EffectsRackProps> = ({ patch, setPatch }) => {
    return (
        <RackModule title="EFFECTS CHAIN" accent="#ef4444" className="h-full">
            <div className="flex flex-col gap-4 h-full">
                
                {/* UNISON (DIMENSION EXPANDER) */}
                <div className="bg-vst-bg rounded p-2 border border-vst-border/50">
                    <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-bold text-vst-muted">HYPER UNISON</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_5px_cyan]"></div>
                    </div>
                    <div className="flex justify-between gap-1">
                    <Knob size="sm" label="STACK" value={patch.unison.amount} min={0} max={1} step={0.01} onChange={(v) => setPatch(p => ({...p, unison: {...p.unison, amount: v}}))} color="#22d3ee" />
                    <Knob size="sm" label="DETUNE" value={patch.unison.detune} min={0} max={1} step={0.01} onChange={(v) => setPatch(p => ({...p, unison: {...p.unison, detune: v}}))} color="#22d3ee" />
                    <Knob size="sm" label="SPREAD" value={patch.unison.spread} min={0} max={1} step={0.01} onChange={(v) => setPatch(p => ({...p, unison: {...p.unison, spread: v}}))} color="#22d3ee" />
                    </div>
                </div>

                {/* DELAY */}
                <div className="bg-vst-bg rounded p-2 border border-vst-border/50">
                    <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-bold text-vst-muted">STEREO DELAY</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_red]"></div>
                    </div>
                    <div className="flex justify-between gap-1">
                    <Knob size="sm" label="TIME" value={patch.delay.time} min={0.01} max={1} step={0.01} onChange={(v) => setPatch(p => ({...p, delay: {...p.delay, time: v}}))} />
                    <Knob size="sm" label="FDBK" value={patch.delay.feedback} min={0} max={0.95} step={0.01} onChange={(v) => setPatch(p => ({...p, delay: {...p.delay, feedback: v}}))} />
                    <Knob size="sm" label="MIX" value={patch.delay.mix} min={0} max={0.5} step={0.01} onChange={(v) => setPatch(p => ({...p, delay: {...p.delay, mix: v}}))} />
                    </div>
                </div>
                
                {/* REVERB */}
                <div className="bg-vst-bg rounded p-2 border border-vst-border/50 flex-1">
                    <div className="flex justify-between items-center mb-2">
                    <span className="text-[9px] font-bold text-vst-muted">PLATE REVERB</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_red]"></div>
                    </div>
                    <div className="flex justify-between gap-1">
                    <Knob size="sm" label="DECAY" value={patch.reverb.decay} min={0.1} max={5} step={0.1} onChange={(v) => setPatch(p => ({...p, reverb: {...p.reverb, decay: v}}))} />
                    <Knob size="sm" label="DAMP" value={patch.reverb.tone} min={1000} max={10000} step={100} onChange={(v) => setPatch(p => ({...p, reverb: {...p.reverb, tone: v}}))} />
                    <Knob size="sm" label="MIX" value={patch.reverb.mix} min={0} max={0.8} step={0.01} onChange={(v) => setPatch(p => ({...p, reverb: {...p.reverb, mix: v}}))} />
                    </div>
                </div>
            </div>
        </RackModule>
    );
};