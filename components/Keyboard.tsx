import React, { useMemo, useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface KeyboardProps {
  activeNotes: Set<number>;
  onNoteOn: (note: number) => void;
  onNoteOff: (note: number) => void;
  startNote?: number;
  endNote?: number;
}

export const Keyboard: React.FC<KeyboardProps> = ({
  activeNotes,
  onNoteOn,
  onNoteOff,
  startNote = 60, // C4
  endNote = 91    // G6
}) => {
  const [octaveOffset, setOctaveOffset] = useState(0);

  // Calculate the actual range based on the octave offset
  const currentStart = startNote + (octaveOffset * 12);
  const currentEnd = endNote + (octaveOffset * 12);

  const notes = useMemo(() => {
    const result = [];
    for (let i = currentStart; i <= currentEnd; i++) {
      result.push(i);
    }
    return result;
  }, [currentStart, currentEnd]);

  const isBlackKey = (n: number) => [1, 3, 6, 8, 10].includes(n % 12);
  const whiteNotes = notes.filter(n => !isBlackKey(n));
  
  // Dynamic width calculation
  const whiteKeyWidth = 100 / whiteNotes.length;
  const blackKeyWidth = whiteKeyWidth * 0.65; // Slightly narrower black keys for cleaner look

  const handleMouseDown = (note: number, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    onNoteOn(note);
  };

  const handleMouseUp = (note: number, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    onNoteOff(note);
  };

  const handleOctaveChange = (delta: number) => {
    const newOffset = octaveOffset + delta;
    // Limit to reasonable MIDI range (-3 to +3 octaves from base)
    if (newOffset >= -3 && newOffset <= 3) {
        setOctaveOffset(newOffset);
    }
  };

  return (
    <div 
      className="relative w-full h-full select-none bg-black flex flex-row" 
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      {/* OCTAVE CONTROLS SIDEBAR */}
      <div className="w-12 flex flex-col items-center justify-center gap-1 bg-vst-panel border-r border-vst-border z-20 shadow-xl relative">
          <span className="text-[8px] font-bold text-vst-muted tracking-widest mb-1">OCT</span>
          
          <button 
            onClick={() => handleOctaveChange(1)}
            disabled={octaveOffset >= 3}
            className="w-8 h-8 rounded bg-vst-surface border border-vst-border hover:border-vst-accent hover:text-vst-accent text-vst-muted flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed active:bg-vst-accent active:text-black"
          >
            <ChevronUp size={16} />
          </button>
          
          <div className="w-8 py-1 bg-black/50 border border-vst-border rounded text-center">
            <span className={`text-[10px] font-mono font-bold ${octaveOffset === 0 ? 'text-vst-muted' : 'text-vst-accent'}`}>
                {octaveOffset > 0 ? `+${octaveOffset}` : octaveOffset}
            </span>
          </div>

          <button 
            onClick={() => handleOctaveChange(-1)}
            disabled={octaveOffset <= -3}
            className="w-8 h-8 rounded bg-vst-surface border border-vst-border hover:border-vst-accent hover:text-vst-accent text-vst-muted flex items-center justify-center transition-all disabled:opacity-30 disabled:cursor-not-allowed active:bg-vst-accent active:text-black"
          >
            <ChevronDown size={16} />
          </button>
          
          {/* Decorative lines */}
          <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-vst-border to-transparent opacity-50"></div>
      </div>

      {/* PIANO ROLL */}
      <div className="flex-1 relative h-full flex">
        {/* White Keys */}
        {whiteNotes.map((note) => {
          const isActive = activeNotes.has(note);
          return (
            <div
              key={note}
              className={`
                relative h-full border-b-[6px] border-l border-r border-[#090a0c] rounded-b-sm transition-all duration-75
                ${isActive 
                    ? 'bg-vst-accent shadow-[inset_0_-10px_20px_rgba(0,0,0,0.3)] border-b-vst-accent' 
                    : 'bg-[#e2e8f0] hover:bg-white border-b-[#94a3b8]'
                }
              `}
              style={{ width: `${whiteKeyWidth}%` }}
              onMouseDown={(e) => handleMouseDown(note, e)}
              onMouseUp={(e) => handleMouseUp(note, e)}
              onMouseLeave={(e) => isActive && onNoteOff(note)}
              onTouchStart={(e) => handleMouseDown(note, e)}
              onTouchEnd={(e) => handleMouseUp(note, e)}
            >
              {!isActive && <div className="absolute bottom-2 left-0 right-0 h-8 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>}
              {/* Note Label Cs */}
              {note % 12 === 0 && (
                 <div className="absolute bottom-3 left-0 right-0 text-center pointer-events-none">
                    <span className={`text-[9px] font-bold ${isActive ? 'text-black' : 'text-slate-400'}`}>C{(note/12)-1}</span>
                 </div>
              )}
            </div>
          );
        })}

        {/* Black Keys */}
        {notes.filter(isBlackKey).map((note) => {
          const previousWhiteIndex = whiteNotes.findIndex(wn => wn === note - 1);
          if (previousWhiteIndex === -1) return null;

          const leftPosition = (previousWhiteIndex + 1) * whiteKeyWidth - (blackKeyWidth / 2);
          const isActive = activeNotes.has(note);

          return (
            <div
              key={note}
              className={`
                absolute top-0 h-[60%] border-b-[8px] border-x-2 border-black rounded-b-sm z-10 transition-colors duration-75 shadow-lg
                ${isActive 
                    ? 'bg-vst-accent border-b-vst-accent' 
                    : 'bg-[#1a1d24] border-b-black bg-[linear-gradient(to_bottom,#2d3340,#090a0c)]'
                }
              `}
              style={{
                left: `${leftPosition}%`,
                width: `${blackKeyWidth}%`
              }}
              onMouseDown={(e) => handleMouseDown(note, e)}
              onMouseUp={(e) => handleMouseUp(note, e)}
              onMouseLeave={(e) => isActive && onNoteOff(note)}
              onTouchStart={(e) => handleMouseDown(note, e)}
              onTouchEnd={(e) => handleMouseUp(note, e)}
            />
          );
        })}
      </div>
    </div>
  );
};