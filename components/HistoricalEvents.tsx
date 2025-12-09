import React from 'react';
import { Film, Calendar, AlertCircle, PlayCircle, Loader2 } from 'lucide-react';
import { HistoricalEvent } from '../types';

interface HistoricalEventsProps {
  events: HistoricalEvent[];
  onPlayEvent: (event: HistoricalEvent) => void;
  isGenerating: boolean;
  currentVideoId: string | null;
  disabled: boolean;
}

export const HistoricalEvents: React.FC<HistoricalEventsProps> = ({ 
  events, 
  onPlayEvent, 
  isGenerating, 
  currentVideoId,
  disabled 
}) => {
  if (!events || events.length === 0) return null;

  return (
    <div className="bg-gray-900/90 backdrop-blur-md rounded-xl border border-gray-800 p-6 shadow-xl mb-6">
      <h3 className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
        <Film className="w-4 h-4" />
        Historical Records
      </h3>
      
      <div className="space-y-4">
        {events.map((event) => (
          <div key={event.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-bold text-gray-200 text-sm">{event.title}</h4>
              <span className="text-xs text-amber-500 font-mono flex items-center gap-1 bg-amber-900/20 px-2 py-0.5 rounded">
                <Calendar className="w-3 h-3" /> {event.date}
              </span>
            </div>
            
            <p className="text-xs text-gray-400 mb-2 line-clamp-2">{event.description}</p>
            
            <div className="flex items-center gap-2 mb-3">
               <AlertCircle className="w-3 h-3 text-red-400" />
               <span className="text-xs text-red-300 italic">Impact: {event.impact}</span>
            </div>

            <button
              onClick={() => onPlayEvent(event)}
              disabled={disabled || isGenerating}
              className={`w-full flex items-center justify-center gap-2 py-2 rounded text-xs font-bold uppercase tracking-wide transition-all
                ${currentVideoId === event.id 
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'}
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isGenerating && currentVideoId === event.id ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" /> Restoring Footage...
                </>
              ) : (
                <>
                  <PlayCircle className="w-3 h-3" /> Watch & Discuss
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};