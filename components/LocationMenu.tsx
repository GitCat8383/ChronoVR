import React, { useState } from 'react';
import { Era } from '../types';
import { Map, Clock, Search, Sparkles } from 'lucide-react';

interface LocationMenuProps {
  currentEra: string;
  onSelectEra: (era: string) => void;
  disabled: boolean;
}

export const LocationMenu: React.FC<LocationMenuProps> = ({ currentEra, onSelectEra, disabled }) => {
  const [customEra, setCustomEra] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customEra.trim()) {
      onSelectEra(customEra.trim());
      setCustomEra('');
    }
  };

  return (
    <div className="flex items-center gap-4 overflow-x-auto pb-4 no-scrollbar">
      
      {/* Custom Input */}
      <form onSubmit={handleCustomSubmit} className="flex-shrink-0 flex items-center gap-2 bg-gray-900/80 border border-gray-700 rounded-full p-1 pr-4 focus-within:border-amber-500 transition-colors min-w-[250px] shadow-lg">
        <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-amber-500">
           <Search className="w-4 h-4" />
        </div>
        <input 
            type="text"
            value={customEra}
            onChange={(e) => setCustomEra(e.target.value)}
            placeholder="Travel to (e.g. Berlin 1989)..."
            disabled={disabled}
            className="bg-transparent border-none focus:outline-none text-xs text-gray-200 placeholder-gray-500 w-full"
        />
        <button type="submit" disabled={disabled || !customEra.trim()} className="text-amber-500 hover:text-amber-400 disabled:opacity-50 transition-colors" title="Generate Custom Timeline">
            <Sparkles className="w-4 h-4" />
        </button>
      </form>

      <div className="w-px h-8 bg-gray-800 flex-shrink-0 mx-2" />

      {/* Presets */}
      {(Object.values(Era) as string[]).map((era) => (
        <button
          key={era}
          onClick={() => onSelectEra(era)}
          disabled={disabled}
          className={`
            flex-shrink-0 flex items-center gap-3 px-6 py-2 rounded-full border transition-all duration-300
            ${currentEra === era 
              ? 'bg-amber-600 border-amber-500 text-white shadow-[0_0_15px_rgba(217,119,6,0.5)]' 
              : 'bg-gray-900/80 border-gray-700 text-gray-400 hover:border-gray-500 hover:text-gray-200'}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {currentEra === era ? <Map className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
          <span className="whitespace-nowrap font-medium text-sm">{era}</span>
        </button>
      ))}
    </div>
  );
};