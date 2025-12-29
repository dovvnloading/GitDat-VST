import React from 'react';

interface RackModuleProps {
    children: React.ReactNode;
    title: string;
    className?: string;
    accent?: string;
}

export const RackModule: React.FC<RackModuleProps> = ({ 
    children, title, className = "", accent 
}) => (
    <div className={`bg-vst-panel rounded-sm border border-vst-border flex flex-col relative overflow-hidden shadow-lg ${className}`}>
        {/* Header Bar */}
        <div className="bg-vst-surface border-b border-vst-border py-1 px-3 flex justify-between items-center">
            <span className="text-[10px] font-display font-black tracking-[0.15em] text-vst-muted uppercase">{title}</span>
            {accent && <div className={`w-12 h-0.5 rounded-full`} style={{backgroundColor: accent, boxShadow: `0 0 5px ${accent}`}}></div>}
        </div>
        
        {/* Content Area */}
        <div className="p-3 relative z-10 flex-1">
            {children}
        </div>
    </div>
);