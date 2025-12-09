import React from 'react';
import { SimulationState } from '../types';
import { Coins, Heart, Clock, User, Target, Backpack } from 'lucide-react';

interface GameHUDProps {
  state: SimulationState;
}

export const GameHUD: React.FC<GameHUDProps> = ({ state }) => {
  if (!state.isActive) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
      {/* Role & Time */}
      <div className="bg-gray-900/60 backdrop-blur border border-gray-800 p-3 rounded-lg col-span-2 md:col-span-1">
        <div className="flex items-center gap-2 mb-1">
            <User className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-gray-400 uppercase">Identity</span>
        </div>
        <div className="font-bold text-gray-200">{state.role}</div>
        <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" /> {state.timeOfDay}
        </div>
      </div>

      {/* Objective */}
      <div className="bg-gray-900/60 backdrop-blur border border-gray-800 p-3 rounded-lg col-span-2">
        <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-bold text-gray-400 uppercase">Daily Objective</span>
        </div>
        <div className="text-sm text-gray-200 leading-tight">{state.objective}</div>
        {state.lastActionResult && (
             <div className="text-xs text-amber-300 mt-2 italic border-t border-gray-800 pt-1">
                 "{state.lastActionResult}"
             </div>
        )}
      </div>

      {/* Vitals */}
      <div className="bg-gray-900/60 backdrop-blur border border-gray-800 p-3 rounded-lg col-span-2 md:col-span-1 flex flex-col justify-between">
         <div className="flex justify-between items-center mb-1">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                <Heart className="w-4 h-4 text-red-500" /> Health
            </div>
            <span className="text-sm font-mono text-white">{state.health}%</span>
         </div>
         <div className="w-full bg-gray-800 h-1.5 rounded-full mb-3">
             <div className="bg-red-600 h-1.5 rounded-full" style={{ width: `${state.health}%`}}></div>
         </div>

         <div className="flex justify-between items-center">
             <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase">
                 <Coins className="w-4 h-4 text-yellow-500" /> Wealth
             </div>
             <span className="text-sm font-mono text-yellow-200">{state.gold}</span>
         </div>
      </div>
    </div>
  );
};