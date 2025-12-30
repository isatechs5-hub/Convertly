
import React, { useState, useEffect, useRef } from 'react';
import {
    ArrowLeft, LayoutDashboard, Key, BookOpen, Activity,
    Terminal, ShieldCheck, Database, Zap, Copy, RefreshCw,
    Plus, Trash2, CheckCircle2, Info, ChevronRight, Code2,
    Layers, Settings, Share2, Globe, Clock, Box, Sparkles, Lock,
    CreditCard, Eye, EyeOff, AlertTriangle, Cpu
} from 'lucide-react';
import { AppView } from '../types';

interface ApiDashboardProps {
    setView: (view: AppView) => void;
}

type Tab = 'intro' | 'auth' | 'refs' | 'usage' | 'billing' | 'projects';

export const ApiDashboard: React.FC<ApiDashboardProps> = ({ setView }) => {
    const [activeTab, setActiveTab] = useState<Tab>('intro');
    const [apiKey, setApiKey] = useState('');
    const [isKeyVisible, setIsKeyVisible] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPaidPlan, setIsPaidPlan] = useState(false); // Simulated payment status
    
    // Real-time Analytics State
    const [requests, setRequests] = useState(12482);
    const [latency, setLatency] = useState(28);
    const [cpuLoad, setCpuLoad] = useState(45);

    // Simulate Real-time Data Stream
    useEffect(() => {
        const interval = setInterval(() => {
            setRequests(prev => prev + Math.floor(Math.random() * 5));
            setLatency(prev => Math.max(10, Math.min(100, prev + (Math.random() - 0.5) * 10)));
            setCpuLoad(prev => Math.max(5, Math.min(95, prev + (Math.random() - 0.5) * 5)));
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    // Load persisted key
    useEffect(() => {
        const savedKey = localStorage.getItem('convertly_live_key');
        if (savedKey) setApiKey(savedKey);
        
        const savedPlan = localStorage.getItem('convertly_plan');
        if (savedPlan === 'pro') setIsPaidPlan(true);
    }, []);

    const generateNewKey = () => {
        if (!isPaidPlan) {
            if (confirm("API Key generation requires a Pro plan. Upgrade now?")) {
                // Simulate Upgrade Flow
                setTimeout(() => {
                    setIsPaidPlan(true);
                    localStorage.setItem('convertly_plan', 'pro');
                    alert("Upgrade Successful! You can now generate keys.");
                }, 1000);
            }
            return;
        }

        if (apiKey && !confirm("This will revoke your existing key immediately. Continue?")) return;

        setIsGenerating(true);
        setTimeout(() => {
            const newKey = `op_live_${Math.random().toString(36).substring(2, 10)}_${Math.random().toString(36).substring(2, 10)}`;
            setApiKey(newKey);
            localStorage.setItem('convertly_live_key', newKey);
            setIsGenerating(false);
            setIsKeyVisible(true);
            
            // Immediate Alert
            alert("SUCCESS: New API Key Generated.\n\nPlease COPY and SAVE this key immediately.\nIt will be hidden for security once you leave this page.");
        }, 1500);
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(apiKey);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const SidebarItem = ({ id, icon: Icon, label }: { id: Tab, icon: any, label: string }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`w-full flex items-center gap-3 px-6 py-4 rounded-2xl transition-all ${activeTab === id
                ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20 translate-x-1'
                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
        >
            <Icon className="h-5 w-5" />
            <span className="font-bold text-sm tracking-tight">{label}</span>
            {activeTab === id && <ChevronRight className="h-4 w-4 ml-auto opacity-50" />}
        </button>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col font-sans">
            {/* Top Header */}
            <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 py-4 px-8 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setView(AppView.HOME)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors group"
                        >
                            <ArrowLeft className="h-5 w-5 text-slate-500 group-hover:-translate-x-1 transition-transform" />
                        </button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
                                <Code2 className="h-6 w-6 text-white" />
                            </div>
                            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">Developer Portal</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-full">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-green-600">API Status: Operational</span>
                        </div>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs hover:scale-105 active:scale-95 transition-all shadow-xl">
                            <Share2 className="h-4 w-4" /> Docs
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex-grow flex max-w-[1600px] mx-auto w-full p-6 md:p-10 gap-10">
                {/* Sidebar Navigation */}
                <div className="hidden lg:flex w-72 flex-col gap-2 shrink-0">
                    <SidebarItem id="intro" icon={BookOpen} label="Introduction" />
                    <SidebarItem id="auth" icon={ShieldCheck} label="Authentication" />
                    <SidebarItem id="refs" icon={Terminal} label="API References" />
                    <div className="my-4 h-px bg-slate-200 dark:bg-slate-800 mx-6"></div>
                    <SidebarItem id="projects" icon={Layers} label="Project Manager" />
                    <SidebarItem id="usage" icon={Activity} label="Usage & Analytics" />
                    <SidebarItem id="billing" icon={CreditCard} label="Limits & Billing" />

                    <div className="mt-auto p-6 bg-gradient-to-br from-brand-600 to-rose-500 rounded-3xl text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">Pro Developer</p>
                        <p className="text-sm font-bold leading-tight mb-4">Multi-Core Processing Active</p>
                        <div className="flex items-center gap-2 mb-4">
                            <Cpu className="h-4 w-4 animate-pulse" />
                            <span className="text-xs font-mono">{cpuLoad.toFixed(1)}% Load</span>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-grow bg-white dark:bg-slate-900 rounded-[48px] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[800px]">
                    {/* Tab Content */}
                    <div className="flex-grow p-12 overflow-y-auto">

                        {activeTab === 'intro' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="max-w-3xl">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 border border-brand-100 dark:border-brand-900/30">
                                        <Zap className="h-3 w-3" /> API Overview
                                    </div>
                                    <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-6 tracking-tighter leading-tight">Build document power into your own apps.</h2>
                                    <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-12">
                                        Welcome to the Convertly AI API. Integrate our high-performance document processing directly into your stack.
                                    </p>

                                    <div className="space-y-6">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Quick Start</h3>
                                        <div className="p-8 bg-slate-950 rounded-[32px] shadow-2xl relative overflow-hidden group border border-slate-800">
                                            <div className="absolute top-0 right-0 p-4">
                                                <Terminal className="h-6 w-6 text-slate-700" />
                                            </div>
                                            <div className="flex items-center gap-2 mb-6">
                                                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                                                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                                                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                                            </div>
                                            <code className="text-slate-300 font-mono text-sm space-y-4 block">
                                                <div>
                                                    <p className="text-slate-500 mb-1"># Install the official client</p>
                                                    <p><span className="text-pink-500">npm</span> install convertly</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 mb-1"># Authenticate your terminal</p>
                                                    <p><span className="text-blue-400">convertly</span> auth <span className="text-emerald-400">{apiKey || 'op_live_your_key_here'}</span></p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 mb-1"># Push documents for processing</p>
                                                    <p><span className="text-blue-400">convertly</span> process</p>
                                                </div>
                                            </code>
                                            <button 
                                                onClick={() => { navigator.clipboard.writeText("npm install convertly"); alert("Command copied!"); }}
                                                className="absolute bottom-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all active:scale-95"
                                            >
                                                <Copy className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'auth' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">API Authentication</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium mb-12">Secure your requests using your private API live keys.</p>

                                <div className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-800 rounded-[40px] p-10 mb-10 shadow-sm relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-10 opacity-5">
                                        <Key className="h-32 w-32" />
                                    </div>
                                    <div className="flex flex-col gap-8">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2 block">Your Live API Key</label>
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <code className="text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono bg-slate-100 dark:bg-slate-900 px-4 py-2 rounded-lg">
                                                            {isGenerating ? 'Generating...' : (apiKey ? (isKeyVisible ? apiKey : 'op_live_••••••••••••••••') : 'No Active Key')}
                                                        </code>
                                                    </div>
                                                    
                                                    {apiKey && (
                                                        <>
                                                            <button
                                                                onClick={() => setIsKeyVisible(!isKeyVisible)}
                                                                className="p-3 bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-brand-600 rounded-xl transition-all"
                                                                title={isKeyVisible ? "Hide Key" : "Show Key"}
                                                            >
                                                                {isKeyVisible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                                            </button>
                                                            <button
                                                                onClick={copyToClipboard}
                                                                className={`p-3 rounded-xl transition-all ${isCopied ? 'bg-green-500 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-brand-600'}`}
                                                                title="Copy Key"
                                                            >
                                                                {isCopied ? <CheckCircle2 className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                                <p className="mt-4 text-xs font-medium text-slate-400 flex items-center gap-2">
                                                    <Info className="h-3 w-3" /> Never share your live keys in client-side code or public repositories.
                                                </p>
                                            </div>
                                            <button
                                                onClick={generateNewKey}
                                                disabled={isGenerating}
                                                className={`px-8 py-4 ${isPaidPlan ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900' : 'bg-slate-200 text-slate-400 cursor-not-allowed'} rounded-2xl font-black text-sm flex items-center gap-3 transition-all active:scale-95 disabled:opacity-70`}
                                            >
                                                <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} /> 
                                                {isPaidPlan ? 'Roll New Key' : 'Upgrade to Generate'}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-8">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white">Sample Authentication (Node.js)</h3>
                                    <div className="p-8 bg-slate-950 rounded-[32px] font-mono text-sm leading-relaxed overflow-x-auto border border-slate-800 shadow-2xl">
                                        <p><span className="text-blue-400">import</span> {'{ Convertly }'} <span className="text-blue-400">from</span> <span className="text-emerald-400">'convertly'</span>;</p>
                                        <p className="mt-4"><span className="text-slate-500">// Initialize with your secret key</span></p>
                                        <p><span className="text-blue-400">const</span> client = <span className="text-amber-400">new</span> <span className="text-amber-400">Convertly</span>(<span className="text-emerald-400">'{apiKey || 'op_live_...'}'</span>);</p>
                                        <p className="mt-4"><span className="text-slate-500">// Requests are now authenticated</span></p>
                                        <p><span className="text-blue-400">const</span> result = <span className="text-blue-400">await</span> client.<span className="text-purple-400">merge</span>([fileA, fileB]);</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'refs' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">API References</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium mb-12">Detailed endpoint specifications for document tools.</p>
                                {/* API Refs Content (Same as before) */}
                                <div className="space-y-6">
                                    {[
                                        { method: 'POST', endpoint: '/v1/merge', title: 'Merge PDF Documents', desc: 'Combines multiple PDF files into one output document.' },
                                        { method: 'POST', endpoint: '/v1/split', title: 'Split PDF Document', desc: 'Breaks a PDF file into individual pages or segments.' },
                                        { method: 'GET', endpoint: '/v1/chat', title: 'AI Document Chat', desc: 'Interact with PDF content using natural language.' },
                                        { method: 'POST', endpoint: '/v1/convert', title: 'Office to PDF', desc: 'Convert Word, Excel, and PPT files to PDF format.' }
                                    ].map((api, i) => (
                                        <div key={i} className="group bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-8 rounded-[32px] hover:border-brand-500 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black tracking-widest ${api.method === 'POST' ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>{api.method}</span>
                                                    <code className="text-slate-900 dark:text-white font-black text-lg tracking-tight">{api.endpoint}</code>
                                                </div>
                                                <h4 className="font-bold text-slate-800 dark:text-slate-200">{api.title}</h4>
                                                <p className="text-slate-500 text-sm">{api.desc}</p>
                                            </div>
                                            <button className="px-6 py-2 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-slate-400 group-hover:bg-brand-500 group-hover:text-white group-hover:border-brand-500 transition-all font-black text-[10px] uppercase tracking-widest">Docs</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'usage' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">Usage & Analytics</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium mb-12">Real-time monitoring of your API consumption.</p>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                                    <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-6 opacity-10"><Activity className="h-16 w-16" /></div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Requests / Month</p>
                                        <p className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">{requests.toLocaleString()}</p>
                                        <div className="mt-4 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full w-[65%] bg-brand-500 transition-all duration-1000"></div>
                                        </div>
                                        <p className="mt-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live Updates</p>
                                    </div>
                                    <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Avg. Latency</p>
                                        <p className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">{Math.floor(latency)}ms</p>
                                        <div className="mt-4 flex gap-1 h-8 items-end">
                                            {[4, 7, 3, 8, 5, 9, 6, 4, 7, 5, 6, 8, 4, 5, 9].map((h, i) => (
                                                <div key={i} className="flex-grow bg-emerald-500 rounded-sm transition-all duration-300" style={{ height: `${Math.max(10, Math.random() * 100)}%`, opacity: 0.5 + (i/20) }}></div>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="p-8 bg-slate-50 dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-800">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Processing Load</p>
                                        <p className="text-4xl font-black text-slate-900 dark:text-white tabular-nums">{Math.floor(cpuLoad)}%</p>
                                        <p className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                            <div className={`w-2 h-2 rounded-full ${cpuLoad > 80 ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
                                            Multi-Core Active
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'billing' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">Limits & Billing</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium mb-12">Manage your subscription and spending limits.</p>

                                <div className="bg-slate-900 text-white p-10 rounded-[40px] mb-12 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
                                    <div className="relative z-10 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Current Plan</p>
                                            <h3 className="text-3xl font-black mb-4">{isPaidPlan ? 'Professional Tier' : 'Free Starter Tier'}</h3>
                                            <p className="text-slate-400 max-w-md text-sm">{isPaidPlan ? 'You have access to unlimited concurrent requests, priority support, and 99.9% SLA.' : 'Limited to 100 requests/day. Upgrade to unlock full potential.'}</p>
                                        </div>
                                        {!isPaidPlan && (
                                            <button 
                                                onClick={() => {
                                                    if(confirm("Simulate Upgrade Payment?")) {
                                                        setIsPaidPlan(true);
                                                        localStorage.setItem('convertly_plan', 'pro');
                                                    }
                                                }}
                                                className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl"
                                            >
                                                Upgrade Plan
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-6">Usage Limits</h3>
                                <div className="space-y-4 mb-12">
                                    {[
                                        { label: "Daily Conversions", used: requests % 1000, total: 50000 },
                                        { label: "Storage (GB)", used: 4.2, total: 100 },
                                        { label: "AI Tokens", used: 8500, total: 100000 }
                                    ].map((limit, i) => (
                                        <div key={i} className="p-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl">
                                            <div className="flex justify-between mb-2">
                                                <span className="font-bold text-slate-700 dark:text-slate-200">{limit.label}</span>
                                                <span className="text-xs font-mono text-slate-400">{limit.used.toLocaleString()} / {limit.total.toLocaleString()}</span>
                                            </div>
                                            <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                                <div className="h-full bg-slate-900 dark:bg-white" style={{ width: `${(limit.used / limit.total) * 100}%` }}></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'projects' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center mb-12">
                                    <div>
                                        <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter">Project Manager</h2>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Manage separate API environments and keys.</p>
                                    </div>
                                    <button className="flex items-center gap-2 px-6 py-3 bg-brand-600 text-white rounded-2xl font-black text-sm hover:translate-y-[-2px] transition-all shadow-xl shadow-brand-500/20 active:scale-95">
                                        <Plus className="h-5 w-5" /> New Project
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {[
                                        { name: "Main SaaS App", keys: 2, status: "Production", icon: Layers, requests: "8.4k" },
                                        { name: "Test Environment", keys: 1, status: "Development", icon: Settings, requests: "402" },
                                        { name: "Legacy Portal", keys: 1, status: "Archived", icon: Clock, requests: "0" }
                                    ].map((proj, i) => (
                                        <div key={i} className="p-8 bg-white dark:bg-slate-800 border-2 border-slate-50 dark:border-slate-800 rounded-[40px] hover:border-brand-500 transition-all group shadow-sm">
                                            <div className="flex items-start justify-between mb-8">
                                                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-brand-600 transition-colors">
                                                    <proj.icon className="h-8 w-8" />
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${proj.status === 'Production' ? 'bg-emerald-100 text-emerald-700' : proj.status === 'Development' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{proj.status}</span>
                                            </div>
                                            <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{proj.name}</h4>
                                            <div className="flex gap-6 mt-6">
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Keys</p>
                                                    <p className="font-bold">{proj.keys}</p>
                                                </div>
                                                <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Reqs (24h)</p>
                                                    <p className="font-bold">{proj.requests}</p>
                                                </div>
                                            </div>
                                            <div className="mt-8 flex gap-3">
                                                <button className="flex-grow py-3 bg-slate-50 dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-xl font-bold text-xs transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700">Settings</button>
                                                <button className="p-3 bg-rose-50 text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="h-5 w-5" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Footer Area inside Dashboard */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <button className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-600">Support</button>
                            <button className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-600">Community</button>
                            <button className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-brand-600">Give Feedback</button>
                        </div>
                        <div className="flex items-center gap-3">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Client Version</p>
                            <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black">v2.10.4</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
