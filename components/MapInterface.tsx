import React from 'react';
import { MapLocation } from '../types';
import { MapPin, Crosshair } from 'lucide-react';

interface MapInterfaceProps {
  locations: MapLocation[];
  onSelectLocation: (location: MapLocation) => void;
  disabled: boolean;
  era: string;
}

export const MapInterface: React.FC<MapInterfaceProps> = ({ locations, onSelectLocation, disabled, era }) => {
  return (
    <div className="bg-gray-900/90 backdrop-blur-md rounded-xl border border-gray-800 p-1 shadow-xl mb-6 relative overflow-hidden group">
        {/* Map Header */}
        <div className="absolute top-4 left-4 z-10 bg-black/70 backdrop-blur px-3 py-1 rounded border border-gray-700">
             <h3 className="text-amber-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Strategic Map: {era}
            </h3>
        </div>

        {/* Map Background (Abstract Grid) */}
        <div className="w-full h-64 md:h-80 bg-[#1a1a20] relative opacity-90 overflow-hidden">
             {/* Grid Lines */}
             <div className="absolute inset-0" 
                style={{ 
                    backgroundImage: 'linear-gradient(#2a2a30 1px, transparent 1px), linear-gradient(90deg, #2a2a30 1px, transparent 1px)', 
                    backgroundSize: '40px 40px' 
                }} 
             />
             
             {/* Radar/Scan Effect */}
             <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-900/5 to-transparent animate-scan pointer-events-none" />

             {/* Locations */}
             {locations.map((loc) => (
                 <button
                    key={loc.id}
                    onClick={() => onSelectLocation(loc)}
                    disabled={disabled}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group/pin transition-all hover:scale-110 z-20"
                    style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
                 >
                    <div className={`
                        w-4 h-4 rounded-full border-2 shadow-[0_0_10px_rgba(0,0,0,0.8)]
                        ${loc.type === 'conflict' ? 'bg-red-500 border-red-300 shadow-red-500/50 animate-pulse' : 
                          loc.type === 'strategic' ? 'bg-amber-500 border-amber-300 shadow-amber-500/50' : 
                          'bg-cyan-500 border-cyan-300 shadow-cyan-500/50'}
                    `} />
                    
                    {/* Tooltip */}
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded border border-gray-700 whitespace-nowrap opacity-0 group-hover/pin:opacity-100 transition-opacity pointer-events-none">
                        <span className="font-bold block text-amber-500">{loc.name}</span>
                        <span className="text-gray-400">{loc.type}</span>
                    </div>
                 </button>
             ))}
        </div>
        
        {/* Decorative Compass/Crosshair */}
        <div className="absolute bottom-4 right-4 opacity-20 pointer-events-none">
            <Crosshair className="w-16 h-16 text-amber-500" />
        </div>
    </div>
  );
};