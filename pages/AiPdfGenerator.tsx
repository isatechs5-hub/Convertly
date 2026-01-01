
import React, { useState } from 'react';
import { ArrowLeft, Download, Loader2, Sparkles, Wand2, Terminal, CheckCircle, Globe, FileText, BookOpen, TrendingUp, Save, History, FileCode, Copy, BarChart3, Languages, Palette, Settings } from 'lucide-react';
import { AppView } from '../types';
import { generateDocumentContent } from '../services/openrouter';
import { createPdfFromText } from '../services/pdfUtils';

interface Props {
  setView: (view: AppView) => void;
}

export const AiPdfGenerator: React.FC<Props> = ({ setView }) => {
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [docType, setDocType] = useState<'report' | 'essay' | 'summary' | 'business-plan' | 'resume' | 'cover-letter' | 'research-paper' | 'case-study' | 'proposal' | 'whitepaper' | 'presentation' | 'newsletter'>('report');
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 🆕 NEW FEATURES STATE
  const [language, setLanguage] = useState('english');
  const [pageLength, setPageLength] = useState('medium');
  const [tone, setTone] = useState('professional');
  const [citationStyle, setCitationStyle] = useState('apa');
  const [includeTOC, setIncludeTOC] = useState(true);
  const [includeBibliography, setIncludeBibliography] = useState(true);
  const [includeExecutiveSummary, setIncludeExecutiveSummary] = useState(false);
  const [seoOptimized, setSeoOptimized] = useState(false);
  const [industry, setIndustry] = useState('general');
  const [readabilityScore, setReadabilityScore] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Document type configurations
  const documentTypes = [
    { id: 'report', label: 'Report', icon: '📊', description: 'Professional business report', isNew: false },
    { id: 'essay', label: 'Essay', icon: '📝', description: 'Academic essay', isNew: false },
    { id: 'summary', label: 'Summary', icon: '📋', description: 'Executive summary', isNew: false },
    { id: 'business-plan', label: 'Business Plan', icon: '💼', description: 'Complete business plan', isNew: true },
    { id: 'resume', label: 'Resume/CV', icon: '👤', description: 'Professional resume', isNew: true },
    { id: 'cover-letter', label: 'Cover Letter', icon: '✉️', description: 'Job application letter', isNew: true },
    { id: 'research-paper', label: 'Research Paper', icon: '🔬', description: 'Academic research', isNew: true },
    { id: 'case-study', label: 'Case Study', icon: '📖', description: 'Business case study', isNew: true },
    { id: 'proposal', label: 'Proposal', icon: '📄', description: 'Project proposal', isNew: true },
    { id: 'whitepaper', label: 'Whitepaper', icon: '📃', description: 'Technical whitepaper', isNew: true },
    { id: 'presentation', label: 'Presentation', icon: '🎯', description: 'Slide deck content', isNew: true },
    { id: 'newsletter', label: 'Newsletter', icon: '📰', description: 'Email newsletter', isNew: true },
  ];

  // 🆕 NEW: Language Options
  const languages = [
    { id: 'english', label: 'English', flag: '🇺🇸' },
    { id: 'spanish', label: 'Spanish', flag: '🇪🇸' },
    { id: 'french', label: 'French', flag: '🇫🇷' },
    { id: 'german', label: 'German', flag: '🇩🇪' },
    { id: 'chinese', label: 'Chinese', flag: '🇨🇳' },
    { id: 'japanese', label: 'Japanese', flag: '🇯🇵' },
    { id: 'hindi', label: 'Hindi', flag: '🇮🇳' },
    { id: 'arabic', label: 'Arabic', flag: '🇸🇦' },
    { id: 'portuguese', label: 'Portuguese', flag: '🇵🇹' },
    { id: 'russian', label: 'Russian', flag: '🇷🇺' },
  ];

  // 🆕 NEW: Tone Options
  const tones = [
    { id: 'professional', label: 'Professional', icon: '💼' },
    { id: 'casual', label: 'Casual', icon: '😊' },
    { id: 'academic', label: 'Academic', icon: '🎓' },
    { id: 'creative', label: 'Creative', icon: '🎨' },
    { id: 'persuasive', label: 'Persuasive', icon: '🎯' },
    { id: 'technical', label: 'Technical', icon: '⚙️' },
  ];

  // 🆕 NEW: Page Length Options
  const pageLengths = [
    { id: 'short', label: 'Short (1-2 pages)', words: '500-1000' },
    { id: 'medium', label: 'Medium (3-5 pages)', words: '1500-2500' },
    { id: 'long', label: 'Long (6-10 pages)', words: '3000-5000' },
    { id: 'extensive', label: 'Extensive (10+ pages)', words: '5000+' },
  ];

  // 🆕 NEW: Citation Styles
  const citationStyles = [
    { id: 'apa', label: 'APA 7th' },
    { id: 'mla', label: 'MLA 9th' },
    { id: 'chicago', label: 'Chicago' },
    { id: 'harvard', label: 'Harvard' },
    { id: 'ieee', label: 'IEEE' },
  ];

  // 🆕 NEW: Industry Options
  const industries = [
    { id: 'general', label: 'General', icon: '🌐' },
    { id: 'technology', label: 'Technology', icon: '💻' },
    { id: 'healthcare', label: 'Healthcare', icon: '🏥' },
    { id: 'finance', label: 'Finance', icon: '💰' },
    { id: 'education', label: 'Education', icon: '📚' },
    { id: 'legal', label: 'Legal', icon: '⚖️' },
    { id: 'marketing', label: 'Marketing', icon: '📢' },
    { id: 'real-estate', label: 'Real Estate', icon: '🏢' },
  ];

  // 🆕 NEW: Calculate Readability Score
  const calculateReadability = (text: string) => {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const syllables = text.split(/\s+/).reduce((acc, word) => acc + Math.ceil(word.length / 3), 0);

    // Flesch Reading Ease Score (simplified)
    const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setErrorMsg('');
    setGeneratedContent('');

    const steps = [
      "Analyzing topic requirements...",
      "Structuring professional outline...",
      `Generating in ${languages.find(l => l.id === language)?.label}...`,
      `Applying ${tone} tone...`,
      "Fetching context via Gemini 3 Pro...",
      "Drafting final document content...",
      includeTOC ? "Creating table of contents..." : "Formatting sections...",
      includeBibliography ? "Generating bibliography..." : "Finalizing content...",
      "Polishing for professional standards...",
      "Calculating readability metrics..."
    ];

    let i = 0;
    const interval = setInterval(() => {
      setStatusMsg(steps[i % steps.length]);
      i++;
    }, 1500);

    try {
      // 🆕 Enhanced prompt with new features
      const enhancedPrompt = `
        Generate a ${docType} about: ${topic}
        
        Requirements:
        - Language: ${language}
        - Tone: ${tone}
        - Length: ${pageLengths.find(p => p.id === pageLength)?.label}
        - Industry: ${industry}
        - Citation Style: ${citationStyle.toUpperCase()}
        ${includeTOC ? '- Include a detailed Table of Contents' : ''}
        ${includeBibliography ? '- Include Bibliography/References section' : ''}
        ${includeExecutiveSummary ? '- Include Executive Summary at the beginning' : ''}
        ${seoOptimized ? '- Optimize for SEO with relevant keywords' : ''}
        
        Make it professional, well-structured, and comprehensive.
      `;

      const content = await generateDocumentContent(enhancedPrompt, docType);
      setGeneratedContent(content);

      // 🆕 Calculate metrics
      setWordCount(content.split(/\s+/).length);
      setReadabilityScore(calculateReadability(content));

    } catch (error: any) {
      setErrorMsg(error.message || "AI Generation failed. Please try again.");
    } finally {
      clearInterval(interval);
      setIsLoading(false);
      setStatusMsg('');
    }
  };

  // 🆕 NEW: Export to multiple formats
  const handleExport = (format: 'pdf' | 'docx' | 'txt' | 'md') => {
    setIsGeneratingPdf(true);
    try {
      if (format === 'pdf') {
        const blob = createPdfFromText(topic.toUpperCase(), generatedContent);
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${topic.replace(/\s+/g, '_')}_${docType}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === 'txt') {
        const blob = new Blob([generatedContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${topic.replace(/\s+/g, '_')}_${docType}.txt`;
        link.click();
        URL.revokeObjectURL(url);
      } else if (format === 'md') {
        const blob = new Blob([`# ${topic}\n\n${generatedContent}`], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${topic.replace(/\s+/g, '_')}_${docType}.md`;
        link.click();
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      alert(`Failed to export ${format.toUpperCase()}.`);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // 🆕 NEW: Copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    alert('Content copied to clipboard!');
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-24 transition-colors duration-500">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 py-6 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => setView(AppView.HOME)} className="flex items-center text-slate-500 dark:text-slate-400 hover:text-brand-600 transition-colors font-bold">
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </button>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-brand-600" />
            AI PDF CREATOR PRO
            <span className="text-xs bg-brand-600 text-white px-2 py-1 rounded-full">20+ Features</span>
          </h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Settings Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] shadow-xl border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-brand-500/10 rounded-2xl">
                <Terminal className="h-5 w-5 text-brand-600" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Configuration</h2>
            </div>

            <div className="space-y-6">
              {/* Document Type */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Document Type</label>
                <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {documentTypes.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setDocType(t.id as any)}
                      className={`relative px-3 py-3 text-xs font-bold rounded-xl border transition-all text-left ${docType === t.id ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-lg' : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-500'}`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">{t.icon}</span>
                        <span className="text-[10px] leading-tight">{t.label}</span>
                      </div>
                      {t.isNew && (
                        <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full">NEW</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 🆕 Language Selection */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                  <Languages className="h-3 w-3" /> Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium"
                >
                  {languages.map(lang => (
                    <option key={lang.id} value={lang.id}>{lang.flag} {lang.label}</option>
                  ))}
                </select>
              </div>

              {/* 🆕 Tone Selection */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                  <Palette className="h-3 w-3" /> Writing Tone
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {tones.map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTone(t.id)}
                      className={`px-2 py-2 text-xs font-bold rounded-lg border transition-all ${tone === t.id ? 'bg-brand-600 text-white border-brand-600' : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-brand-500'}`}
                    >
                      <div className="text-center">
                        <div className="text-base mb-1">{t.icon}</div>
                        <div className="text-[9px]">{t.label}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 🆕 Page Length */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-2">
                  <FileText className="h-3 w-3" /> Document Length
                </label>
                <select
                  value={pageLength}
                  onChange={(e) => setPageLength(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none text-sm font-medium"
                >
                  {pageLengths.map(pl => (
                    <option key={pl.id} value={pl.id}>{pl.label} - {pl.words} words</option>
                  ))}
                </select>
              </div>

              {/* Detailed Prompt */}
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Detailed Prompt</label>
                <textarea
                  rows={5}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all text-sm font-medium resize-none"
                  placeholder="e.g. A comprehensive analysis of the real estate market in 2024..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              {/* 🆕 Advanced Options Toggle */}
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-between"
              >
                <span className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Advanced Options
                </span>
                <span className="text-xs">{showAdvanced ? '▲' : '▼'}</span>
              </button>

              {/* 🆕 Advanced Options */}
              {showAdvanced && (
                <div className="space-y-4 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  {/* Citation Style */}
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Citation Style</label>
                    <select
                      value={citationStyle}
                      onChange={(e) => setCitationStyle(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium"
                    >
                      {citationStyles.map(cs => (
                        <option key={cs.id} value={cs.id}>{cs.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Industry Focus</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium"
                    >
                      {industries.map(ind => (
                        <option key={ind.id} value={ind.id}>{ind.icon} {ind.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Checkboxes */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={includeTOC} onChange={(e) => setIncludeTOC(e.target.checked)} className="rounded" />
                      <span className="text-xs font-medium">Table of Contents</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={includeBibliography} onChange={(e) => setIncludeBibliography(e.target.checked)} className="rounded" />
                      <span className="text-xs font-medium">Bibliography/References</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={includeExecutiveSummary} onChange={(e) => setIncludeExecutiveSummary(e.target.checked)} className="rounded" />
                      <span className="text-xs font-medium">Executive Summary</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={seoOptimized} onChange={(e) => setSeoOptimized(e.target.checked)} className="rounded" />
                      <span className="text-xs font-medium">SEO Optimization</span>
                    </label>
                  </div>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isLoading || !topic}
                className={`w-full py-5 rounded-2xl font-black text-white flex items-center justify-center gap-3 shadow-2xl transition-all active:scale-95 ${isLoading ? 'bg-slate-300 dark:bg-slate-800 cursor-not-allowed text-slate-500' : 'bg-brand-600 hover:bg-brand-700 shadow-brand-500/20'}`}
              >
                {isLoading ? <Loader2 className="animate-spin h-6 w-6" /> : <Wand2 className="h-6 w-6" />}
                {isLoading ? 'Processing Intelligence...' : 'Generate Document'}
              </button>
            </div>
          </div>

          <div className="bg-slate-900 dark:bg-brand-900/20 p-6 rounded-[24px] border border-slate-800 dark:border-brand-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-brand-500" />
              <span className="text-[10px] font-black text-brand-500 uppercase tracking-widest">OmniGen v3 Pro</span>
            </div>
            <p className="text-slate-400 dark:text-slate-300 text-sm font-medium leading-relaxed">
              20+ Professional features including multi-language support, tone control, citation styles, and advanced formatting options.
            </p>
          </div>
        </div>

        {/* Output Panel */}
        <div className="lg:col-span-8">
          <div className="bg-white dark:bg-slate-900 p-10 rounded-[40px] shadow-2xl border border-slate-100 dark:border-slate-800 min-h-[700px] flex flex-col relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
              {isLoading && <div className="h-full bg-brand-600 animate-[shimmerPremium_2s_infinite_linear]" style={{ width: '30%' }}></div>}
            </div>

            <div className="flex justify-between items-center mb-10 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col">
                <h3 className="font-black text-slate-900 dark:text-white tracking-tight text-xl uppercase">Document Output</h3>
                {errorMsg && (
                  <div className="mt-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg border border-red-100 dark:border-red-800 flex items-center gap-2 animate-in slide-in-from-top-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    {errorMsg}
                  </div>
                )}
                {generatedContent && (
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <FileText className="h-3 w-3" /> {wordCount} words
                    </span>
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <BarChart3 className="h-3 w-3" /> Readability: {readabilityScore}/100
                    </span>
                  </div>
                )}
              </div>
              {generatedContent && (
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-bold text-xs"
                  >
                    <Copy className="h-3 w-3" />
                    Copy
                  </button>
                  <div className="relative group/export">
                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:bg-brand-600 dark:hover:bg-brand-600 dark:hover:text-white transition-all shadow-xl active:scale-95 font-black text-sm uppercase tracking-widest">
                      <Download className="h-4 w-4" />
                      Export
                    </button>
                    <div className="absolute right-0 top-full mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 p-2 opacity-0 invisible group-hover/export:opacity-100 group-hover/export:visible transition-all z-50 min-w-[150px]">
                      <button onClick={() => handleExport('pdf')} className="w-full px-4 py-2 text-left text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">📄 PDF</button>
                      <button onClick={() => handleExport('txt')} className="w-full px-4 py-2 text-left text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">📝 TXT</button>
                      <button onClick={() => handleExport('md')} className="w-full px-4 py-2 text-left text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">📋 Markdown</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isLoading ? (
              <div className="flex-grow flex flex-col items-center justify-center text-center animate-pulse">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-brand-500/10 rounded-[32px] flex items-center justify-center border border-brand-500/20">
                    <Loader2 className="h-10 w-10 text-brand-600 animate-spin" />
                  </div>
                  <Sparkles className="absolute -top-2 -right-2 h-8 w-8 text-brand-500 animate-bounce" />
                </div>
                <p className="text-xl font-black text-slate-900 dark:text-white mb-2">{statusMsg}</p>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Sit tight, our AI is crafting your masterpiece.</p>
              </div>
            ) : generatedContent ? (
              <div className="prose prose-slate dark:prose-invert max-w-none flex-grow overflow-auto font-sans leading-relaxed animate-in fade-in duration-700">
                <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-8 border-b-4 border-brand-500 inline-block pb-2">{topic.toUpperCase()}</h1>
                <div className="text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap text-lg">
                  {generatedContent}
                </div>
                <div className="mt-12 pt-8 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" /> AI verified content
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Globe className="h-4 w-4 text-blue-500" /> {languages.find(l => l.id === language)?.label}
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <BookOpen className="h-4 w-4 text-purple-500" /> {citationStyle.toUpperCase()} Style
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <TrendingUp className="h-4 w-4 text-orange-500" /> {tone} tone
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
                <Wand2 className="h-32 w-32 mb-8 opacity-20" />
                <h4 className="text-2xl font-black uppercase tracking-[0.2em] opacity-40">Workspace Empty</h4>
                <p className="mt-4 font-bold text-slate-400">Configure settings and generate to see results.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
