
import React from 'react';
import {
    ArrowLeft, Users, MessageSquare, Map, Shield,
    Book, Heart, Star, Sparkles, Rocket, Globe,
    Lock, CheckCircle2, ChevronRight, Mail, Twitter, Github,
    Database
} from 'lucide-react';
import { AppView } from '../types';

interface PageProps {
    setView: (view: AppView) => void;
}

const Header = ({ title, icon: Icon, setView }: { title: string, icon: any, setView: any }) => (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-20 overflow-hidden relative">
        <div className="absolute inset-0 opacity-5">
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-brand-500 rounded-full blur-[100px]"></div>
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-rose-500 rounded-full blur-[100px]"></div>
        </div>
        <div className="max-w-5xl mx-auto px-6 relative">
            <button onClick={() => setView(AppView.HOME)} className="flex items-center gap-2 text-slate-500 hover:text-brand-600 font-bold mb-10 transition-all group">
                <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" /> Back to Home
            </button>
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 bg-brand-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-brand-500/20 rotate-3">
                    <Icon className="h-10 w-10 text-white -rotate-3" />
                </div>
                <div>
                    <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{title}</h1>
                    <p className="text-xl text-slate-500 font-medium mt-2">Convertly Platform Insight</p>
                </div>
            </div>
        </div>
    </div>
);

export const TeamsPage: React.FC<PageProps> = ({ setView }) => (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617]">
        <Header title="Our Team" icon={Users} setView={setView} />
        <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                    { name: "Alex Rivers", role: "Founder & CEO", image: "https://i.pravatar.cc/150?u=alex" },
                    { name: "Sarah Chen", role: "Head of AI", image: "https://i.pravatar.cc/150?u=sarah" },
                    { name: "Marcus Thorne", role: "Security Architect", image: "https://i.pravatar.cc/150?u=marcus" }
                ].map((member, i) => (
                    <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[40px] shadow-xl border border-slate-100 dark:border-slate-800 hover:-translate-y-2 transition-all group">
                        <div className="relative mb-6">
                            <img src={member.image} className="w-full aspect-square object-cover rounded-[32px] grayscale group-hover:grayscale-0 transition-all duration-500" />
                            <div className="absolute bottom-4 right-4 flex gap-2">
                                <div className="w-10 h-10 bg-white/90 backdrop-blur rounded-xl flex items-center justify-center text-slate-900 shadow-lg"><Twitter className="h-4 w-4" /></div>
                            </div>
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-1 tracking-tight">{member.name}</h3>
                        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{member.role}</p>
                    </div>
                ))}
            </div>

            <div className="mt-32 p-16 bg-slate-900 rounded-[64px] text-white overflow-hidden relative">
                <div className="absolute top-0 right-0 p-20 opacity-10">
                    <Heart className="h-64 w-64 rotate-12" />
                </div>
                <div className="max-w-2xl relative">
                    <h2 className="text-5xl font-black mb-6 tracking-tighter">We're hiring enthusiasts.</h2>
                    <p className="text-xl text-slate-400 mb-10 leading-relaxed font-medium">Join our mission to democratize document intelligence. We're looking for world-class engineers, designers, and thinkers.</p>
                    <button className="px-10 py-5 bg-brand-600 rounded-2xl font-black shadow-2xl shadow-brand-600/20 hover:scale-105 active:scale-95 transition-all">View Openings</button>
                </div>
            </div>
        </div>
    </div>
);

