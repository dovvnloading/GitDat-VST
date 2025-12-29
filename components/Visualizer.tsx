import React, { useEffect, useRef } from 'react';

interface VisualizerProps {
  analyser: AnalyserNode | null;
}

export const Visualizer: React.FC<VisualizerProps> = ({ analyser }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const parent = canvas.parentElement;
    if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
    }
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Grid drawing function
    const drawGrid = () => {
        ctx.strokeStyle = '#1a1d24'; 
        ctx.lineWidth = 1;
        ctx.beginPath();
        // Verticals
        const stepX = canvas.width / 12;
        for(let x = 0; x <= canvas.width; x += stepX) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
        }
        // Horizontals
        const stepY = canvas.height / 4;
        for(let y = 0; y <= canvas.height; y += stepY) {
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();
    };

    const bufferLength = analyser ? analyser.frequencyBinCount : 0;
    const dataArray = analyser ? new Uint8Array(bufferLength) : new Uint8Array(0);
    let animationId: number;

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      
      // Clear with slight transparency for trail effect? No, keen it clean.
      ctx.fillStyle = '#090a0c'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      drawGrid();

      if (!analyser) {
        // Draw flat line if inactive
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.strokeStyle = '#2d3340';
        ctx.stroke();
        return;
      }

      analyser.getByteTimeDomainData(dataArray);

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#00f0ff';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#00f0ff';
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
      
      // Reset shadow for next frame
      ctx.shadowBlur = 0;
    };

    draw();
    
    const handleResize = () => {
        if(parent) {
            canvas.width = parent.clientWidth;
            canvas.height = parent.clientHeight;
        }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, [analyser]);

  return (
    <div className="w-full h-full bg-black rounded-sm border border-vst-border relative overflow-hidden shadow-screen group">
        <canvas 
            ref={canvasRef} 
            className="w-full h-full block"
        />
        {/* CRT Overlay Effects */}
        <div className="absolute inset-0 pointer-events-none crt-overlay opacity-50 z-10"></div>
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_100%)] z-20"></div>
        
        {/* UI Overlay Text */}
        <div className="absolute top-2 left-3 text-[10px] text-vst-accent font-mono tracking-widest opacity-80 z-30 flex items-center gap-2">
            <div className="w-2 h-2 bg-vst-accent rounded-full animate-pulse shadow-[0_0_5px_#00f0ff]"></div>
            SIGNAL_INPUT
        </div>
        <div className="absolute bottom-2 right-3 text-[9px] text-vst-muted font-mono tracking-widest opacity-60 z-30">
            20ms/DIV • SCALE x1
        </div>
    </div>
  );
};