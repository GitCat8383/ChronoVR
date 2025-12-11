import React, { useState } from 'react';
import { X, Loader2, GitBranch, AlertTriangle, ArrowRight } from 'lucide-react';
import { divergeHistory } from '../services/geminiService';

interface ButterflyEffectProps {
  era: string;
  currentDescription: string;
  onClose: () => void;
  onApplyDivergence: (result: any) => void;
}

export const ButterflyEffect: React.FC<ButterflyEffectProps> = ({ era, currentDescription, onClose, onApplyDivergence }) => {
  const [intervention, setIntervention] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intervention.trim()) return;

    setIsLoading(true);
    
    try {
        const result = await divergeHistory(era, intervention, currentDescription);
        if (result) {
            onApplyDivergence(result);
            onClose();
        } else {
            alert("The timeline resisted your change. Try again.");
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
        <div className="w-full max-w-lg bg-gray-900 border border-purple-800/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            {/* Background Effect */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>

            <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white">
                <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-purple-900/30 rounded-full border border-purple-500/30">
                    <GitBranch className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-white historical-font tracking-wide">Butterfly Effect</h2>
                    <p className="text-xs text-purple-400 uppercase tracking-widest">Timeline Divergence Sandbox</p>
                </div>
            </div>

            <div className="bg-purple-900/10 border border-purple-500/20 rounded-lg p-4 mb-6 flex gap-3 items-start">
                 <AlertTriangle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                 <p className="text-xs text-purple-200 leading-relaxed">
                     <strong>Warning:</strong> Intervening in historical events can lead to unpredictable outcomes. The environment, political landscape, and people may change drastically.
                 </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">
                        How will you intervene?
                    </label>
                    <textarea 
                        value={intervention}
                        onChange={(e) => setIntervention(e.target.value)}
                        placeholder="e.g. Warn Caesar about Brutus, Give antibiotics to a plague doctor..."
                        className="w-full bg-black/50 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 focus:outline-none placeholder-gray-600 transition-colors h-32 resize-none"
                        disabled={isLoading}
                    />
                </div>

                <button 
                    type="submit"
                    disabled={!intervention.trim() || isLoading}
                    className={`
                        w-full py-4 rounded-lg font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-all
                        ${isLoading 
                            ? 'bg-purple-900/20 text-purple-500/50 cursor-wait' 
                            : 'bg-purple-700 hover:bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)]'}
                    `}
                >
                    {isLoading ? (
                        <>
                           <Loader2 className="w-5 h-5 animate-spin" /> Calculating Causality...
                        </>
                    ) : (
                        <>
                           <ArrowRight className="w-5 h-5" /> Break Time
                        </>
                    )}
                </button>
            </form>
        </div>
    </div>
  );
};