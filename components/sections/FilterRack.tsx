import React from 'react';
import { SynthPatch, Waveform } from '../../types';
import { RackModule } from '../shared/RackModule';
import { Knob } from '../Knob';

interface FilterRackProps {
    patch: SynthPatch;
    setPatch: React.Dispatch<React.SetStateAction<SynthPatch>>;
}

export const FilterRack: React.FC<FilterRackProps> = ({ patch, setPatch }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <RackModule title="VCF FILTER" accent="#10b981">
                <div className="flex items-center justify-between px-2 py-4">
                    <div className="flex flex-col items-center">
                        <Knob size="lg" label="CUTOFF" value={patch.filter.cutoff} min={20} max={12000} step={10} onChange={(v) => setPatch(p => ({...p, filter: {...p.filter, cutoff: v}}))} color="#10b981" />
                    </div>
                    <Knob label="RES" value={patch.filter.resonance} min={0} max={15} step={0.1} onChange={(v) => setPatch(p => ({...p, filter: {...p.filter, resonance: v}}))} />
                    <Knob label="ENV AMT" value={patch.filter.envAmount} min={-5000} max={5000} step={100} onChange={(v) => setPatch(p => ({...p, filter: {...p.filter, envAmount: v}}))} />
                    <div className="flex flex-col gap-1 items-end justify-center ml-2 border-l border-vst-border pl-3">
                        <span className="text-[8px] text-vst-muted font-mono">MODE</span>
                        <div className="text-[10px] text-emerald-400 font-bold border border-emerald-500/30 px-2 py-0.5 rounded uppercase">{patch.filter.type}</div>
                    </div>
                </div>
            </RackModule>
            
            <RackModule title="LFO MODULATOR" className="justify-center" accent="#d946ef">
                    <div className="flex flex-col justify-between h-full p-1 gap-2">
                        {/* LFO Selectors */}
                        <div className="flex justify-between items-center bg-vst-bg/30 p-2 rounded border border-vst-border/30">
                            <div className="flex flex-col gap-1">
                            <span className="text-[8px] text-vst-muted font-bold">SHAPE</span>
                            <select 
                                className="bg-vst-panel text-[10px] font-mono text-fuchsia-400 outline-none cursor-pointer uppercase font-bold border border-vst-border rounded px-1"
                                value={patch.lfo.shape}
                                onChange={(e) => setPatch(p => ({...p, lfo: {...p.lfo, shape: e.target.value as Waveform}}))}
                            >
                                <option value="sine">SINE</option>
                                <option value="triangle">TRI</option>
                                <option value="square">SQR</option>
                                <option value="sawtooth">SAW</option>
                            </select>
                            </div>
                            <div className="flex flex-col gap-1 items-end">
                            <span className="text-[8px] text-vst-muted font-bold">TARGET</span>
                            <select 
                                className="bg-vst-panel text-[10px] font-mono text-fuchsia-400 outline-none cursor-pointer uppercase font-bold border border-vst-border rounded px-1 text-right"
                                value={patch.lfo.target}
                                onChange={(e) => setPatch(p => ({...p, lfo: {...p.lfo, target: e.target.value as any}}))}
                            >
                                <option value="pitch">PITCH</option>
                                <option value="filter">FILTER</option>
                                <option value="amp">AMP</option>
                            </select>
                            </div>
                        </div>

                        {/* LFO Knobs */}
                        <div className="flex justify-around items-center pt-1">
                            <Knob label="RATE" value={patch.lfo.rate} min={0.1} max={20} step={0.1} onChange={(v) => setPatch(p => ({...p, lfo: {...p.lfo, rate: v}}))} color="#d946ef" />
                            <div className="h-8 w-px bg-vst-border/50"></div>
                            <Knob label="DEPTH" value={patch.lfo.depth} min={0} max={1} step={0.01} onChange={(v) => setPatch(p => ({...p, lfo: {...p.lfo, depth: v}}))} color="#d946ef" format={v => (v*100).toFixed(0)} />
                        </div>
                    </div>
            </RackModule>
        </div>
    );
};