import React from 'react';
import { AppView } from '../types';
import { ArrowLeft, Rocket, Mail, Phone, MapPin, User, Linkedin, Twitter, Globe, Award, Sparkles } from 'lucide-react';

interface AboutProps {
  setView: (view: AppView) => void;
}

export const About: React.FC<AboutProps> = ({ setView }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] font-sans">
       {/* Header */}
       <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 py-4 px-8 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
            <button
                onClick={() => setView(AppView.HOME)}
                className="flex items-center gap-2 text-slate-500 hover:text-brand-600 transition-colors"
            >
                <ArrowLeft className="h-5 w-5" /> Back to Home
            </button>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">About Us</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-20">
        
        {/* Hero */}
        <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-brand-100 dark:border-brand-900/30">
                <Sparkles className="h-3 w-3" /> Our Mission
            </div>
            <h1 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-none">
                Empowering the world <br/> with <span className="text-brand-600">smarter documents.</span>
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
                We believe document management shouldn't be a struggle. Our mission is to provide professional-grade PDF tools that are accessible, secure, and powered by the latest AI technology.
            </p>
        </div>

        {/* Founder Card */}
        <div className="bg-white dark:bg-slate-900 rounded-[48px] p-12 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden group mb-20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full blur-[120px] opacity-10 pointer-events-none group-hover:opacity-20 transition-opacity duration-700"></div>
            
            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
                <div className="w-48 h-48 rounded-[32px] bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden shadow-lg rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    <User className="h-24 w-24 text-slate-400" />
                    {/* Placeholder for Founder Image if available */}
                </div>
                
                <div className="flex-grow text-center md:text-left">
                    <div className="inline-block px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest mb-4">Founder & CEO</div>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Isa</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">Visionary behind Convertly AI</p>
                    
                    <div className="flex flex-col gap-4">
                        <a href="mailto:isatechs5@gmail.com" className="flex items-center justify-center md:justify-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 transition-colors group/link">
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm group-hover/link:text-brand-600 text-slate-400">
                                <Mail className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-sm">isatechs5@gmail.com</span>
                        </a>
                        
                        <a href="tel:9353111982" className="flex items-center justify-center md:justify-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 transition-colors group/link">
                            <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm group-hover/link:text-brand-600 text-slate-400">
                                <Phone className="h-5 w-5" />
                            </div>
                            <span className="font-bold text-sm">+91 9353111982</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
                { icon: Award, title: "Excellence", desc: "We strive for pixel-perfect quality in every conversion." },
                { icon: ShieldCheck, title: "Privacy First", desc: "Your data is yours. We process securely and privately." },
                { icon: Globe, title: "Global Reach", desc: "Tools built for everyone, accessible from anywhere." }
            ].map((item, i) => (
                <div key={i} className="p-8 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800 text-center hover:-translate-y-2 transition-transform duration-300">
                    <div className="w-12 h-12 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-black text-slate-900 dark:text-white mb-3 text-lg">{item.title}</h3>
                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
};

import { ShieldCheck } from 'lucide-react';