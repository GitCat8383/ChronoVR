import React, { useState } from 'react';
import { Perspective } from '../types';
import { Crown, User, BookOpen, Quote } from 'lucide-react';

interface PerspectivesProps {
  perspectives: Perspective[];
}

export const Perspectives: React.FC<PerspectivesProps> = ({ perspectives }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  if (!perspectives || perspectives.length === 0) return null;

  // Default to selecting the first one if none selected
  const activeId = selectedId || perspectives[0].id;
  const activePerspective = perspectives.find(p => p.id === activeId);

  return (
    <div className="bg-gray-900/90 backdrop-blur-md rounded-xl border border-gray-800 p-6 shadow-xl mt-6">
      <h3 className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
        <Quote className="w-4 h-4" />
        Voices of the Era
      </h3>

      {/* Avatar Row */}
      <div className="flex items-center gap-4 mb-6 overflow-x-auto no-scrollbar pb-2">
        {perspectives.map((p) => {
          const isActive = p.id === activeId;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={`flex flex-col items-center gap-2 group min-w-[80px] transition-all duration-300 ${isActive ? 'scale-105' : 'opacity-60 hover:opacity-100'}`}
            >
              <div className={`
                w-14 h-14 rounded-full flex items-center justify-center border-2 shadow-lg transition-all
                ${p.type === 'key_figure' 
                    ? 'bg-purple-900/30 border-purple-500 text-purple-400' 
                    : p.type === 'expert' 
                        ? 'bg-blue-900/30 border-blue-500 text-blue-400' 
                        : 'bg-amber-900/30 border-amber-500 text-amber-400'}
                ${isActive ? 'shadow-[0_0_15px_rgba(255,255,255,0.1)]' : ''}
              `}>
                {p.type === 'key_figure' && <Crown className="w-6 h-6" />}
                {p.type === 'commoner' && <User className="w-6 h-6" />}
                {p.type === 'expert' && <BookOpen className="w-6 h-6" />}
              </div>
              <span className={`text-[10px] uppercase font-bold tracking-wider text-center leading-tight ${isActive ? 'text-white' : 'text-gray-500'}`}>
                {p.name.split(' ')[0]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Card */}
      {activePerspective && (
        <div className="relative bg-gray-800/50 rounded-xl p-5 border border-gray-700 animate-in fade-in duration-300">
           {/* Decorative Quote Icon */}
           <div className="absolute top-4 right-4 opacity-10">
               <Quote className="w-12 h-12 text-white" />
           </div>

           <div className="mb-2">
               <h4 className="text-lg font-bold text-gray-100 historical-font">{activePerspective.name}</h4>
               <span className={`
                 text-xs uppercase tracking-widest font-bold px-2 py-0.5 rounded
                 ${activePerspective.type === 'key_figure' ? 'bg-purple-900/50 text-purple-300' : 
                   activePerspective.type === 'expert' ? 'bg-blue-900/50 text-blue-300' : 
                   'bg-amber-900/50 text-amber-300'}
               `}>
                 {activePerspective.role}
               </span>
           </div>
           
           <p className="text-gray-300 italic leading-relaxed text-sm md:text-base border-l-2 pl-4 border-gray-600">
             "{activePerspective.content}"
           </p>

           {activePerspective.type === 'expert' && (
               <div className="mt-3 text-[10px] text-gray-500 uppercase tracking-widest flex items-center gap-1">
                   <BookOpen className="w-3 h-3" /> Historical Analysis
               </div>
           )}
        </div>
      )}
    </div>
  );
};