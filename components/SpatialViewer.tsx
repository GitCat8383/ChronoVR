import React, { useState, useRef, useEffect } from 'react';
import { X, Loader2, Maximize2, Compass, Scan, MousePointer2 } from 'lucide-react';
import { MapLocation } from '../types';

interface SpatialViewerProps {
  location: MapLocation | null;
  imageUrl: string | null;
  onClose: () => void;
  isLoading: boolean;
}

export const SpatialViewer: React.FC<SpatialViewerProps> = ({ location, imageUrl, onClose, isLoading }) => {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle mouse movement for parallax effect
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { width, height, left, top } = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - left) / width;
    const y = (e.clientY - top) / height;
    setMousePos({ x, y });
  };

  // Reset view when location changes
  useEffect(() => {
    setMousePos({ x: 0.5, y: 0.5 });
  }, [location]);

  if (!location) return null;

  // Calculate transform based on mouse position
  // We move the image opposite to mouse to simulate "looking"
  // Scale 1.1 provides the buffer needed to move without showing edges
  const moveX = (0.5 - mousePos.x) * 10; // +/- 5% movement
  const moveY = (0.5 - mousePos.y) * 10;
  
  const transformStyle = {
    transform: `scale(1.1) translate(${moveX}%, ${moveY}%)`,
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
      
      {/* Header / Controls */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-start bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none">
        <div className="pointer-events-auto">
            <h2 className="text-3xl font-bold text-white historical-font mb-1 drop-shadow-md">{location.name}</h2>
            <p className="text-amber-500 uppercase tracking-widest text-xs font-bold flex items-center gap-2">
                <Maximize2 className="w-4 h-4" /> 3D Spatial Visualization
            </p>
        </div>
        <button 
          onClick={onClose}
          className="pointer-events-auto p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur transition-all border border-white/10 hover:rotate-90 duration-300"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main Viewport */}
      <div 
        ref={containerRef}
        onMouseMove={handleMouseMove}
        className="flex-1 w-full h-full relative flex items-center justify-center overflow-hidden cursor-move bg-gray-900"
      >
        
        {isLoading ? (
            <div className="flex flex-col items-center gap-4 text-amber-500 z-20">
                <div className="relative">
                    <Loader2 className="w-16 h-16 animate-spin" />
                    <div className="absolute inset-0 animate-ping opacity-20 bg-amber-500 rounded-full"></div>
                </div>
                <span className="text-sm font-mono uppercase tracking-wider animate-pulse">Constructing 3D Environment...</span>
            </div>
        ) : imageUrl ? (
            <>
                {/* The Image Layer */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <img 
                        src={imageUrl}
                        alt={location.description}
                        className="min-w-full min-h-full object-cover transition-transform duration-100 ease-out will-change-transform"
                        style={transformStyle}
                    />
                </div>

                {/* Immersion Overlays */}
                <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
                
                {/* Reticle / HUD */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                     <Scan className="w-[80%] h-[80%] text-white/20 stroke-1" />
                     <div className="w-2 h-2 bg-amber-500/50 rounded-full"></div>
                </div>

                {/* "Look Around" Hint */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 pointer-events-none opacity-0 animate-fade-out-delayed">
                    <MousePointer2 className="w-8 h-8 text-white drop-shadow-lg animate-bounce" />
                    <span className="text-white text-sm font-bold shadow-black drop-shadow-md">Move to Look</span>
                </div>
            </>
        ) : (
            <div className="text-red-400 border border-red-900 bg-red-900/20 p-4 rounded">Visualization Failed</div>
        )}

        {/* Bottom Info HUD */}
        {!isLoading && (
            <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none">
                <div className="max-w-2xl border-l-4 border-amber-500 pl-4">
                    <p className="text-gray-200 text-sm md:text-base leading-relaxed font-medium shadow-black drop-shadow-md">
                        "{location.description}"
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                        <span className="flex items-center gap-1">
                            <Compass className="w-3 h-3 text-amber-500" />
                            Bearing: {Math.round(mousePos.x * 360)}°
                        </span>
                        <span>
                            Pitch: {Math.round((0.5 - mousePos.y) * 90)}°
                        </span>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};