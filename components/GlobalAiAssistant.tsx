
import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Sparkles, Command, Mic, ChevronRight, Zap } from 'lucide-react';
import { AppView } from '../types';
import { generateDocumentContent } from '../services/openrouter';

interface Props {
    currentView: AppView;
    setView: (view: AppView) => void;
}

export const GlobalAiAssistant: React.FC<Props> = ({ currentView, setView }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
        { role: 'ai', text: "Hello. I am Convertly, your professional OmniPDF assistant. How may I assist you with your documents today?" }
    ]);
    const [isThinking, setIsThinking] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Command Mapping
    const viewKeywords: Record<string, AppView> = {
        'merge': AppView.MERGE_PDF,
        'combine': AppView.MERGE_PDF,
        'join': AppView.MERGE_PDF,
        'split': AppView.SPLIT_PDF,
        'separate': AppView.SPLIT_PDF,
        'compress': AppView.COMPRESS_PDF,
        'shrink': AppView.COMPRESS_PDF,
        'reduce': AppView.COMPRESS_PDF,
        'edit': AppView.EDIT_PDF,
        'modify': AppView.EDIT_PDF,
        'word to pdf': AppView.WORD_TO_PDF,
        'pdf to word': AppView.PDF_TO_WORD,
        'jpg to pdf': AppView.IMAGE_TO_PDF,
        'image to pdf': AppView.IMAGE_TO_PDF,
        'png to pdf': AppView.IMAGE_TO_PDF,
        'sign': AppView.SIGN_PDF,
        'signature': AppView.SIGN_PDF,
        'ocr': AppView.OCR_PDF,
        'text recognition': AppView.OCR_PDF,
        'protect': AppView.PROTECT_PDF,
        'lock': AppView.PROTECT_PDF,
        'password': AppView.PROTECT_PDF,
        'unlock': AppView.UNLOCK_PDF,
        'decrypt': AppView.UNLOCK_PDF,
        'watermark': AppView.WATERMARK_PDF,
        'excel to pdf': AppView.EXCEL_TO_PDF,
        'pdf to excel': AppView.PDF_TO_EXCEL,
        'ppt to pdf': AppView.POWERPOINT_TO_PDF,
        'pdf to ppt': AppView.PDF_TO_POWERPOINT,
        'powerpoint': AppView.POWERPOINT_TO_PDF,
        'html to pdf': AppView.HTML_TO_PDF,
        'pdf to html': AppView.PDF_TO_HTML,
        'organize': AppView.ORGANIZE_PDF,
        'reorder': AppView.ORGANIZE_PDF,
        'chat': AppView.AI_CHAT,
        'talk': AppView.AI_CHAT,
        'ask': AppView.AI_CHAT,
        'qr': AppView.QR_GENERATOR,
        'barcode': AppView.QR_GENERATOR,
        'rotate': AppView.ROTATE_PDF,
        'turn': AppView.ROTATE_PDF,
        'number': AppView.NUMBER_PDF,
        'page numbers': AppView.NUMBER_PDF,
        'extract': AppView.EXTRACT_PAGES,
        'remove': AppView.REMOVE_PAGES,
        'delete pages': AppView.REMOVE_PAGES,
        'scan': AppView.SCAN_TO_PDF,
        'camera': AppView.SCAN_TO_PDF,
        'pdf to jpg': AppView.PDF_TO_JPG,
        'pdf to image': AppView.PDF_TO_JPG,
        'pdf to png': AppView.PDF_TO_PNG,
        'pdf to tiff': AppView.PDF_TO_TIFF,
        'pdf to bmp': AppView.PDF_TO_BMP,
        'pdf to json': AppView.PDF_TO_JSON,
        'pdf to xml': AppView.PDF_TO_XML,
        'pdf to csv': AppView.PDF_TO_CSV,
        'pdf to text': AppView.PDF_TO_TEXT,
        'pdf to txt': AppView.PDF_TO_TEXT,
        'pdf to rtf': AppView.PDF_TO_RTF,
        'pdf to epub': AppView.PDF_TO_EPUB,
        'pdf to markdown': AppView.PDF_TO_MD,
        'pdf to md': AppView.PDF_TO_MD,
        'pdf to webp': AppView.PDF_TO_WEBP,
        'txt to pdf': AppView.TXT_TO_PDF,
        'rtf to pdf': AppView.RTF_TO_PDF,
        'epub to pdf': AppView.EPUB_TO_PDF,
        'markdown to pdf': AppView.MD_TO_PDF,
        'md to pdf': AppView.MD_TO_PDF,
        'webp to pdf': AppView.WEBP_TO_PDF,
        'csv to pdf': AppView.CSV_TO_PDF,
        'xml to pdf': AppView.XML_TO_PDF,
        'json to pdf': AppView.JSON_TO_PDF,
        'sql to pdf': AppView.SQL_TO_PDF,
        'log to pdf': AppView.LOG_TO_PDF,
        'heic to pdf': AppView.HEIC_TO_PDF,
        'odt to pdf': AppView.ODT_TO_PDF,
        'ods to pdf': AppView.ODS_TO_PDF,
        'odp to pdf': AppView.ODP_TO_PDF,
        'tsv to pdf': AppView.TSV_TO_PDF,
        'pdf to odt': AppView.PDF_TO_ODT,
        'pdf to tsv': AppView.PDF_TO_TSV,
        'generator': AppView.AI_GENERATOR,
        'create pdf': AppView.AI_GENERATOR,
        'make pdf': AppView.AI_GENERATOR,
        'writer': AppView.AI_GENERATOR,
        
        // Batch 3 New Keywords
        'jfif': AppView.JFIF_TO_PDF,
        'ico': AppView.ICO_TO_PDF,
        'raw': AppView.RAW_TO_PDF,
        'xps': AppView.XPS_TO_PDF,
        'zip': AppView.PDF_TO_JPG_ZIP,
        'archive': AppView.PDF_TO_JPG_ZIP,
        'jfif to pdf': AppView.JFIF_TO_PDF,
        'ico to pdf': AppView.ICO_TO_PDF,
        'raw to pdf': AppView.RAW_TO_PDF,
        'xps to pdf': AppView.XPS_TO_PDF,
        'pdf to jfif': AppView.PDF_TO_JFIF,
        'pdf to ico': AppView.PDF_TO_ICO,
        'pdf to raw': AppView.PDF_TO_RAW,
        'pdf to xps': AppView.PDF_TO_XPS,
        'pdf to zip': AppView.PDF_TO_JPG_ZIP,
        'pdf to jpg zip': AppView.PDF_TO_JPG_ZIP,
        'pdf to png zip': AppView.PDF_TO_PNG_ZIP
    };

    const handleSend = async () => {
        if (!input.trim()) return;

        const userText = input;
        setMessages(prev => [...prev, { role: 'user', text: userText }]);
        setInput('');
        setIsThinking(true);

        try {
            // 0. Explicit Help/Greeting Handler
            const lower = userText.toLowerCase().trim();
            if (['help', 'hi', 'hello', 'hey', 'start'].includes(lower)) {
                 const response = "I am here to help. You can ask me to convert files (e.g., 'PDF to Word'), edit documents (e.g., 'Remove text'), or organize pages. What do you need?";
                 setMessages(prev => [...prev, { role: 'ai', text: response }]);
                 setIsThinking(false);
                 return;
            }

            // 1. Direct Pattern Matching (Fast)
            let targetView: AppView | null = null;

            // Sort keys by length (descending) to match specific phrases first ("pdf to word" before "pdf")
            const sortedKeys = Object.keys(viewKeywords).sort((a, b) => b.length - a.length);

            for (const key of sortedKeys) {
                // Use word boundary check for short keys to avoid partial matches (e.g. "he" in "help")
                // For longer keys, includes is fine.
                if (key.length < 4) {
                     const regex = new RegExp(`\\b${key}\\b`, 'i');
                     if (regex.test(lower)) {
                         targetView = viewKeywords[key];
                         break;
                     }
                } else {
                    if (lower.includes(key)) {
                        targetView = viewKeywords[key];
                        break;
                    }
                }
            }

            if (targetView) {
                // If we found a direct navigation command
                const response = `Certainly. Opening the ${userText.includes('edit') ? 'PDF Editor' : 'requested tool'} for you.`;
                setMessages(prev => [...prev, { role: 'ai', text: response }]);
                
                setTimeout(() => {
                    setView(targetView!);
                    // If it's edit, prompt specifically
                    if (targetView === AppView.EDIT_PDF && (lower.includes("change") || lower.includes("remove") || lower.includes("delete"))) {
                        // Dispatch specialized event for EditPdf to catch if it's already mounted or about to be
                        setTimeout(() => {
                            const event = new CustomEvent('ai-edit-command', { detail: { prompt: userText } });
                            window.dispatchEvent(event);
                        }, 1000);
                    }
                }, 1000);
                setIsThinking(false);
                return;
            }

            // 2. Editing Command (If already in Editor)
            if (currentView === AppView.EDIT_PDF) {
                // Dispatch generic event
                const event = new CustomEvent('ai-edit-command', { detail: { prompt: userText } });
                window.dispatchEvent(event);
                const response = "I have processed your editing instruction. Please verify the changes on the canvas.";
                setMessages(prev => [...prev, { role: 'ai', text: response }]);
                setIsThinking(false);
                return;
            }

            // 3. Fallback to LLM for complex intent
            const prompt = `You are Convertly, the premier AI assistant for the OmniPDF Professional Suite.
      User Input: "${userText}"
      Current Context: ${currentView}
      Capabilities: ${Object.keys(viewKeywords).join(', ')}
      
      Directives:
      1. NAVIGATION: If the user intends to open a specific tool, return exactly "NAVIGATE:TOOL_NAME" (e.g., "NAVIGATE:merge").
      2. INQUIRY: If the user asks about capabilities or needs guidance, provide a polished, executive-level response.
      3. EDITING: If the user requests document modification while in the Editor, confirm the action with professional brevity.
      
      Tone: Executive, precise, and helpful. You are a high-end SaaS concierge. Never use slang.`;

            const response = await generateDocumentContent(prompt, "text");

            if (response.includes("NAVIGATE:")) {
                const key = response.split(":")[1].trim().toLowerCase();
                // Try to find the closest match in keys
                const matchKey = Object.keys(viewKeywords).find(k => key.includes(k) || k.includes(key));
                
                if (matchKey) {
                    const view = viewKeywords[matchKey];
                    const msg = `Navigating to ${matchKey} interface immediately.`;
                    setMessages(prev => [...prev, { role: 'ai', text: msg }]);
                    setTimeout(() => setView(view), 1000);
                } else {
                    const msg = "I apologize, but I could not locate that specific tool. Could you please rephrase your request?";
                    setMessages(prev => [...prev, { role: 'ai', text: msg }]);
                }
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: response }]);
            }

        } catch (e) {
            const msg = "I am currently unable to process your request. Please check your connection and try again.";
            setMessages(prev => [...prev, { role: 'ai', text: msg }]);
        } finally {
            setIsThinking(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform active:scale-95 group border border-slate-700/50"
            >
                <div className="absolute inset-0 bg-purple-500 rounded-full blur opacity-20 group-hover:opacity-40 animate-pulse"></div>
                <Sparkles className="h-6 w-6 relative z-10" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-[350px] md:w-[400px] h-[500px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800 animate-in slide-in-from-bottom-10 fade-in duration-300">
            {/* Header */}
            <div className="bg-slate-900 p-4 flex items-center justify-between relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-blue-900/50"></div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg border border-white/10">
                        <Bot className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white text-sm">Convertly AI</h3>
                            <span className="px-1.5 py-0.5 bg-amber-400 text-slate-900 text-[9px] font-black rounded uppercase tracking-widest">PRO</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.5)]"></span>
                            <span className="text-[10px] text-slate-300 font-medium">System Online</span>
                        </div>
                    </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors relative z-10 hover:bg-white/10 p-1 rounded-lg">
                    <X className="h-5 w-5" />
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-grow bg-slate-50 dark:bg-slate-950 p-4 overflow-y-auto space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-2xl text-sm font-medium ${msg.role === 'user'
                                ? 'bg-purple-600 text-white rounded-br-none'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 shadow-sm border border-slate-100 dark:border-slate-700 rounded-bl-none'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isThinking && (
                    <div className="flex justify-start">
                        <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 dark:border-slate-700 flex gap-1">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">

                {/* Context Suggestion Chips */}
                {currentView === AppView.HOME ? (
                    <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
                        <button onClick={() => { setInput("Merge PDF files"); handleSend(); }} className="whitespace-nowrap px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 text-xs font-bold rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors">Merge PDF</button>
                        <button onClick={() => { setInput("Convert Word to PDF"); handleSend(); }} className="whitespace-nowrap px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-xs font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">Word to PDF</button>
                    </div>
                ) : null}

                {currentView === AppView.EDIT_PDF ? (
                    <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar pb-1">
                        <button onClick={() => { setInput("Change all text to blue"); handleSend(); }} className="whitespace-nowrap px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 text-xs font-bold rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors">Change text color</button>
                        <button onClick={() => { setInput("Remove image images"); handleSend(); }} className="whitespace-nowrap px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 text-xs font-bold rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors">Remove images</button>
                    </div>
                ) : null}

                <div className="relative">
                    <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask AI to edit, convert, or organizing..."
                        className="w-full pl-4 pr-12 py-3 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-purple-500 outline-none transition-all"
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || isThinking}
                        className="absolute right-2 top-2 p-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 active:scale-95 disabled:opacity-50 transition-all"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
                <p className="text-[10px] text-center mt-2 text-slate-400">Powered by OmniPDF Omni-Brain Model</p>
            </div>
        </div>
    );
};
