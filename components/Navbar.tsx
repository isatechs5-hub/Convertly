
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FileText, Menu, X, ChevronDown, QrCode, Info, ArrowRight, Sun, Moon, Sparkles, LogOut, User } from 'lucide-react';
import { AppView } from '../types';
import { subscribeToAuthArray, logoutUser } from '../services/firebase.service';
import type { User as FirebaseUser } from 'firebase/auth';

interface NavbarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('omni-pdf-theme');
      if (savedTheme) return savedTheme === 'dark';
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });

  const megaMenuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileTriggerRef = useRef<HTMLButtonElement>(null);

  // Monitor Auth State
  useEffect(() => {
    const unsubscribe = subscribeToAuthArray((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('omni-pdf-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('omni-pdf-theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Mega Menu Outside Click
      if (
        megaMenuRef.current &&
        !megaMenuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsMegaMenuOpen(false);
      }

      // Profile Menu Outside Click
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node) &&
        profileTriggerRef.current &&
        !profileTriggerRef.current.contains(event.target as Node)
      ) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const handleLogout = async () => {
    try {
      await logoutUser();
      setIsProfileMenuOpen(false);
      setView(AppView.HOME); // Functionally redirect to home/refresh state
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navigate = (view: AppView, e?: React.MouseEvent | React.TouchEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setView(view);
    setIsMegaMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const navItemClass = (isActive: boolean) =>
    `px-4 py-2 text-sm font-bold transition-all duration-300 flex items-center gap-2 rounded-xl cursor-pointer select-none relative overflow-hidden group ${isActive
      ? 'text-brand-600 bg-brand-500/10 shadow-lg shadow-brand-500/20 scale-105 ring-2 ring-brand-500/50'
      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:scale-105 hover:shadow-lg hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:translate-x-[-100%] group-hover:before:translate-x-[100%] before:transition-transform before:duration-700 after:absolute after:inset-0 after:bg-gradient-to-t after:from-transparent after:via-brand-500/5 after:to-transparent after:translate-y-[100%] group-hover:after:translate-y-[-100%] after:transition-transform after:duration-500'
    }`;

  const categories = useMemo(() => [
    {
      title: "Organize & Optimize",
      links: [
        { label: "Merge PDF", view: AppView.MERGE_PDF },
        { label: "Split PDF", view: AppView.SPLIT_PDF },
        { label: "Remove Pages", view: AppView.REMOVE_PAGES },
        { label: "Organize PDF", view: AppView.ORGANIZE_PDF },
        { label: "Compress PDF", view: AppView.COMPRESS_PDF },
        { label: "Repair PDF", view: AppView.REPAIR_PDF },
        { label: "OCR PDF", view: AppView.OCR_PDF },
        { label: "Scan to PDF", view: AppView.SCAN_TO_PDF }
      ]
    },
    {
      title: "Convert To PDF",
      links: [
        { label: "JPG to PDF", view: AppView.IMAGE_TO_PDF },
        { label: "WORD to PDF", view: AppView.WORD_TO_PDF },
        { label: "EXCEL to PDF", view: AppView.EXCEL_TO_PDF },
        { label: "PPT to PDF", view: AppView.POWERPOINT_TO_PDF },
        { label: "HTML to PDF", view: AppView.HTML_TO_PDF },
        { label: "TXT to PDF", view: AppView.TXT_TO_PDF },
        { label: "RTF to PDF", view: AppView.RTF_TO_PDF },
        { label: "PUB to PDF", view: AppView.PUB_TO_PDF },
        { label: "EPUB to PDF", view: AppView.EPUB_TO_PDF },
        { label: "HEIC to PDF", view: AppView.HEIC_TO_PDF },
        { label: "SQL to PDF", view: AppView.SQL_TO_PDF },
        { label: "JSON to PDF", view: AppView.JSON_TO_PDF },
        { label: "XML to PDF", view: AppView.XML_TO_PDF },
        { label: "CSV to PDF", view: AppView.CSV_TO_PDF },
        { label: "LOG to PDF", view: AppView.LOG_TO_PDF },
        { label: "Markdown to PDF", view: AppView.MD_TO_PDF },
        { label: "WebP to PDF", view: AppView.WEBP_TO_PDF },
        { label: "ODT to PDF", view: AppView.ODT_TO_PDF },
        { label: "ODS to PDF", view: AppView.ODS_TO_PDF },
        { label: "ODP to PDF", view: AppView.ODP_TO_PDF },
        { label: "TSV to PDF", view: AppView.TSV_TO_PDF }
      ]
    },
    {
      title: "Convert From PDF",
      links: [
        { label: "PDF to JPG", view: AppView.PDF_TO_JPG },
        { label: "PDF to WORD", view: AppView.PDF_TO_WORD },
        { label: "PDF to EXCEL", view: AppView.PDF_TO_EXCEL },
        { label: "PDF to PPT", view: AppView.PDF_TO_POWERPOINT },
        { label: "PDF to PDF/A", view: AppView.PDF_TO_PDFA },
        { label: "PDF to EPUB", view: AppView.PDF_TO_EPUB },
        { label: "PDF to RTF", view: AppView.PDF_TO_RTF },
        { label: "PDF to HTML", view: AppView.PDF_TO_HTML },
        { label: "PDF to Text", view: AppView.PDF_TO_TEXT },
        { label: "PDF to PNG", view: AppView.PDF_TO_PNG },
        { label: "PDF to TIFF", view: AppView.PDF_TO_TIFF },
        { label: "PDF to BMP", view: AppView.PDF_TO_BMP },
        { label: "PDF to JSON", view: AppView.PDF_TO_JSON },
        { label: "PDF to XML", view: AppView.PDF_TO_XML },
        { label: "PDF to CSV", view: AppView.PDF_TO_CSV },
        { label: "PDF to Markdown", view: AppView.PDF_TO_MD },
        { label: "PDF to WebP", view: AppView.PDF_TO_WEBP },
        { label: "PDF to ODT", view: AppView.PDF_TO_ODT },
        { label: "PDF to TSV", view: AppView.PDF_TO_TSV }
      ]
    },
    {
      title: "Edit & AI",
      links: [
        { label: "Edit PDF", view: AppView.EDIT_PDF },
        { label: "Sign PDF", view: AppView.SIGN_PDF },
        { label: "Watermark", view: AppView.WATERMARK_PDF },
        { label: "AI Generator", view: AppView.AI_GENERATOR },
        { label: "AI Chat", view: AppView.AI_CHAT }
      ]
    },
    {
      title: "Security & More",
      links: [
        { label: "Protect PDF", view: AppView.PROTECT_PDF },
        { label: "Unlock PDF", view: AppView.UNLOCK_PDF },
        { label: "Redact PDF", view: AppView.REDACT_PDF },
        { label: "Rotate PDF", view: AppView.ROTATE_PDF },
        { label: "Page Numbers", view: AppView.NUMBER_PDF }
      ]
    }
  ], []);

  // Responsive Fix: Ensure scroll lock when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [isMobileMenuOpen]);

  return (
    <nav className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-[100] h-16 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo & Menu */}
          <div className="flex items-center gap-8">
            <div className="flex items-center cursor-pointer gap-2.5 group" onClick={() => navigate(AppView.HOME)}>
              <div className="bg-brand-600 p-2 rounded-xl shadow-lg shadow-brand-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 group-hover:shadow-xl group-hover:shadow-brand-500/30 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-brand-400/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
                <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-white/20 transition-colors duration-300"></div>
                <FileText className="h-5 w-5 text-white relative z-10 group-hover:animate-pulse" />
              </div>
              <span className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors duration-300 relative">
                Convertly
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand-600 group-hover:w-full transition-all duration-500"></div>
              </span>
            </div>

            <div className="hidden lg:flex items-center gap-1">
              <div
                ref={triggerRef}
                className={navItemClass(isMegaMenuOpen)}
                onMouseEnter={() => setIsMegaMenuOpen(true)}
                onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}
              >
                Tools
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isMegaMenuOpen ? 'rotate-180' : ''}`} />
              </div>
              <button className={navItemClass(currentView === AppView.QR_GENERATOR)} onClick={() => navigate(AppView.QR_GENERATOR)}>
                <QrCode className="h-4 w-4" /> QR
              </button>
              <button className={navItemClass(currentView === AppView.PRICING)} onClick={() => navigate(AppView.PRICING)}>
                Pricing
              </button>
              <button className={navItemClass(currentView === AppView.COMING_SOON)} onClick={() => navigate(AppView.COMING_SOON)}>
                API
              </button>
              <button className={navItemClass(currentView === AppView.ABOUT)} onClick={() => navigate(AppView.ABOUT)}>
                About
              </button>
            </div>
          </div>

          {/* Right Section: Auth/Profile */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3">
              {currentUser ? (
                // Authenticated State
                <div className="relative">
                  <button
                    ref={profileTriggerRef}
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-700"
                  >
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 hidden xl:block px-1">
                      {currentUser.displayName || currentUser.email}
                    </span>
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        className="h-8 w-8 rounded-full border border-slate-300 dark:border-slate-600"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold">
                        {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || "U"}
                      </div>
                    )}
                  </button>

                  {isProfileMenuOpen && (
                    <div
                      ref={profileMenuRef}
                      className="absolute top-14 right-0 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 animate-in slide-in-from-top-2 duration-200"
                    >
                      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
                        {currentUser.photoURL ? (
                          <img src={currentUser.photoURL} alt="Profile" className="h-10 w-10 rounded-full" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-lg">
                            {currentUser.displayName?.charAt(0) || currentUser.email?.charAt(0) || "U"}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-900 dark:text-white truncate">{currentUser.displayName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <button
                          onClick={toggleTheme}
                          className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-bold text-slate-700 dark:text-slate-300"
                        >
                          <div className="flex items-center gap-3">
                            {isDarkMode ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-indigo-500" />}
                            <span>Theme</span>
                          </div>
                          <span className="text-xs font-medium text-slate-400">{isDarkMode ? 'Dark' : 'Light'}</span>
                        </button>

                        <button
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            setView(AppView.PROFILE);
                          }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-bold text-slate-700 dark:text-slate-300"
                        >
                          <User className="h-4 w-4" />
                          Edit Profile
                        </button>

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 transition-colors text-sm font-bold"
                        >
                          <LogOut className="h-4 w-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Guest State
                <>
                  <button
                    onClick={() => navigate(AppView.LOGIN)}
                    className="px-5 py-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-brand-600 transition-all duration-300 hover:scale-105 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-brand-400/5 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
                    <div className="absolute inset-0 rounded-lg border border-transparent group-hover:border-brand-200/50 dark:group-hover:border-brand-800/30 transition-colors duration-300"></div>
                    <span className="relative z-10">Sign In</span>
                  </button>
                  <button
                    onClick={() => navigate(AppView.LOGIN)}
                    className="px-6 py-2.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-600 dark:hover:bg-brand-600 dark:hover:text-white transition-all duration-300 shadow-xl shadow-slate-900/10 flex items-center gap-2 active:scale-95 hover:scale-105 hover:shadow-brand-500/25 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
                    <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-white/20 transition-colors duration-300"></div>
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </button>
                  <button
                    onClick={toggleTheme}
                    className="p-2.5 text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-all duration-300 active:scale-90 hover:scale-110 hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 relative overflow-hidden group"
                    aria-label="Toggle Theme"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-transparent via-brand-400/5 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
                    <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-brand-200/50 dark:group-hover:border-brand-800/30 transition-colors duration-300"></div>
                    <div className="relative z-10">
                      {isDarkMode ? <Sun className="h-5 w-5 text-amber-400 animate-in zoom-in spin-in-90 duration-500 group-hover:rotate-12 transition-transform duration-300" /> : <Moon className="h-5 w-5 text-indigo-500 animate-in zoom-in spin-in-90 duration-500 group-hover:rotate-12 transition-transform duration-300" />}
                    </div>
                  </button>
                </>
              )}
            </div>

            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-300 z-[110] relative hover:scale-110 hover:shadow-md overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-brand-400/5 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
              <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-brand-200/50 dark:group-hover:border-brand-800/30 transition-colors duration-300"></div>
              <div className="relative z-10">
                {isMobileMenuOpen ? <X className="h-6 w-6 group-hover:rotate-90 transition-transform duration-300" /> : <Menu className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />}
              </div>
            </button>
          </div>
        </div>
      </div>

      {isMegaMenuOpen && (
        <div
          ref={megaMenuRef}
          className="absolute top-16 left-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl border-b border-slate-200 dark:border-slate-800 py-8 px-8 z-[100] animate-in fade-in slide-in-from-top-4 duration-300 max-h-[calc(100vh-64px)] overflow-y-auto custom-scrollbar"
          onMouseEnter={() => setIsMegaMenuOpen(true)}
          onMouseLeave={() => setIsMegaMenuOpen(false)}
        >
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-6">
                <h3 className="font-black text-slate-900 dark:text-white text-[10px] uppercase tracking-[0.25em] flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand-500"></div>
                  {cat.title}
                </h3>
                <ul className="space-y-1">
                  {cat.links.map((link, lIdx) => (
                    <li
                      key={lIdx}
                      onMouseDown={(e) => navigate(link.view, e)}
                      className="group/item text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer transition-all duration-300 py-2 px-3 rounded-xl flex items-center gap-2 hover:translate-x-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:shadow-md relative overflow-hidden"
                    >
                      <div className="w-0 h-px bg-brand-500 group-hover/item:w-3 transition-all duration-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/10 to-transparent -translate-x-full group-hover/item:translate-x-full transition-transform duration-500"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-brand-400/5 to-transparent translate-y-full group-hover/item:translate-y-0 transition-transform duration-700"></div>
                      <div className="absolute inset-0 rounded-xl border border-transparent group-hover/item:border-brand-200/50 dark:group-hover/item:border-brand-800/30 transition-colors duration-300"></div>
                      <span className="relative z-10">{link.label}</span>
                      <div className="absolute top-1/2 -right-2 w-2 h-2 bg-brand-500 rounded-full opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 transform -translate-y-1/2"></div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white/95 dark:bg-slate-950/95 backdrop-blur-3xl z-[100] lg:hidden overflow-y-auto animate-in slide-in-from-right duration-300 flex flex-col h-screen">
          <div className="p-6 pt-24 space-y-10 pb-20">
            {currentUser ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl flex items-center gap-4">
                {currentUser.photoURL ? (
                  <img src={currentUser.photoURL} alt="Profile" className="h-12 w-12 rounded-full" />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-lg">
                    {currentUser.displayName?.charAt(0) || "U"}
                  </div>
                )}
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{currentUser.displayName}</p>
                  <p className="text-xs text-slate-500">{currentUser.email}</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => navigate(AppView.LOGIN)} className="py-4 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-slate-200 dark:border-slate-800">Sign In</button>
                <button onClick={() => navigate(AppView.LOGIN)} className="py-4 bg-brand-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-500/20">Get Started</button>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
              <span className="font-bold text-sm text-slate-600 dark:text-slate-400">Switch Theme</span>
              <button onClick={toggleTheme} className="p-3 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                {isDarkMode ? <Sun className="h-5 w-5 text-amber-400" /> : <Moon className="h-5 w-5 text-indigo-500" />}
              </button>
            </div>

            {currentUser && (
              <button onClick={handleLogout} className="w-full py-4 text-red-500 font-bold bg-red-50 dark:bg-red-900/10 rounded-2xl">
                Sign Out
              </button>
            )}

            <div className="my-6 border-t border-slate-100 dark:border-slate-800"></div>

            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="font-black text-slate-900 dark:text-white text-[10px] uppercase tracking-[0.3em] pl-2 border-l-2 border-brand-500">{cat.title}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {cat.links.map((link, lIdx) => (
                    <button
                      key={lIdx}
                      onClick={() => navigate(link.view)}
                      className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl font-bold text-[11px] text-left text-slate-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-200 dark:hover:border-brand-800 hover:scale-105 hover:shadow-md hover:shadow-slate-200/50 dark:hover:shadow-slate-800/50 transition-all duration-300 relative overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-500/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-brand-400/5 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-700"></div>
                      <div className="absolute inset-0 rounded-xl border border-transparent group-hover:border-brand-200/50 dark:group-hover:border-brand-800/30 transition-colors duration-300"></div>
                      <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-brand-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <span className="relative z-10">{link.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};
