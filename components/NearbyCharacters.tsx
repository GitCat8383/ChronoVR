import React from 'react';
import { LocalNPC } from '../types';
import { PlayCircle, MessageCircle, Loader2, User, UserCheck } from 'lucide-react';

interface NearbyCharactersProps {
  npcs: LocalNPC[];
  activeNpcName: string;
  onSelectNpc: (npc: LocalNPC) => void;
  onGenerateVideo: (npc: LocalNPC) => void;
  onPlayVideo: (videoUri: string) => void;
  isGeneratingId: string | null;
  disabled: boolean;
}

export const NearbyCharacters: React.FC<NearbyCharactersProps> = ({ 
  npcs, 
  activeNpcName, 
  onSelectNpc, 
  onGenerateVideo,
  onPlayVideo,
  isGeneratingId, 
  disabled 
}) => {
  if (!npcs || npcs.length === 0) return null;

  // Function to determine avatar background color based on name length (deterministic)
  const getAvatarColor = (name: string) => {
    const colors = ['bg-red-900', 'bg-blue-900', 'bg-green-900', 'bg-amber-900', 'bg-purple-900', 'bg-pink-900'];
    return colors[name.length % colors.length];
  };

  return (
    <div className="bg-gray-900/90 backdrop-blur-md rounded-xl border border-gray-800 p-6 shadow-xl">
      <h3 className="text-amber-500 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
        <User className="w-4 h-4" />
        People Nearby
      </h3>

      <div className="space-y-3">
        {npcs.map((npc) => {
          const isActive = npc.name === activeNpcName;
          const isGenerating = isGeneratingId === npc.id;

          return (
            <div 
              key={npc.id} 
              className={`
                group rounded-lg p-3 border transition-all duration-300
                ${isActive ? 'bg-amber-900/10 border-amber-500/50' : 'bg-gray-800/40 border-gray-700 hover:border-gray-600'}
              `}
            >
              {/* Header: Avatar + Name + Chat Button */}
              <div 
                className="flex items-center gap-3 mb-2 cursor-pointer"
                onClick={() => !disabled && onSelectNpc(npc)}
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border border-white/10 ${getAvatarColor(npc.name)}`}>
                    <span className="font-bold text-xs text-white/90">{npc.name.substring(0, 2).toUpperCase()}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className={`text-sm font-bold truncate ${isActive ? 'text-amber-400' : 'text-gray-200'}`}>
                            {npc.name}
                        </h4>
                        {isActive && <UserCheck className="w-3 h-3 text-amber-500" />}
                    </div>
                    <p className="text-xs text-gray-400 truncate">{npc.role}</p>
                </div>

                {/* Chat Indicator */}
                <button 
                  className={`p-2 rounded-full transition-colors ${isActive ? 'text-amber-500 bg-amber-500/10' : 'text-gray-600 hover:text-gray-300'}`}
                  title="Chat with this person"
                >
                    <MessageCircle className="w-4 h-4" />
                </button>
              </div>

              {/* Activity & Video Action */}
              <div className="pl-[52px]">
                  <p className="text-xs text-gray-500 italic mb-2 line-clamp-2">
                      Doing: {npc.activity}
                  </p>

                  {npc.videoUri ? (
                      <button
                        onClick={() => onPlayVideo(npc.videoUri!)}
                        className="w-full flex items-center justify-center gap-2 py-1.5 rounded bg-green-900/30 text-green-400 text-[10px] font-bold uppercase border border-green-800 hover:bg-green-900/50 transition-colors"
                      >
                          <PlayCircle className="w-3 h-3" /> Watch Daily Life
                      </button>
                  ) : (
                      <button
                        onClick={() => onGenerateVideo(npc)}
                        disabled={disabled || isGenerating || !!isGeneratingId}
                        className={`
                            w-full flex items-center justify-center gap-2 py-1.5 rounded text-[10px] font-bold uppercase border transition-all
                            ${isGenerating 
                                ? 'bg-amber-900/20 text-amber-500 border-amber-800/50 cursor-wait' 
                                : 'bg-gray-700/50 text-gray-400 border-gray-600 hover:bg-gray-700 hover:text-gray-200'}
                        `}
                      >
                          {isGenerating ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" /> Generating...
                              </>
                          ) : (
                              <>
                                <PlayCircle className="w-3 h-3" /> Visualize Activity
                              </>
                          )}
                      </button>
                  )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};