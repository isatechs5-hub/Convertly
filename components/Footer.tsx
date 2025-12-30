import React from 'react';
import { AppView } from '../types';
import {
  Mail, Zap, Globe, Shield, ArrowRight, Heart, Instagram
} from 'lucide-react';

interface FooterProps {
  setView: (view: AppView) => void;
}

export const Footer: React.FC<FooterProps> = ({ setView }) => {
  return (
    <footer className="relative bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 border-t border-slate-200/50 dark:border-slate-800/50 py-20 mt-auto overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 dark:opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-rose-500 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-3 bg-gradient-to-r from-brand-600 to-rose-500 bg-clip-text text-transparent">
                Convertly
              </h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
                The next-generation PDF platform powered by AI. Transform your documents with intelligent processing and lightning-fast performance.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mb-8">
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">2M+</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Users</div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">50M+</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Documents</div>
              </div>
              <div>
                <div className="text-2xl font-black text-slate-900 dark:text-white">99.9%</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">Uptime</div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 flex-wrap">
              {/* Instagram */}
              <a href="https://www.instagram.com/nexus.flow.ai/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-500 hover:via-pink-500 hover:to-orange-500 hover:text-white transition-all hover:scale-110 group" title="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              
              {/* X (Twitter) */}
              <a href="https://x.com/NexusF3979" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center hover:bg-black hover:text-white transition-all hover:scale-110 group" title="X (Twitter)">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></svg>
              </a>

              {/* Reddit */}
              <a href="https://www.reddit.com/user/Quirky_Wave_4943/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center hover:bg-[#FF4500] hover:text-white transition-all hover:scale-110 group" title="Reddit">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/></svg>
              </a>

              {/* Discord */}
              <a href="https://discord.com/channels/1444713050027462700/1444713050702741637" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center hover:bg-[#5865F2] hover:text-white transition-all hover:scale-110 group" title="Discord">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 127.14 96.36" aria-hidden="true"><path d="M107.7,8.07A105.15,105.15,0,0,0,81.47,0a72.06,72.06,0,0,0-3.36,6.83A97.68,97.68,0,0,0,49,6.83,72.37,72.37,0,0,0,45.64,0,105.89,105.89,0,0,0,19.39,8.09C2.79,32.65-1.71,56.6.54,80.21h0A105.73,105.73,0,0,0,32.71,96.36,77.11,77.11,0,0,0,39.6,85.25a68.42,68.42,0,0,1-10.85-5.18c.91-.66,1.8-1.34,2.66-2a75.57,75.57,0,0,0,64.32,0c.87.71,1.76,1.39,2.66,2a68.68,68.68,0,0,1-10.87,5.19,77,77,0,0,0,6.89,11.1A105.89,105.89,0,0,0,126.6,80.22c1.24-23.28-5.16-47-21.78-72.15ZM42.45,65.69C36.18,65.69,31,60,31,53s5-12.74,11.43-12.74S54,46,53.89,53,48.84,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.25,60,73.25,53s5-12.74,11.44-12.74S96.23,46,96.12,53,91.08,65.69,84.69,65.69Z"/></svg>
              </a>

              {/* Gmail */}
              <a href="mailto:isatechs5@gmail.com" className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all hover:scale-110 group" title="Email Us">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Product Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-brand-600 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white text-lg">Product</h4>
            </div>
            <ul className="space-y-3">
              <li>
                <button onClick={() => setView(AppView.PRICING)} className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="font-medium">Pricing</span>
                </button>
              </li>
              <li>
                <button onClick={() => setView(AppView.ABOUT)} className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="font-medium">About</span>
                </button>
              </li>
              <li>
                <button onClick={() => setView(AppView.COMING_SOON)} className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="font-medium">API</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Resources Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Globe className="h-4 w-4 text-white" />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white text-lg">Resources</h4>
            </div>
            <ul className="space-y-3">
              <li>
                <button onClick={() => setView(AppView.BLOG)} className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="font-medium">Blog</span>
                </button>
              </li>
              <li>
                <button onClick={() => setView(AppView.ROADMAP)} className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="font-medium">Roadmap</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <h4 className="font-black text-slate-900 dark:text-white text-lg">Legal</h4>
            </div>
            <ul className="space-y-3">
              <li>
                <button onClick={() => setView(AppView.PRIVACY_POLICY)} className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="font-medium">Privacy Policy</span>
                </button>
              </li>
              <li>
                <button onClick={() => setView(AppView.TERMS_OF_SERVICE)} className="group flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-all">
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="font-medium">Terms of Service</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-200/50 dark:border-slate-800/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
              <span>© 2024 Convertly. All rights reserved.</span>
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-brand-500 fill-brand-500 animate-pulse" />
              <span>for document lovers worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
