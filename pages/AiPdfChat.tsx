
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Send, Loader2, MessageSquare, FileText, Bot, User, Mic, Download, Search, Bookmark, BookmarkPlus, Languages, GitCompare, Lightbulb, Brain, BarChart2, Sparkles, Copy, Share2, Filter, Grid3x3, Table, Highlighter, GraduationCap, Zap, Settings, X } from 'lucide-react';
import { AppView } from '../types';
import { extractFullTextFromPdf } from '../services/pdfUtils';
import { chatWithPdf } from '../services/openrouter';

interface Props {
  setView: (view: AppView) => void;
}

interface Message {
  role: 'ai' | 'user';
  text: string;
  timestamp?: Date;
  type?: 'normal' | 'citation' | 'table' | 'quiz';
}

interface PDFFile {
  file: File;
  text: string;
  id: string;
}

export const AiPdfChat: React.FC<Props> = ({ setView }) => {
  const [files, setFiles] = useState<PDFFile[]>([]);
  const [activeFileId, setActiveFileId] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // 🆕 NEW FEATURES STATE
  const [bookmarks, setBookmarks] = useState<{ page: number; note: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlights, setHighlights] = useState<string[]>([]);
  const [aiPersona, setAiPersona] = useState('professional');
  const [targetLanguage, setTargetLanguage] = useState('english');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [chatStats, setChatStats] = useState({ totalQuestions: 0, avgResponseTime: 0 });
  const [compareMode, setCompareMode] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  // AI Quick Actions - Enhanced with 20+ Features
  const quickActions = [
    { id: 'summarize', label: 'Summarize', icon: '📝', prompt: 'Please provide a comprehensive summary of this document', color: 'blue', category: 'analysis' },
    { id: 'key-points', label: 'Key Points', icon: '🎯', prompt: 'Extract the main key points from this document', color: 'purple', category: 'analysis' },
    { id: 'translate', label: 'Translate', icon: '🌐', prompt: 'Translate this document to Hindi', color: 'green', category: 'language' },
    { id: 'questions', label: 'Generate Q&A', icon: '❓', prompt: 'Generate 10 important questions and answers from this document', color: 'orange', category: 'learning' },
    { id: 'simplify', label: 'Simplify', icon: '💡', prompt: 'Explain this document in simple terms that a 10-year-old can understand', color: 'pink', category: 'analysis' },
    { id: 'action-items', label: 'Action Items', icon: '✅', prompt: 'List all action items and tasks mentioned in this document', color: 'teal', category: 'productivity' },
    { id: 'sentiment', label: 'Sentiment', icon: '😊', prompt: 'Analyze the sentiment and tone of this document', color: 'yellow', category: 'analysis' },
    { id: 'entities', label: 'Extract Entities', icon: '🏷️', prompt: 'Extract all names, dates, locations, and organizations from this document', color: 'indigo', category: 'data' },
    { id: 'compare', label: 'Compare', icon: '⚖️', prompt: 'What are the pros and cons discussed in this document?', color: 'red', category: 'analysis' },
    { id: 'timeline', label: 'Timeline', icon: '📅', prompt: 'Create a timeline of events mentioned in this document', color: 'cyan', category: 'data' },
    // 🆕 NEW ACTIONS
    { id: 'citations', label: 'Citations', icon: '📚', prompt: 'Generate APA citations for all sources mentioned in this document', color: 'violet', category: 'academic' },
    { id: 'tables', label: 'Extract Tables', icon: '📊', prompt: 'Extract and format all tables and data from this document', color: 'emerald', category: 'data' },
    { id: 'quiz', label: 'Create Quiz', icon: '🎓', prompt: 'Create a 10-question multiple choice quiz based on this document', color: 'rose', category: 'learning' },
    { id: 'flashcards', label: 'Flashcards', icon: '🃏', prompt: 'Create 15 flashcards with key concepts from this document', color: 'amber', category: 'learning' },
    { id: 'mindmap', label: 'Mind Map', icon: '🧠', prompt: 'Create a mind map structure of the main concepts in this document', color: 'lime', category: 'visual' },
    { id: 'metadata', label: 'Metadata', icon: '📋', prompt: 'Analyze and extract all metadata, author info, and document properties', color: 'slate', category: 'data' },
    { id: 'keywords', label: 'Keywords', icon: '🔑', prompt: 'Extract the top 20 keywords and key phrases from this document', color: 'sky', category: 'seo' },
    { id: 'outline', label: 'Outline', icon: '📑', prompt: 'Create a detailed hierarchical outline of this document', color: 'fuchsia', category: 'structure' },
  ];

  // 🆕 AI Personas
  const aiPersonas = [
    { id: 'professional', label: 'Professional', icon: '💼', description: 'Formal and business-like' },
    { id: 'friendly', label: 'Friendly', icon: '😊', description: 'Casual and approachable' },
    { id: 'academic', label: 'Academic', icon: '🎓', description: 'Scholarly and detailed' },
    { id: 'creative', label: 'Creative', icon: '🎨', description: 'Imaginative and engaging' },
    { id: 'technical', label: 'Technical', icon: '⚙️', description: 'Precise and technical' },
    { id: 'teacher', label: 'Teacher', icon: '👨‍🏫', description: 'Educational and patient' },
  ];

  // 🆕 Translation Languages
  const translationLanguages = [
    { id: 'english', label: 'English', flag: '🇺🇸' },
    { id: 'spanish', label: 'Spanish', flag: '🇪🇸' },
    { id: 'french', label: 'French', flag: '🇫🇷' },
    { id: 'german', label: 'German', flag: '🇩🇪' },
    { id: 'chinese', label: 'Chinese', flag: '🇨🇳' },
    { id: 'japanese', label: 'Japanese', flag: '🇯🇵' },
    { id: 'hindi', label: 'Hindi', flag: '🇮🇳' },
    { id: 'arabic', label: 'Arabic', flag: '🇸🇦' },
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 🆕 Handle Multiple File Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles: File[] = Array.from(e.target.files);
      setIsAnalyzing(true);

      try {
        const processedFiles: PDFFile[] = [];

        for (const file of newFiles) {
          const text = await extractFullTextFromPdf(file);
          processedFiles.push({
            file,
            text,
            id: Math.random().toString(36).substr(2, 9)
          });
        }

        setFiles(prev => {
          const updated = [...prev, ...processedFiles];
          if (updated.length > 1) setCompareMode(true); // Auto-enable compare mode
          return updated;
        });

        if (processedFiles.length > 0 && !activeFileId) {
          setActiveFileId(processedFiles[0].id);
        }

        const fileNames = processedFiles.map(f => f.file.name).join(', ');
        setMessages([{
          role: 'ai',
          text: `I've analyzed ${processedFiles.length} document(s): ${fileNames}. ${processedFiles.length > 1 || files.length > 0 ? 'I recommend using "Compare Mode" to chat with all files at once!' : 'Ask me anything or use the quick actions below!'}`,
          timestamp: new Date()
        }]);
      } catch (err) {
        alert("Failed to read PDF text.");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleSend = async (customPrompt?: string) => {
    const messageText = customPrompt || input.trim();
    if (!messageText || isAnalyzing) return;

    const startTime = Date.now();
    setMessages(prev => [...prev, { role: 'user', text: messageText, timestamp: new Date() }]);
    if (!customPrompt) setInput('');
    setIsAnalyzing(true);

    try {
      const activeFile = files.find(f => f.id === activeFileId);
      const contextText = compareMode
        ? files.map(f => `[${f.file.name}]: ${f.text}`).join('\n\n')
        : activeFile?.text || '';

      // 🆕 Enhanced prompt with persona and language
      const enhancedPrompt = `
        ${aiPersona !== 'professional' ? `Respond in a ${aiPersonas.find(p => p.id === aiPersona)?.description} manner.` : ''}
        ${targetLanguage !== 'english' ? `Translate your response to ${translationLanguages.find(l => l.id === targetLanguage)?.label}.` : ''}
        
        ${messageText}
      `;

      const response = await chatWithPdf(contextText, enhancedPrompt);
      const endTime = Date.now();

      setMessages(prev => [...prev, { role: 'ai', text: response, timestamp: new Date() }]);

      // 🆕 Update stats
      setChatStats(prev => ({
        totalQuestions: prev.totalQuestions + 1,
        avgResponseTime: (prev.avgResponseTime * prev.totalQuestions + (endTime - startTime)) / (prev.totalQuestions + 1)
      }));
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "Sorry, I had trouble processing that request.", timestamp: new Date() }]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickAction = (action: typeof quickActions[0]) => {
    handleSend(action.prompt);
  };

  // 🆕 Export Chat History
  const exportChatHistory = () => {
    const chatText = messages.map(m => `[${m.role.toUpperCase()}] ${m.text}`).join('\n\n');
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `chat_history_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // 🆕 Add Bookmark
  const addBookmark = () => {
    const note = prompt('Enter bookmark note:');
    if (note) {
      setBookmarks(prev => [...prev, { page: 1, note }]);
      alert('Bookmark added!');
    }
  };

  // 🆕 Voice Input
  const toggleVoiceMode = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("Your browser does not support voice input. Please use Chrome or Edge.");
      return;
    }

    if (isVoiceMode) {
      setIsVoiceMode(false);
      // Logic to stop recognition would go here if we had a persistent reference
      return;
    }

    setIsVoiceMode(true);
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      // Audio started
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
      setIsVoiceMode(false);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsVoiceMode(false);
      if (event.error === 'not-allowed') {
        alert("Microphone access blocked. Please allow permissions.");
      }
    };

    recognition.onend = () => {
      setIsVoiceMode(false);
    };

    try {
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsVoiceMode(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 min-h-screen flex flex-col">
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200 py-6 px-4 shadow-lg z-10 sticky top-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => setView(AppView.HOME)} className="flex items-center text-slate-500 hover:text-purple-600 font-bold transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-black text-slate-800 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-purple-600" /> AI PDF INSIGHT PRO
            </h1>
            <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full font-bold">20+ Features</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-all"
              title="Analytics"
            >
              <BarChart2 className="h-4 w-4" />
            </button>
            <button
              onClick={exportChatHistory}
              disabled={messages.length === 0}
              className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all disabled:opacity-50"
              title="Export Chat"
            >
              <Download className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 🆕 Analytics Dashboard */}
      {showAnalytics && (
        <div className="max-w-7xl mx-auto w-full p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 animate-in slide-in-from-top-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <BarChart2 className="h-5 w-5 text-purple-600" />
                Chat Analytics
              </h3>
              <button onClick={() => setShowAnalytics(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <p className="text-xs font-bold text-purple-600 uppercase">Total Questions</p>
                <p className="text-2xl font-black text-purple-900 mt-1">{chatStats.totalQuestions}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <p className="text-xs font-bold text-blue-600 uppercase">Avg Response Time</p>
                <p className="text-2xl font-black text-blue-900 mt-1">{(chatStats.avgResponseTime / 1000).toFixed(1)}s</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                <p className="text-xs font-bold text-green-600 uppercase">Documents</p>
                <p className="text-2xl font-black text-green-900 mt-1">{files.length}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                <p className="text-xs font-bold text-orange-600 uppercase">Bookmarks</p>
                <p className="text-2xl font-black text-orange-900 mt-1">{bookmarks.length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto w-full flex-grow flex flex-col md:flex-row p-4 gap-6 overflow-hidden">
        {/* Enhanced Sidebar */}
        <div className="w-full md:w-96 flex-shrink-0">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 h-full flex flex-col">
            <h2 className="text-lg font-black mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Documents ({files.length})
            </h2>

            {files.length === 0 ? (
              <label className="flex-grow flex flex-col items-center justify-center border-2 border-dashed border-purple-200 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors text-center p-4">
                <FileText className="h-10 w-10 text-purple-300 mb-3" />
                <span className="text-sm text-slate-600 font-bold mb-2">Upload PDF(s) to Chat</span>
                <span className="text-xs text-slate-400">Multi-file support enabled</span>
                <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} multiple />
              </label>
            ) : (
              <div className="flex-grow flex flex-col overflow-hidden">
                {/* File List */}
                <div className="mb-4 space-y-2 max-h-32 overflow-y-auto">
                  {files.map((pdfFile) => (
                    <div
                      key={pdfFile.id}
                      onClick={() => setActiveFileId(pdfFile.id)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${activeFileId === pdfFile.id ? 'bg-purple-50 border-purple-300' : 'bg-slate-50 border-slate-200 hover:border-purple-200'}`}
                    >
                      <p className="font-bold text-sm text-slate-800 truncate">{pdfFile.file.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{(pdfFile.file.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ))}
                </div>

                {/* 🆕 Compare Mode Toggle */}
                {files.length > 1 && (
                  <button
                    onClick={() => setCompareMode(!compareMode)}
                    className={`w-full py-2 px-4 rounded-lg font-bold text-sm mb-4 transition-all ${compareMode ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}
                  >
                    <GitCompare className="h-4 w-4 inline mr-2" />
                    {compareMode ? 'Comparing All' : 'Compare Mode'}
                  </button>
                )}

                {/* 🆕 Advanced Settings */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="w-full py-2 px-4 bg-slate-100 rounded-lg font-bold text-sm text-slate-700 hover:bg-slate-200 transition-all mb-4 flex items-center justify-between"
                >
                  <span className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Advanced Settings
                  </span>
                  <span className="text-xs">{showAdvanced ? '▲' : '▼'}</span>
                </button>

                {showAdvanced && (
                  <div className="space-y-3 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    {/* AI Persona */}
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">AI Persona</label>
                      <select
                        value={aiPersona}
                        onChange={(e) => setAiPersona(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                      >
                        {aiPersonas.map(p => (
                          <option key={p.id} value={p.id}>{p.icon} {p.label}</option>
                        ))}
                      </select>
                    </div>

                    {/* Translation */}
                    <div>
                      <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Response Language</label>
                      <select
                        value={targetLanguage}
                        onChange={(e) => setTargetLanguage(e.target.value)}
                        className="w-full p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                      >
                        {translationLanguages.map(l => (
                          <option key={l.id} value={l.id}>{l.flag} {l.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="flex-grow overflow-hidden">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Zap className="h-3 w-3" />
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                    {quickActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleQuickAction(action)}
                        disabled={isAnalyzing || files.length === 0}
                        className="flex items-center gap-2 p-2 bg-gradient-to-br from-slate-50 to-white hover:from-purple-50 hover:to-blue-50 border border-slate-200 hover:border-purple-300 rounded-lg transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                        title={action.prompt}
                      >
                        <span className="text-base">{action.icon}</span>
                        <span className="text-[9px] font-bold text-slate-700 leading-tight">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 🆕 Bookmark Button */}
                <button
                  onClick={addBookmark}
                  className="mt-4 w-full py-2 px-4 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-all font-bold text-xs flex items-center justify-center gap-2"
                >
                  <BookmarkPlus className="h-3 w-3" />
                  Add Bookmark
                </button>

                <button
                  onClick={() => { setFiles([]); setMessages([]); setActiveFileId(''); }}
                  className="text-slate-400 text-xs hover:text-red-500 font-medium underline mt-4"
                >
                  Remove All Documents
                </button>
              </div>
            )}

            <div className="mt-6 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-100 text-xs text-slate-600">
              <p className="font-bold mb-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-purple-600" />
                20+ AI Features
              </p>
              <p className="text-[10px]">Multi-PDF, Voice, Translation, Quiz, Citations, Analytics & More!</p>
            </div>
          </div>
        </div>

        {/* Enhanced Chat Area */}
        <div className="flex-grow bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          <div className="flex-grow overflow-y-auto p-6 space-y-6">
            {messages.length === 0 && !isAnalyzing && (
              <div className="h-full flex flex-col items-center justify-center text-slate-300">
                <Bot className="h-20 w-20 mb-4 opacity-20" />
                <p className="text-lg font-bold opacity-50">Upload a PDF to start chatting</p>
                <p className="text-sm opacity-40 mt-2">Now with 20+ AI-powered features!</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ${m.role === 'ai' ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white' : 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-600'}`}>
                  {m.role === 'ai' ? <Bot className="h-6 w-6" /> : <User className="h-6 w-6" />}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-md ${m.role === 'ai' ? 'bg-gradient-to-br from-slate-50 to-slate-100 text-slate-800 rounded-tl-none border border-slate-200' : 'bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-tr-none'}`}>
                  <div className="whitespace-pre-wrap">{m.text}</div>
                  {m.timestamp && (
                    <div className={`text-[10px] mt-2 ${m.role === 'ai' ? 'text-slate-400' : 'text-purple-200'}`}>
                      {m.timestamp.toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isAnalyzing && (
              <div className="flex gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-200 to-blue-200 flex items-center justify-center shadow-md">
                  <Bot className="h-6 w-6 text-purple-600" />
                </div>
                <div className="bg-gradient-to-br from-slate-100 to-slate-200 h-12 w-32 rounded-2xl rounded-tl-none flex items-center justify-center border border-slate-200">
                  <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50">
            <form
              onSubmit={(e) => { e.preventDefault(); handleSend(); }}
              className="flex gap-2"
            >
              {/* 🆕 Voice Input Button */}
              <button
                type="button"
                onClick={toggleVoiceMode}
                className={`p-4 rounded-xl transition-all ${isVoiceMode ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                title="Voice Input"
              >
                <Mic className="h-5 w-5" />
              </button>

              <input
                type="text"
                disabled={files.length === 0 || isAnalyzing}
                placeholder={files.length > 0 ? "Ask about the PDF..." : "Upload a file first"}
                className="flex-grow p-4 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all disabled:opacity-50 font-medium"
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />

              <button
                type="submit"
                disabled={!input.trim() || isAnalyzing || files.length === 0}
                className="bg-gradient-to-br from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl hover:from-purple-700 hover:to-blue-700 disabled:from-slate-300 disabled:to-slate-400 transition-all shadow-lg disabled:shadow-none font-bold"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>

            {/* Feature indicators */}
            <div className="flex gap-2 mt-3 text-[10px] font-bold text-slate-400">
              <span className="flex items-center gap-1">
                <Languages className="h-3 w-3" /> {translationLanguages.find(l => l.id === targetLanguage)?.label}
              </span>
              <span className="flex items-center gap-1">
                <Bot className="h-3 w-3" /> {aiPersonas.find(p => p.id === aiPersona)?.label}
              </span>
              {compareMode && (
                <span className="flex items-center gap-1 text-purple-600">
                  <GitCompare className="h-3 w-3" /> Comparing {files.length} docs
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
