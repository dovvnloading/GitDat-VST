import React from 'react';
import { OscillatorParams, Waveform } from '../../types';
import { Knob } from '../Knob';

interface OscUnitProps {
    osc: OscillatorParams;
    onUpdate: (o: OscillatorParams) => void;
    index: number;
}

export const OscUnit: React.FC<OscUnitProps> = ({ osc, onUpdate, index }) => (
    <div className="flex flex-col gap-2 p-2 bg-vst-bg/30 rounded border border-vst-border/50">
        <div className="flex justify-between items-center mb-1">
             <div className="flex items-center gap-2">
                 <div className={`text-[10px] font-bold text-vst-muted bg-vst-border px-1 rounded`}>0{index + 1}</div>
                 <select 
                    className="bg-transparent text-[10px] font-mono text-vst-accent outline-none cursor-pointer uppercase font-bold text-right"
                    value={osc.type}
                    onChange={(e) => onUpdate({ ...osc, type: e.target.value as Waveform })}
                >
                    {Object.values(Waveform).map(w => <option key={w} value={w}>{w}</option>)}
                </select>
             </div>
        </div>
        <div className="flex justify-between gap-1">
            <Knob size="sm" label="SEMI" value={osc.semitone} min={-24} max={24} step={12} onChange={(v) => onUpdate({ ...osc, semitone: v })} />
            <Knob size="sm" label="FINE" value={osc.detune} min={-50} max={50} onChange={(v) => onUpdate({ ...osc, detune: v })} />
            <Knob size="sm" label="GAIN" value={osc.gain} min={0} max={1} step={0.01} onChange={(v) => onUpdate({ ...osc, gain: v })} format={v => (v*100).toFixed(0)} />
        </div>
    </div>
);