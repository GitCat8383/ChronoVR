import React from 'react';
import { Loader2, Compass, Wind, Ear, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import { Atmosphere, ConfidenceData } from '../types';

interface SceneViewProps {
  imageUrl: string | null;
  isLoading: boolean;
  locationName: string;
  description: string;
  era: string;
  atmosphere: Atmosphere;
  confidence: ConfidenceData;
  showConfidence: boolean;
  onToggleConfidence: () => void;
}

export const SceneView: React.FC<SceneViewProps> = ({ 
  imageUrl, 
  isLoading, 
  locationName, 
  description,
  era,
  atmosphere,
  confidence,
  showConfidence,
  onToggleConfidence
}) => {
  return (
    <div className="relative w-full h-64 md:h-96 lg:h-[500px] bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-800 group">
      {/* Image Layer */}
      {imageUrl ? (
        <img 
          src={imageUrl} 
          alt={description}
          className={`w-full h-full object-cover transition-all duration-700 ${isLoading ? 'opacity-50 blur-sm' : 'opacity-100'} ${showConfidence ? 'grayscale-[0.5] contrast-50' : ''}`}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500">
          <div className="text-center p-6">
            <Compass className="w-16 h-16 mx-auto mb-4 opacity-20 animate-pulse" />
            <p>Constructing visual reconstruction...</p>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] z-20">
          <div className="bg-black/80 px-6 py-4 rounded-full flex items-center space-x-3 border border-amber-500/30">
            <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
            <span className="text-amber-200 text-sm font-medium tracking-wide">GENERATING TIME STREAM...</span>
          </div>
        </div>
      )}

      {/* Confidence/Archaeological Lens Overlay */}
      {showConfidence && (
        <div className="absolute inset-0 z-10 p-6 pointer-events-none overflow-y-auto">
            <div className="bg-black/70 backdrop-blur-md p-4 rounded-lg max-w-sm border border-cyan-500/30">
                <h4 className="text-cyan-400 font-bold uppercase tracking-widest text-xs mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Archaeological Analysis
                </h4>
                
                <div className="space-y-3 text-sm">
                    {confidence.proven.length > 0 && (
                        <div>
                            <span className="text-green-400 font-bold text-xs flex items-center gap-1 mb-1">
                                <CheckCircle className="w-3 h-3" /> PROVEN (Evidence Based)
                            </span>
                            <p className="text-gray-300 leading-tight pl-4">{confidence.proven.join(', ')}</p>
                        </div>
                    )}
                    {confidence.likely.length > 0 && (
                        <div>
                            <span className="text-yellow-400 font-bold text-xs flex items-center gap-1 mb-1">
                                <Info className="w-3 h-3" /> LIKELY (Expert Consensus)
                            </span>
                            <p className="text-gray-300 leading-tight pl-4">{confidence.likely.join(', ')}</p>
                        </div>
                    )}
                    {confidence.speculative.length > 0 && (
                        <div>
                            <span className="text-red-400 font-bold text-xs flex items-center gap-1 mb-1">
                                <AlertTriangle className="w-3 h-3" /> SPECULATIVE (AI Fill)
                            </span>
                            <p className="text-gray-300 leading-tight pl-4">{confidence.speculative.join(', ')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {/* Toggle Button for Confidence Lens */}
      <button 
        onClick={onToggleConfidence}
        className={`absolute top-4 right-4 z-30 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all flex items-center gap-2
            ${showConfidence 
                ? 'bg-cyan-900/80 border-cyan-500 text-cyan-200 shadow-[0_0_15px_rgba(6,182,212,0.5)]' 
                : 'bg-black/50 border-gray-600 text-gray-400 hover:bg-black/70'}`}
      >
        <Compass className="w-3 h-3" />
        Archaeological Lens: {showConfidence ? 'ON' : 'OFF'}
      </button>

      {/* Info Overlay & Atmosphere */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 pt-20">
        <div className="flex flex-col gap-2">
            
            {/* Atmosphere Pills */}
            <div className="flex flex-wrap gap-2 mb-2">
                <span className="px-2 py-1 bg-gray-800/80 rounded border border-gray-700 text-xs text-gray-300 flex items-center gap-1">
                    <Wind className="w-3 h-3 text-amber-500" /> {atmosphere.weather}
                </span>
                <span className="px-2 py-1 bg-gray-800/80 rounded border border-gray-700 text-xs text-gray-300 flex items-center gap-1">
                    <Ear className="w-3 h-3 text-amber-500" /> {atmosphere.sound}
                </span>
                <span className="px-2 py-1 bg-gray-800/80 rounded border border-gray-700 text-xs text-gray-300 flex items-center gap-1">
                     Lighting: {atmosphere.lighting}
                </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white historical-font">{locationName}</h2>
            <p className="text-gray-300 text-sm md:text-base max-w-3xl leading-relaxed shadow-black drop-shadow-md">
              {description}
            </p>
        </div>
      </div>
    </div>
  );
};