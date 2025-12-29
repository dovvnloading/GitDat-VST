import React, { useState, useRef, useEffect } from 'react';

interface KnobProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  size?: 'sm' | 'md' | 'lg';
  color?: string; // Allow accent color override
}

export const Knob: React.FC<KnobProps> = ({ 
  label, 
  value, 
  min, 
  max, 
  step = 1, 
  onChange, 
  format,
  size = 'md',
  color
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startValue, setStartValue] = useState(0);
  const knobRef = useRef<HTMLDivElement>(null);
  
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setStartY(e.clientY);
    setStartValue(value);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaY = startY - e.clientY;
      const range = max - min;
      const sensitivity = 200; // pixels to traverse full range
      const deltaValue = (deltaY / sensitivity) * range; 
      let newValue = startValue + deltaValue;
      
      if (newValue < min) newValue = min;
      if (newValue > max) newValue = max;

      if (step) {
        newValue = Math.round(newValue / step) * step;
      }

      onChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, startY, startValue, min, max, step, onChange]);

  // Visual calculations
  const percentage = (value - min) / (max - min);
  const startAngle = -135;
  const endAngle = 135;
  const angleRange = endAngle - startAngle;
  const currentAngle = startAngle + (percentage * angleRange);
  
  // Size configs
  const sizes = {
    sm: { w: 36, h: 36, r: 14, stroke: 3 },
    md: { w: 48, h: 48, r: 19, stroke: 4 },
    lg: { w: 64, h: 64, r: 26, stroke: 5 }
  };
  const s = sizes[size];

  // SVG Arc Math
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    // Safety clamp for display
    const clampedEnd = Math.max(startAngle, Math.min(endAngle, startAngle + 360));
    
    const start = polarToCartesian(x, y, radius, clampedEnd);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = clampedEnd - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  const center = s.w / 2;
  const radius = s.r;
  const trackPath = describeArc(center, center, radius, startAngle, endAngle);
  const valuePath = describeArc(center, center, radius, startAngle, currentAngle);

  const displayValue = format ? format(value) : value.toFixed(step < 1 ? 1 : 0);
  
  const activeColor = color || '#00f0ff';
  // Use CSS drop-shadow instead of SVG filters to avoid ID collision/coordinate bugs
  // Append '80' for ~50% opacity hex
  const shadowColor = isDragging ? 'rgba(255, 255, 255, 0.8)' : `${activeColor}80`;

  return (
    <div className={`flex flex-col items-center justify-start gap-1 select-none ${isDragging ? 'cursor-none' : 'cursor-ns-resize'}`}>
      
      {/* Knob Graphic */}
      <div 
        ref={knobRef}
        className="relative group"
        style={{ width: s.w, height: s.h }}
        onMouseDown={handleMouseDown}
      >
        <svg width={s.w} height={s.h} viewBox={`0 0 ${s.w} ${s.h}`} className="overflow-visible">
          {/* Background Track */}
          <path 
            d={trackPath} 
            fill="none" 
            stroke="#2d3340" 
            strokeWidth={s.stroke} 
            strokeLinecap="round" 
          />
          {/* Value Arc */}
          <path 
            d={valuePath} 
            fill="none" 
            stroke={isDragging ? '#ffffff' : activeColor} 
            strokeWidth={s.stroke} 
            strokeLinecap="round"
            className="transition-colors duration-75"
            style={{
                filter: `drop-shadow(0 0 3px ${shadowColor})`
            }}
          />
        </svg>

        {/* The Physical Knob Cap (Inner Circle) */}
        <div 
          className="absolute rounded-full bg-vst-surface border border-vst-border shadow-knob flex items-center justify-center transition-transform duration-75 ease-out"
          style={{
             top: s.stroke + 2,
             left: s.stroke + 2,
             width: s.w - (s.stroke * 2) - 4,
             height: s.h - (s.stroke * 2) - 4,
             transform: `rotate(${currentAngle}deg)`
          }}
        >
            <div className={`w-1 h-[30%] bg-slate-500 rounded-full absolute top-1 ${isDragging ? 'bg-white' : ''}`} />
        </div>
      </div>

      {/* Label & Value */}
      <div className="flex flex-col items-center justify-center -space-y-0.5">
         <span className="text-[10px] font-display font-bold text-vst-muted uppercase tracking-wider">{label}</span>
         <div className={`bg-vst-panel px-1.5 rounded border ${isDragging ? 'border-white text-white' : 'border-vst-border text-vst-accent'} transition-colors`}>
            <span className="text-[10px] font-mono leading-tight">{displayValue}</span>
         </div>
      </div>
    </div>
  );
};