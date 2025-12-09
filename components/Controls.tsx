import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Eye, Footprints } from 'lucide-react';
import { NavigationAction } from '../types';

interface ControlsProps {
  onNavigate: (action: NavigationAction) => void;
  disabled: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ onNavigate, disabled }) => {
  return (
    <div className="bg-gray-900/90 backdrop-blur-md rounded-xl border border-gray-800 p-6 shadow-xl">
      <h3 className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
        <Footprints className="w-4 h-4" />
        Navigation
      </h3>
      
      <div className="grid grid-cols-3 gap-2 max-w-[200px] mx-auto mb-6">
        <div />
        <button
          onClick={() => onNavigate({ type: 'move', detail: 'Forward' })}
          disabled={disabled}
          className="aspect-square bg-gray-800 hover:bg-gray-700 active:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center border border-gray-700 transition-all shadow-lg hover:shadow-amber-900/20"
          title="Move Forward"
        >
          <ArrowUp className="w-6 h-6 text-gray-200" />
        </button>
        <div />
        
        <button
          onClick={() => onNavigate({ type: 'look', detail: 'Look Left' })}
          disabled={disabled}
          className="aspect-square bg-gray-800 hover:bg-gray-700 active:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center border border-gray-700 transition-all shadow-lg"
          title="Look Left"
        >
          <ArrowLeft className="w-6 h-6 text-gray-200" />
        </button>
        <button
          onClick={() => onNavigate({ type: 'move', detail: 'Backward' })}
          disabled={disabled}
          className="aspect-square bg-gray-800 hover:bg-gray-700 active:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center border border-gray-700 transition-all shadow-lg"
          title="Move Backward"
        >
          <ArrowDown className="w-6 h-6 text-gray-200" />
        </button>
        <button
          onClick={() => onNavigate({ type: 'look', detail: 'Look Right' })}
          disabled={disabled}
          className="aspect-square bg-gray-800 hover:bg-gray-700 active:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg flex items-center justify-center border border-gray-700 transition-all shadow-lg"
          title="Look Right"
        >
          <ArrowRight className="w-6 h-6 text-gray-200" />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <button 
          onClick={() => onNavigate({ type: 'inspect', detail: 'Inspect Surroundings' })}
          disabled={disabled}
          className="flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 active:bg-amber-700 disabled:opacity-50 text-gray-200 py-3 px-4 rounded-lg border border-gray-700 text-sm font-medium transition-all"
        >
          <Eye className="w-4 h-4" />
          Inspect Details
        </button>
      </div>
    </div>
  );
};