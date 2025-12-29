import React from 'react';
import { EnvelopeParams } from '../../types';
import { Knob } from '../Knob';

interface ADSRProps {
    env: EnvelopeParams;
    onChange: (e: EnvelopeParams) => void;
}

export const ADSR: React.FC<ADSRProps> = ({ env, onChange }) => (
    <div className="flex justify-between gap-1">
        <Knob size="sm" label="A" value={env.attack} min={0.001} max={2} step={0.01} onChange={(v) => onChange({...env, attack: v})} />
        <Knob size="sm" label="D" value={env.decay} min={0.01} max={2} step={0.01} onChange={(v) => onChange({...env, decay: v})} />
        <Knob size="sm" label="S" value={env.sustain} min={0} max={1} step={0.01} onChange={(v) => onChange({...env, sustain: v})} />
        <Knob size="sm" label="R" value={env.release} min={0.01} max={5} step={0.01} onChange={(v) => onChange({...env, release: v})} />
    </div>
);