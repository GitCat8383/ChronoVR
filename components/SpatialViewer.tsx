import React from 'react';
import { X, Loader2, Maximize2 } from 'lucide-react';
import { MapLocation } from '../types';

interface SpatialViewerProps {
  location: MapLocation | null;
  imageUrl: string | null;
  onClose: () => void;
  isLoading: boolean;
}

export const SpatialViewer: React.FC<SpatialViewerProps> = ({ location, imageUrl, onClose, isLoading }) => {
  if (!location) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col animate-in fade-in duration-300">
      
      {/* Controls */}
      <div className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-start bg-gradient-to-b from-black/80 to-transparent">
        <div>
            <h2 className="text-3xl font-bold text-white historical-font mb-1">{location.name}</h2>
            <p className="text-amber-500 uppercase tracking-widest text-xs font-bold flex items-center gap-2">
                <Maximize2 className="w-4 h-4" /> 3D Spatial Visualization
            </p>
        </div>
        <button 
          onClick={onClose}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur transition-all border border-white/10"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Viewport */}
      <div className="flex-1 w-full h-full relative flex items-center justify-center overflow-hidden cursor-grab active:cursor-grabbing">
        
        {isLoading ? (
            <div className="flex flex-col items-center gap-4 text-amber-500">
                <Loader2 className="w-12 h-12 animate-spin" />
                <span className="text-sm font-mono uppercase tracking-wider">Reconstructing 3D Environment...</span>
            </div>
        ) : imageUrl ? (
            <div className="w-full h-full overflow-x-auto overflow-y-hidden no-scrollbar">
                {/* Simulated 360/Panoramic View */}
                <div 
                    className="h-full w-[200%] min-w-[100vw] bg-cover bg-center animate-pan-slow"
                    style={{ backgroundImage: `url(${imageUrl})` }}
                >
                    <div className="w-full h-full bg-gradient-to-t from-black/50 via-transparent to-black/20" />
                </div>
            </div>
        ) : (
            <div className="text-red-400">Visualization Failed</div>
        )}

        {/* HUD Overlay in 3D Space */}
        {!isLoading && (
            <div className="absolute bottom-10 left-10 max-w-md bg-black/60 backdrop-blur-md p-6 border-l-4 border-amber-500">
                <p className="text-gray-200 text-sm leading-relaxed font-medium shadow-black drop-shadow-md">
                    "{location.description}"
                </p>
                <div className="mt-2 text-[10px] text-gray-400 uppercase tracking-widest">
                    Historical Context Reconstructed
                </div>
            </div>
        )}

      </div>
    </div>
  );
};