export const BlogPage: React.FC<PageProps> = ({ setView }) => (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617]">
        <Header title="The Journal" icon={MessageSquare} setView={setView} />
        <div className="max-w-5xl mx-auto px-6 py-20">
            <div className="grid grid-cols-1 gap-12">
                {[
                    { date: "Dec 18, 2024", title: "Introducing Gemini 3 for PDF Redaction", desc: "Experience 10x faster document sanitization with our latest AI model integration.", cat: "Product Update" },
                    { date: "Dec 12, 2024", title: "Why PDF Encryption Matters in 2025", desc: "A deep dive into regulatory compliance and document security best practices.", cat: "Security" },
                    { date: "Dec 05, 2024", title: "Scaling Document Workflows with Convertly", desc: "How Enterprise teams are saving 40+ hours a month using our API platform.", cat: "Case Study" }
                ].map((post, i) => (
                    <div key={i} className="flex flex-col md:flex-row gap-10 items-center bg-white dark:bg-slate-900 p-10 rounded-[48px] shadow-xl border border-slate-100 dark:border-slate-800 group hover:border-brand-500 transition-all">
                        <div className="w-full md:w-64 h-64 shrink-0 bg-slate-100 dark:bg-slate-800 rounded-[32px] flex items-center justify-center relative overflow-hidden">
                            <Sparkles className="h-16 w-16 text-slate-300 group-hover:text-brand-500 transition-all group-hover:scale-110" />
                        </div>
                        <div>
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 px-3 py-1 bg-brand-50 dark:bg-brand-900/30 rounded-lg">{post.cat}</span>
                                <span className="text-slate-400 text-xs font-bold">{post.date}</span>
                            </div>
                            <h3 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter leading-tight">{post.title}</h3>
                            <p className="text-lg text-slate-500 font-medium mb-8 leading-relaxed max-w-xl">{post.desc}</p>
                            <button className="flex items-center gap-2 font-black text-brand-600 hover:gap-4 transition-all">Read Story <ChevronRight className="h-5 w-5" /></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const RoadmapPage: React.FC<PageProps> = ({ setView }) => (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617]">
        <Header title="Next Horizon" icon={Map} setView={setView} />
        <div className="max-w-5xl mx-auto px-6 py-32 relative">
            <div className="absolute left-[39px] md:left-1/2 top-32 bottom-20 w-1 bg-slate-200 dark:bg-slate-800 -translate-x-1/2"></div>

            <div className="space-y-32">
                {[
                    { quarter: "Q1 2025", title: "Visual Flow Builder", status: "In Progress", side: "left", icon: Rocket },
                    { quarter: "Q2 2025", title: "Enterprise White Label", status: "Planned", side: "right", icon: Globe },
                    { quarter: "Q4 2025", title: "On-Premise Deployment", status: "Concept", side: "left", icon: Database }
                ].map((item, i) => (
                    <div key={i} className={`relative flex items-center justify-between ${item.side === 'right' ? 'flex-row-reverse' : ''}`}>
                        <div className="hidden md:block w-5/12"></div>
                        <div className="absolute left-[14px] md:left-1/2 w-8 h-8 bg-brand-600 rounded-full -translate-x-1/2 flex items-center justify-center shadow-xl shadow-brand-500/20 z-10">
                            <div className="w-3 h-3 bg-white rounded-full"></div>
                        </div>
                        <div className={`w-full md:w-5/12 pl-16 md:pl-0 ${item.side === 'right' ? 'md:pr-10 text-right' : 'md:pl-10 text-left'}`}>
                            <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 hover:-translate-y-2 transition-all">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">{item.quarter}</span>
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter leading-tight">{item.title}</h3>
                                <div className={`inline-flex items-center gap-2 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[9px] font-black uppercase tracking-widest ${item.status === 'In Progress' ? 'text-brand-600 mb-4' : 'text-slate-500'}`}>
                                    <item.icon className="h-3 w-3" /> {item.status}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

export const LegalPage: React.FC<PageProps & { type: 'privacy' | 'terms' }> = ({ setView, type }) => (
    <div className="min-h-screen bg-white dark:bg-[#020617] text-slate-900 dark:text-slate-100 pb-32">
        <Header title={type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'} icon={Shield} setView={setView} />
        <div className="max-w-3xl mx-auto px-6 py-20">
            <div className="prose prose-slate dark:prose-invert max-w-none prose-h2:text-3xl prose-h2:font-black prose-h2:tracking-tight prose-p:text-lg prose-p:leading-relaxed prose-li:text-lg">
                <p className="text-xl font-medium text-slate-500 mb-12 italic">Last modified: December 20, 2024</p>

                <h2>1. Introduction</h2>
                <p>Welcome to Convertly AI. By using our platform, you agree to these legal terms. We've written them to be as simple as possible, but if you have questions, please reach out to our legal team.</p>

                <h2>2. Data Privacy & AI</h2>
                <p>Convertly operates with a "Privacy First" philosophy. All generic PDF processing (merging, splitting, conversion) occurs entirely within your browser's local environment. Your source files are never uploaded to our servers unless you explicitly use our cloud-based AI storage or sharing features.</p>
                <ul>
                    <li>AI processing uses isolated Gemini 3 instances.</li>
                    <li>No document data is used for model training.</li>
                    <li>End-to-end encryption is standard for all transfers.</li>
                </ul>

                <h2>3. Usage Limits</h2>
                <p>Free users are entitled to 50 operations per day. Professional tiers grant unlimited operations with higher concurrency limits. API usage is governed by your specific project quota.</p>

                <h2>4. Intellectual Property</h2>
                <p>You maintain full ownership of all documents processed through Convertly. We claim no rights to your content.</p>

                <div className="mt-20 p-10 bg-slate-50 dark:bg-slate-900 rounded-[32px] border border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-black mb-4">Questions?</h3>
                    <p className="text-sm font-medium mb-6">Our legal documentation is subject to periodic updates. For any clarifications, please contact us.</p>
                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-xs hover:scale-105 transition-all">
                        <Mail className="h-4 w-4" /> legal@convertly.ai
                    </button>
                </div>
            </div>
        </div>
    </div>
);
