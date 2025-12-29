import React from 'react';
import { SynthPatch } from '../../types';
import { RackModule } from '../shared/RackModule';
import { ADSR } from '../shared/ADSR';

interface EnvelopeRackProps {
    patch: SynthPatch;
    setPatch: React.Dispatch<React.SetStateAction<SynthPatch>>;
}

export const EnvelopeRack: React.FC<EnvelopeRackProps> = ({ patch, setPatch }) => {
    return (
        <RackModule title="ENVELOPES" accent="#f59e0b">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-2 py-2">
                <div className="relative">
                <div className="text-[9px] text-amber-500 mb-2 font-mono font-bold tracking-wider">AMPLIFIER</div>
                <ADSR env={patch.ampEnvelope} onChange={(e) => setPatch(p => ({...p, ampEnvelope: e}))} />
                </div>
                <div className="relative">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-vst-border -ml-4"></div>
                <div className="text-[9px] text-emerald-500 mb-2 font-mono font-bold tracking-wider">FILTER MOD</div>
                <ADSR env={patch.filterEnvelope} onChange={(e) => setPatch(p => ({...p, filterEnvelope: e}))} />
                </div>
            </div>
        </RackModule>
    );
};