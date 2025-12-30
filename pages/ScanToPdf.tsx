
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Camera, QrCode, Smartphone, WifiOff, ShieldCheck, Loader2, Info, RefreshCw, Lock } from 'lucide-react';
import { AppView } from '../types';

interface Props {
  setView: (view: AppView) => void;
}

export const ScanToPdf: React.FC<Props> = ({ setView }) => {
  const [step, setStep] = useState(1);
  const [qrUrl, setQrUrl] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const generateSession = () => {
    setIsRefreshing(true);
    // Simulate session generation
    setTimeout(() => {
      const sessionId = Math.random().toString(36).substring(7);
      const mockMobileUrl = `https://convertly.app/scan/${sessionId}`;
      setQrUrl(`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(mockMobileUrl)}&bgcolor=ffffff&color=000000&margin=2`);
      setIsRefreshing(false);
    }, 800);
  };

  useEffect(() => {
    generateSession();
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-4 px-6 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => setView(AppView.HOME)} className="flex items-center text-slate-500 hover:text-brand-600 font-bold transition-all group">
            <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" /> Back
          </button>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Live Sync Terminal</span>
          </div>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="flex-grow max-w-6xl mx-auto w-full p-6 md:p-12">
        <div className="bg-white rounded-[60px] shadow-2xl border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[700px]">
          
          {/* Left Panel: Instructions */}
          <div className="w-full md:w-1/2 p-12 lg:p-16 flex flex-col justify-center bg-white">
            <div className="mb-12">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 text-brand-600 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-brand-100">
                    <Smartphone className="h-3 w-3" /> Mobile Integration
                </div>
                <h2 className="text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tighter leading-[0.95]">
                  Scan documents from your smartphone to your browser
                </h2>
                <p className="text-slate-500 text-xl font-medium leading-relaxed">
                  Transform physical papers into professional PDF files without needing a scanner.
                </p>
            </div>

            <div className="space-y-10">
              {/* Step 1 */}
              <div className={`relative pl-16 transition-all duration-500 ${step === 1 ? 'opacity-100' : 'opacity-40'}`}>
                 <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl transition-all shadow-lg ${step === 1 ? 'bg-slate-900 text-white scale-110 rotate-3' : 'bg-slate-100 text-slate-400'}`}>1</div>
                 <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Step 1</h3>
                 <p className="text-slate-500 font-bold text-lg">Use your smartphone's camera to scan this QR code</p>
              </div>

              {/* Step 2 */}
              <div className={`relative pl-16 transition-all duration-500 ${step === 2 ? 'opacity-100 translate-x-0' : 'opacity-40 translate-x-4'}`}>
                 <div className={`absolute left-0 top-0 w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl transition-all shadow-lg ${step === 2 ? 'bg-brand-600 text-white scale-110 -rotate-3' : 'bg-slate-100 text-slate-400'}`}>2</div>
                 <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">Step 2</h3>
                 
                 <div className="flex items-center gap-3 text-red-600 bg-red-50 px-5 py-3 rounded-2xl border border-red-100 mb-5 w-fit">
                   <WifiOff className="h-5 w-5 animate-bounce" />
                   <span className="font-black uppercase tracking-[0.15em] text-xs">Disconnected 📴</span>
                 </div>
                 
                 <p className="text-slate-600 font-bold text-lg leading-relaxed max-w-md">
                   To scan your documents, please follow the instructions on your mobile screen, and tap <span className="text-brand-600 px-2 py-0.5 bg-brand-50 rounded-lg">Save</span> when you're done.
                 </p>
                 
                 <div className="mt-6 p-5 bg-slate-900 rounded-3xl border border-slate-800 flex items-start gap-4 shadow-xl">
                    <div className="p-2 bg-brand-600 rounded-xl">
                        <Info className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-white text-sm font-bold leading-relaxed uppercase tracking-widest pt-1">Do not close this tab.</p>
                 </div>
              </div>
            </div>
          </div>

          {/* Right Panel: The Scanner Terminal */}
          <div className="w-full md:w-1/2 bg-slate-50 p-12 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background pattern - Fixed invalid CSS property 'size' to 'backgroundSize' */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <div className="max-w-[380px] w-full bg-white p-10 rounded-[64px] shadow-2xl border border-slate-200 relative group animate-in zoom-in-95 duration-700">
               {/* Animated Scanning Brackets */}
               <div className="absolute top-6 left-6 w-12 h-12 border-t-[6px] border-l-[6px] border-brand-600 rounded-tl-2xl animate-pulse"></div>
               <div className="absolute top-6 right-6 w-12 h-12 border-t-[6px] border-r-[6px] border-brand-600 rounded-tr-2xl animate-pulse"></div>
               <div className="absolute bottom-6 left-6 w-12 h-12 border-b-[6px] border-l-[6px] border-brand-600 rounded-bl-2xl animate-pulse"></div>
               <div className="absolute bottom-6 right-6 w-12 h-12 border-b-[6px] border-r-[6px] border-brand-600 rounded-br-2xl animate-pulse"></div>

               <div className="aspect-square bg-slate-50 rounded-[40px] overflow-hidden mb-8 flex items-center justify-center p-6 relative">
                  {isRefreshing ? (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="h-12 w-12 text-brand-600 animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Generating Secure Key</span>
                    </div>
                  ) : qrUrl ? (
                    <div className="relative w-full h-full group-hover:scale-105 transition-transform duration-500">
                        <img src={qrUrl} className="w-full h-full object-contain mix-blend-multiply" alt="Scan QR Code" />
                        {/* Scanning Line Effect */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-brand-600/30 blur-sm animate-[scanLine_3s_linear_infinite]"></div>
                    </div>
                  ) : null}
               </div>

               <div className="text-center space-y-4">
                  <div className="inline-flex items-center gap-3 px-5 py-2 bg-slate-900 rounded-2xl text-white text-[11px] font-black uppercase tracking-[0.2em] shadow-lg">
                    <Smartphone className="h-4 w-4 text-brand-500" /> Mobile Connect
                  </div>
                  <div className="space-y-1">
                    <p className="text-slate-400 font-black text-[10px] uppercase tracking-[0.3em]">Session Ready</p>
                    <p className="text-slate-900 font-black text-3xl tracking-tight">Scan QR Code</p>
                  </div>
               </div>
            </div>

            {/* Status & Security Badges */}
            <div className="mt-16 flex flex-col items-center gap-6">
               <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full border border-green-100">
                    <Lock className="h-4 w-4" />
                    <span className="font-black uppercase tracking-widest text-[10px]">End-to-end encrypted connection</span>
                  </div>
               </div>
               
               <div className="flex items-center gap-4">
                  <button 
                    onClick={() => { setStep(1); generateSession(); }}
                    className="flex items-center gap-2 text-slate-400 hover:text-brand-600 font-black uppercase tracking-[0.2em] text-[10px] transition-all group"
                  >
                    <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                    Trouble scanning? Try refreshing
                  </button>
               </div>
            </div>

            {/* Step Toggle Helper (For demo purposes) */}
            <div className="absolute bottom-6 right-6 opacity-0 hover:opacity-100 transition-opacity">
               <button onClick={() => setStep(step === 1 ? 2 : 1)} className="px-3 py-1 bg-slate-200 rounded text-[10px] font-bold">Simulate Connection</button>
            </div>
          </div>

        </div>
      </div>
      
      <style>{`
        @keyframes scanLine {
            0% { top: 0; }
            50% { top: 100%; }
            100% { top: 0; }
        }
      `}</style>
    </div>
  );
};
