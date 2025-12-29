import React, { useState } from 'react';
import { useSynthesizer } from './hooks/useSynthesizer';

// Components
import { SplashScreen } from './components/layout/SplashScreen';
import { Header } from './components/layout/Header';
import { OscillatorRack } from './components/sections/OscillatorRack';
import { FilterRack } from './components/sections/FilterRack';
import { EnvelopeRack } from './components/sections/EnvelopeRack';
import { EffectsRack } from './components/sections/EffectsRack';
import { Keyboard } from './components/Keyboard';
import { InfoModal } from './components/layout/InfoModal';

const App: React.FC = () => {
  const {
    patch,
    setPatch,
    activeNotes,
    isStarted,
    initAudio,
    evolvePatch,
    triggerAttack,
    triggerRelease,
    analyser
  } = useSynthesizer();

  const [showInfo, setShowInfo] = useState(false);

  if (!isStarted) {
    return <SplashScreen onStart={initAudio} />;
  }

  return (
    <div className="min-h-screen bg-vst-bg text-vst-text p-2 md:p-6 flex justify-center items-center overflow-auto font-display">
      
      {/* MASTER RACK CONTAINER */}
      <div className="w-full max-w-[1280px] bg-vst-bg rounded border border-vst-border shadow-2xl relative flex flex-col gap-4 p-4 md:p-6 select-none">
         
         {/* TOP BAR: Header & Master Controls */}
         <Header 
            activeNotes={activeNotes}
            patch={patch}
            setPatch={setPatch}
            analyser={analyser}
            onEvolve={evolvePatch}
            onShowInfo={() => setShowInfo(true)}
         />

         {/* MAIN RACK GRID */}
         <div className="grid grid-cols-12 gap-4 relative">
             
             {/* LEFT COL: OSCILLATORS */}
             <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
                 <OscillatorRack patch={patch} setPatch={setPatch} />
             </div>

             {/* CENTER COL: FILTER & ENVELOPES */}
             <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
                 <FilterRack patch={patch} setPatch={setPatch} />
                 <EnvelopeRack patch={patch} setPatch={setPatch} />
             </div>

             {/* RIGHT COL: FX */}
             <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
                 <EffectsRack patch={patch} setPatch={setPatch} />
             </div>
         </div>

         {/* BOTTOM: KEYBOARD */}
         <div className="h-32 mt-2 rounded border border-vst-border bg-vst-panel shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-black/50 to-transparent z-20"></div>
             <Keyboard 
                activeNotes={activeNotes}
                onNoteOn={(note) => triggerAttack(note, 100)}
                onNoteOff={triggerRelease}
            />
         </div>

      </div>

      {/* CREDITS MODAL */}
      {showInfo && <InfoModal onClose={() => setShowInfo(false)} />}
    </div>
  );
};

export default App;