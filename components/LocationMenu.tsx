import React from 'react';
import { Era } from '../types';
import { Map, Clock } from 'lucide-react';

interface LocationMenuProps {
  currentEra: Era;
  onSelectEra: (era: Era) => void;
  disabled: boolean;
}

export const LocationMenu: React.FC<LocationMenuProps> = ({ currentEra, onSelectEra, disabled }) => {
  return (
    <div className="flex overflow-x-auto pb-4 gap-4 no-scrollbar">
      {(Object.values(Era) as Era[]).map((era) => (
        <button
          key={era}
          onClick={() => onSelectEra(era)}
          disabled={disabled}
          className={`
            flex-shrink-0 flex items-center gap-3 px-6 py-3 rounded-full border transition-all duration-300
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