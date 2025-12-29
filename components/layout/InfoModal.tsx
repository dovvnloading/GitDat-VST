
import React from 'react';
import { Info, X as XIcon, Zap, Globe, Github } from 'lucide-react';

interface InfoModalProps {
    onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div 
                className="w-full max-w-[480px] bg-[#111318] border border-[#2d3340] shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded relative overflow-hidden m-4 animate-in zoom-in-95 duration-200" 
                onClick={e => e.stopPropagation()}
            >
                {/* Decorative Top Line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#00f0ff] via-purple-500 to-[#00f0ff]"></div>
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-[#2d3340] bg-[#1a1d24]">
                    <div className="flex items-center gap-3">
                        <div className="p-1.5 bg-[#00f0ff]/10 rounded text-[#00f0ff]">
                            <Info size={18} />
                        </div>
                        <h2 className="text-lg font-bold text-white tracking-widest font-display">SYSTEM_INFO</h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <XIcon size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    
                    {/* Dev Profile */}
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#1a1d24] to-[#090a0c] border border-[#2d3340] flex items-center justify-center shadow-lg relative group">
                            <div className="absolute inset-0 rounded-full bg-[#00f0ff]/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <Zap className="w-6 h-6 text-[#00f0ff] relative z-10" />
                        </div>
                        <div>
                            <div className="text-[10px] font-mono text-[#00f0ff] tracking-widest uppercase mb-0.5">Developed By</div>
                            <div className="text-xl font-bold text-white font-display">Matthew Robert Wesney</div>
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="grid gap-3">
                        <a 
                            href="https://dovvnloading.github.io/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-[#090a0c] border border-[#2d3340] rounded hover:border-[#00f0ff] hover:bg-[#00f0ff]/5 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <Globe size={16} className="text-slate-400 group-hover:text-[#00f0ff] transition-colors" />
                                <span className="text-sm font-mono text-slate-300 group-hover:text-white">dovvnloading.github.io</span>
                            </div>
                        </a>

                        <a 
                            href="https://github.com/dovvnloading" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-[#090a0c] border border-[#2d3340] rounded hover:border-[#00f0ff] hover:bg-[#00f0ff]/5 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <Github size={16} className="text-slate-400 group-hover:text-[#00f0ff] transition-colors" />
                                <span className="text-sm font-mono text-slate-300 group-hover:text-white">github.com/dovvnloading</span>
                            </div>
                        </a>

                        <a 
                            href="https://x.com/D3VAUX" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-[#090a0c] border border-[#2d3340] rounded hover:border-[#00f0ff] hover:bg-[#00f0ff]/5 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                <svg className="w-4 h-4 fill-current text-slate-400 group-hover:text-[#00f0ff] transition-colors" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
                                <span className="text-sm font-mono text-slate-300 group-hover:text-white">@D3VAUX</span>
                            </div>
                        </a>
                    </div>
                    
                    <div className="pt-4 border-t border-[#2d3340] flex justify-between items-center text-[10px] font-mono text-slate-500">
                        <span>GIT-DAT VST</span>
                        <span>BETA / PROTOTYPE</span>
                    </div>
                </div>
            </div>
        </div>
    );
};