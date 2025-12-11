import React, { useState } from 'react';
import { X, Loader2, Hourglass, PlayCircle, FastForward } from 'lucide-react';
import { generateTimeLapse } from '../services/geminiService';

interface GodModeProps {
  era: string;
  onClose: () => void;
  onPlayVideo: (uri: string) => void;
}

export const GodMode: React.FC<GodModeProps> = ({ era, onClose, onPlayVideo }) => {
  const [subject, setSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    setIsLoading(true);
    
    // Simulate progress bar while waiting for Veo
    const interval = setInterval(() => {
        setProgress(p => Math.min(p + 1, 90));
    }, 500);

    try {
        const videoUri = await generateTimeLapse(era, subject);
        clearInterval(interval);
        setProgress(100);
        if (videoUri) {
            onPlayVideo(videoUri);
            onClose();
        } else {
            alert("Failed to generate time-lapse. Please try again.");
            setIsLoading(false);
            setProgress(0);
        }
    } catch (e) {
        console.error(e);
        clearInterval(interval);
        setIsLoading(false);
        setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
        <div className="w-full max-w-lg bg-gray-900 border border-cyan-800/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            {/* Background Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50"></div>

            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-cyan-900/30 rounded-full border border-cyan-500/30">
                    <Hourglass className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white historical-font tracking-wide">God Mode</h2>
                    <p className="text-xs text-cyan-400 uppercase tracking-widest">Temporal Acceleration Engine</p>
                </div>
            </div>

            <div className="space-y-4">
                <p className="text-gray-300 text-sm leading-relaxed">
                    Step outside the flow of time. Visualize massive construction projects, crowd migrations, or environmental changes from a bird's-eye perspective.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                    <div>
                        <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                            What process do you want to accelerate?
                        </label>
                        <input 
                            type="text" 
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="e.g. Building the Great Pyramid, The Nile Flooding..."
                            className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none placeholder-gray-600 transition-colors"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50 flex flex-col items-center justify-center gap-2 h-32 relative">
                         {!isLoading ? (
                             <>
                                <FastForward className="w-8 h-8 text-gray-600" />
                                <span className="text-xs text-gray-500">Preview Area</span>
                             </>
                         ) : (
                             <div className="w-full px-4">
                                 <div className="flex justify-between text-xs text-cyan-400 mb-2 uppercase font-bold">
                                     <span>Accelerating Time...</span>
                                     <span>{progress}%</span>
                                 </div>
                                 <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden">
                                     <div className="bg-cyan-500 h-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                 </div>
                                 <p className="text-[10px] text-center text-gray-500 mt-2 animate-pulse">
                                     Rendering temporal data chunks...
                                 </p>
                             </div>
                         )}
                    </div>

                    <button 
                        type="submit"
                        disabled={!subject.trim() || isLoading}
                        className={`
                            w-full py-4 rounded-lg font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all
                            ${isLoading 
                                ? 'bg-cyan-900/20 text-cyan-500/50 cursor-wait' 
                                : 'bg-cyan-700 hover:bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'}
                        `}
                    >
                        {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
                        {isLoading ? 'Simulating Physics...' : 'Initiate Time-Lapse'}
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
};