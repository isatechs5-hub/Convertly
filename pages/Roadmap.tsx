import React from 'react';
import { ArrowLeft, CheckCircle, Code, Layers, Server } from 'lucide-react';
import { AppView } from '../types';

interface Props {
  setView: (view: AppView) => void;
}

export const Roadmap: React.FC<Props> = ({ setView }) => {
  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-white border-b border-slate-200 py-6 px-4 mb-8 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button onClick={() => setView(AppView.HOME)} className="flex items-center text-slate-500 hover:text-brand-600 font-medium transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" /> Back to Tools
            </button>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Layers className="h-5 w-5 text-brand-600" />
                SaaS Roadmap
            </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-6">How to Build a PDF SaaS</h2>
            <p className="text-lg text-slate-600 mb-8">
                Building a "I Love PDF" clone is a great way to start a SaaS. Here is the technical roadmap and step-by-step guide to building the application you are using right now.
            </p>

            <div className="space-y-8">
                {/* Step 1 */}
                <div className="flex gap-4">
                    <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">1</div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Code className="h-5 w-5 text-slate-400" />
                            Frontend Foundation
                        </h3>
                        <p className="text-slate-600 mt-2">
                            Start with <strong>React</strong> and <strong>TypeScript</strong>. Use <strong>Tailwind CSS</strong> for rapid UI development.
                            The key is a clean, responsive layout. This app uses a simple state-based router for simplicity, but for production, use Next.js for SEO.
                        </p>
                    </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                     <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">2</div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Server className="h-5 w-5 text-slate-400" />
                            Core PDF Logic (Client-Side)
                        </h3>
                        <p className="text-slate-600 mt-2">
                            Avoid expensive backend servers by processing files in the browser. 
                            Use libraries like <code>jspdf</code> for creating PDFs from scratch (like our AI tool) and <code>pdf-lib</code> for manipulating existing PDFs (Merging/Splitting).
                        </p>
                        <div className="bg-slate-900 text-slate-300 p-4 rounded-lg mt-3 font-mono text-sm overflow-x-auto">
                            npm install jspdf pdf-lib
                        </div>
                    </div>
                </div>

                 {/* Step 3 */}
                <div className="flex gap-4">
                     <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold">3</div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-slate-400" />
                            AI Integration
                        </h3>
                        <p className="text-slate-600 mt-2">
                            Differentiate your SaaS. We integrated <strong>Google Gemini API</strong> to generate content. 
                            The flow: User Topic &rarr; Gemini API (Text Generation) &rarr; jsPDF (Text to PDF).
                        </p>
                    </div>
                </div>

                 {/* Step 4 */}
                <div className="flex gap-4">
                     <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">4</div>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Layers className="h-5 w-5 text-slate-400" />
                            Monetization & Production
                        </h3>
                        <p className="text-slate-600 mt-2">
                           To go "Production Ready":
                           <ul className="list-disc pl-5 mt-2 space-y-1">
                               <li>Switch to Next.js or Remix for SSR.</li>
                               <li>Integrate Stripe for "Pro" limits (e.g., >5 files merge).</li>
                               <li>Add Authentication (Clerk or Firebase).</li>
                               <li>Deploy on Vercel or Cloudflare Pages.</li>
                           </ul>
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
