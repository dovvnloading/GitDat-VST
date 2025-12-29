import React from 'react';
import { Play } from 'lucide-react';

interface SplashScreenProps {
    onStart: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onStart }) => {
    return (
        <div className="h-screen w-full flex flex-col items-center justify-center bg-vst-bg relative overflow-hidden font-display">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#111318_0%,#090a0c_100%)]"></div>
            <div className="relative z-10 text-center">
                <h1 className="text-6xl md:text-8xl font-black text-vst-text mb-4 tracking-tighter opacity-90">
                    GIT-DAT <span className="text-vst-accent">VST</span>
                </h1>
                <div className="text-vst-muted font-mono mb-12 tracking-widest text-sm">PROFESSIONAL SYNTHESIS ENGINE</div>
                
                <button 
                    onClick={onStart}
                    className="group relative px-12 py-6 bg-vst-surface border border-vst-border hover:border-vst-accent transition-all duration-300 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-vst-accent/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <div className="flex items-center gap-3 relative z-10">
                        <Play className="w-5 h-5 text-vst-accent fill-current" />
                        <span className="text-lg font-bold text-vst-text tracking-[0.2em]">INITIALIZE_SYSTEM</span>
                    </div>
                </button>
            </div>
        </div>
    );
};