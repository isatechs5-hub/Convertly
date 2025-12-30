import React from 'react';
import { AppView } from '../types';
import { ArrowLeft, Timer, Rocket } from 'lucide-react';

interface ComingSoonProps {
  setView: (view: AppView) => void;
  title?: string;
  description?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ setView, title = "Coming Soon", description = "We are working hard to bring this feature to life." }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] font-sans flex flex-col">
       {/* Header */}
       <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 py-4 px-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
                onClick={() => setView(AppView.HOME)}
                className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors"
            >
                <ArrowLeft className="h-5 w-5" /> Back to Home
            </button>
        </div>
      </div>

      <div className="flex-grow flex items-center justify-center p-6">
        <div className="text-center max-w-2xl">
            <div className="w-24 h-24 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-3xl flex items-center justify-center mx-auto mb-8 animate-bounce">
                <Rocket className="h-12 w-12" />
            </div>
            
            <h1 className="text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter">
                {title}
            </h1>
            
            <p className="text-xl text-slate-500 dark:text-slate-400 mb-12 leading-relaxed">
                {description} <br/> Stay tuned for something amazing!
            </p>

            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <Timer className="h-5 w-5 text-brand-500" />
                <span className="font-bold text-slate-700 dark:text-slate-300">Expected Launch: December 2026</span>
            </div>
        </div>
      </div>
    </div>
  );
};