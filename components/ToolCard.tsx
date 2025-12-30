import React from 'react';
import { Tool } from '../types';
import { Sparkles, ArrowUpRight } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
  onClick: (tool: Tool) => void;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onClick }) => {
  return (
    <div 
      onClick={() => onClick(tool)}
      className="group relative bg-white dark:bg-[#0f172a] p-8 rounded-[40px] border border-slate-100 dark:border-slate-800/40 cursor-pointer flex flex-col items-start h-full transition-all duration-500 hover:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.15)] dark:hover:shadow-[0_32px_64px_-16px_rgba(244,63,94,0.15)] hover:-translate-y-2 active:scale-95 overflow-hidden"
    >
      {/* Background Accent Glow */}
      <div className="absolute -right-12 -top-12 w-32 h-32 blur-[80px] opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none bg-brand-600"></div>

      <div className="flex items-start justify-between w-full mb-8 z-10">
        <div className="p-5 rounded-[24px] bg-slate-900/5 dark:bg-brand-500/10 text-brand-600 dark:text-brand-500 border border-slate-100 dark:border-brand-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm">
          <tool.icon className="h-7 w-7" />
        </div>
        
        <div className="flex flex-col items-end gap-2 translate-x-2 group-hover:translate-x-0 transition-transform duration-500">
          {tool.isNew && (
            <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-blue-600 text-white shadow-lg">
              NEW
            </span>
          )}
          {tool.isAi && (
            <span className="px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center gap-1.5 shadow-xl">
              <Sparkles className="h-3 w-3" /> AI PRO
            </span>
          )}
        </div>
      </div>
      
      <div className="flex-grow z-10">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight group-hover:text-brand-600 transition-colors">
          {tool.title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-[15px] font-medium leading-[1.6] group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
          {tool.description}
        </p>
      </div>

      <div className="mt-10 w-full pt-6 border-t border-slate-100 dark:border-slate-800/40 flex items-center justify-between z-10">
        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] group-hover:text-brand-600 transition-colors">Open Tool</span>
        <div className="p-2 bg-slate-900/5 dark:bg-slate-800/50 rounded-xl text-slate-400 group-hover:bg-brand-600 group-hover:text-white transition-all shadow-sm">
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
};