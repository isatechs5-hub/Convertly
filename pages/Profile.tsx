import React, { useState, useEffect } from 'react';
import {
  ArrowLeft, User, Mail, Camera, Save, Settings,
  Bell, Globe, Palette, LogOut, CheckCircle2,
  Edit2, X, Loader2, MapPin, ExternalLink, ChevronRight,
  History, FileText, Check, Moon, Sun, Monitor
} from 'lucide-react';
import { AppView } from '../types';
import { subscribeToAuthArray, updateUserProfile, logoutUser, getConversionHistory } from '../services/firebase.service';
import type { User as FirebaseUser } from 'firebase/auth';

interface ProfileData {
  displayName: string;
  email: string;
  photoURL: string;
  bio: string;
  location: string;
  website: string;
}

interface Props {
  setView: (view: AppView) => void;
}

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Chinese", "Japanese", "Korean", "Arabic", "Russian", "Portuguese",
  "Italian", "Hindi", "Bengali", "Turkish", "Vietnamese", "Polish", "Ukrainian", "Dutch", "Greek", "Swedish",
  "Indonesian", "Malay", "Thai", "Hebrew", "Urdu", "Persian", "Romanian", "Czech", "Hungarian", "Danish"
];

const ACCENT_COLORS = [
  { name: 'Indigo', color: '#6366f1' },
  { name: 'Pink', color: '#ec4899' },
  { name: 'Emerald', color: '#10b981' },
  { name: 'Amber', color: '#f59e0b' },
  { name: 'Rose', color: '#f43f5e' },
  { name: 'Cyan', color: '#06b6d4' }
];

export const Profile: React.FC<Props> = ({ setView }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'settings' | 'history'>('profile');
  const [activeSetting, setActiveSetting] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [historyItems, setHistoryItems] = useState<any[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(localStorage.getItem('userTheme') as any || 'system');
  const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem('userLanguage') || 'English');
  const [accentColor, setAccentColor] = useState(localStorage.getItem('userAccent') || '#6366f1');

  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: '',
    email: '',
    photoURL: '',
    bio: '',
    location: '',
    website: ''
  });

  const [tempProfileData, setTempProfileData] = useState<ProfileData>({
    displayName: '',
    email: '',
    photoURL: '',
    bio: '',
    location: '',
    website: ''
  });

  useEffect(() => {
    const unsubscribe = subscribeToAuthArray(async (user) => {
      setCurrentUser(user);
      if (user) {
        const storedImage = localStorage.getItem('userProfileImage');
        const data = {
          displayName: user.displayName || '',
          email: user.email || '',
          photoURL: storedImage || user.photoURL || '',
          bio: localStorage.getItem('userBio') || 'PDF Power User & AI Enthusiast',
          location: localStorage.getItem('userLocation') || 'Remote',
          website: localStorage.getItem('userWebsite') || ''
        };
        setProfileData(data);
        setTempProfileData(data);

        // Fetch real history
        const history = await getConversionHistory(user.uid);
        setHistoryItems(history);
      }
    });
    return () => unsubscribe();
  }, []);

  // Theme Logic
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('userTheme', theme);
  }, [theme]);

  // Accent Logic - Dynamic Tailwind Update
  useEffect(() => {
    if ((window as any).tailwind) {
      const tw = (window as any).tailwind;
      tw.config.theme.extend.colors.brand[600] = accentColor;
      // Re-process tailwind to apply changes
      // This is specific to the CDN version
    }
    localStorage.setItem('userAccent', accentColor);
  }, [accentColor]);

  const handleEdit = () => {
    setTempProfileData(profileData);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setTempProfileData(profileData);
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!currentUser) return;

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // 1. Update Local State immediately (Optimistic Update)
      setProfileData(tempProfileData);
      
      // 2. Persist to LocalStorage
      if (tempProfileData.photoURL && tempProfileData.photoURL.startsWith('data:')) {
        try {
            localStorage.setItem('userProfileImage', tempProfileData.photoURL);
        } catch (e) { console.warn("Image too large for local storage"); }
      }
      localStorage.setItem('userBio', tempProfileData.bio);
      localStorage.setItem('userLocation', tempProfileData.location);
      localStorage.setItem('userWebsite', tempProfileData.website);

      // 3. Attempt Cloud Sync (Background)
      await updateUserProfile(currentUser, {
        displayName: tempProfileData.displayName,
        photoURL: tempProfileData.photoURL
      });

      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error: any) {
      console.error('Unexpected error updating profile:', error);
      // Even if cloud fails, we keep local state updated
      setIsEditing(false);
      setSaveSuccess(true);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setView(AppView.HOME);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 1 * 1024 * 1024) {
        alert('Image must be under 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfileData({ ...tempProfileData, photoURL: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 pb-20">
      {/* Simple Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <button
            onClick={() => setView(AppView.HOME)}
            className="flex items-center gap-3 text-slate-600 dark:text-slate-400 hover:text-brand-600 transition-all group font-bold"
          >
            <ArrowLeft className="h-5 w-5" />
            Back
          </button>
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest px-4 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-full">Account Vault</span>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 shadow-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-white dark:from-slate-900 to-white/90 dark:to-slate-800 opacity-90"></div>

              <div className="relative mt-12 flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="h-32 w-32 rounded-[40px] overflow-hidden border-8 border-white dark:border-slate-900 shadow-2xl bg-slate-100 dark:bg-slate-800 group/avatar">
                    {isEditing ? (
                      <div className="relative w-full h-full">
                        <img src={tempProfileData.photoURL || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" alt="Avatar" />
                        <label className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                          <Camera className="h-6 w-6 text-white mb-2" />
                          <input type="file" onChange={handleImageUpload} className="hidden" accept="image/*" />
                        </label>
                      </div>
                    ) : (
                      profileData.photoURL ? <img src={profileData.photoURL} alt="User" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><User className="h-10 w-10 text-slate-300" /></div>
                    )}
                  </div>
                </div>

                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">{profileData.displayName || 'Guest User'}</h2>
                <p className="text-xs font-bold text-slate-400 mt-1">{profileData.email}</p>

                <div className="mt-8 w-full space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Docs Merged</span>
                    <span className="font-black text-slate-900 dark:text-white">{historyItems.length}</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full py-5 bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 text-rose-500 font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all shadow-xl"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>

          {/* Main */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 rounded-[48px] p-8 md:p-12 shadow-2xl border border-slate-100 dark:border-slate-800 min-h-[600px]">

              {/* Tabs */}
              <div className="flex items-center justify-between mb-10">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
                  {[
                    { id: 'profile', icon: User, label: 'Personal' },
                    { id: 'history', icon: History, label: 'History' },
                    { id: 'settings', icon: Settings, label: 'Vault' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setActiveTab(t.id as any); setActiveSetting(null); }}
                      className={`px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t.id ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-lg' : 'text-slate-400'}`}
                    >
                      <span className="flex items-center gap-2">
                        <t.icon className="h-3 w-3" /> {t.label}
                      </span>
                    </button>
                  ))}
                </div>

                {isEditing && activeTab === 'profile' && (
                  <div className="flex gap-2">
                    <button onClick={handleCancel} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl"><X className="h-4 w-4" /></button>
                    <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-brand-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
                      {isSaving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                      {isSaving ? 'Saving' : 'Save'}
                    </button>
                  </div>
                )}
                {!isEditing && activeTab === 'profile' && (
                  <button onClick={handleEdit} className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest">Edit Details</button>
                )}
              </div>

              {saveSuccess && (
                <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Updated Successfully</span>
                </div>
              )}

              {/* Personal */}
              {activeTab === 'profile' && (
                <div className="space-y-8 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Name</label>
                      <input type="text" disabled={!isEditing} value={tempProfileData.displayName} onChange={(e) => setTempProfileData({ ...tempProfileData, displayName: e.target.value })} className="w-full py-4 px-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-slate-900 dark:text-white disabled:opacity-50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email</label>
                      <input type="email" disabled value={profileData.email} className="w-full py-4 px-6 bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl cursor-not-allowed font-bold text-slate-400" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Bio</label>
                    <textarea disabled={!isEditing} value={tempProfileData.bio} onChange={(e) => setTempProfileData({ ...tempProfileData, bio: e.target.value })} rows={3} className="w-full py-4 px-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl outline-none font-bold text-slate-900 dark:text-white disabled:opacity-50 resize-none" />
                  </div>
                </div>
              )}

              {/* History */}
              {activeTab === 'history' && (
                <div className="space-y-4 animate-in fade-in duration-300">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-widest uppercase text-xs mb-6">Recent Operations</h3>
                  {historyItems.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {historyItems.map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-white dark:bg-slate-900 rounded-lg text-brand-600"><FileText className="h-4 w-4" /></div>
                            <div>
                              <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.toolName || 'Conversion'}</p>
                              <p className="text-[9px] font-bold text-slate-400">{new Date(item.timestamp).toLocaleString()}</p>
                            </div>
                          </div>
                          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 px-3 py-1 bg-emerald-500/10 rounded-full">Success</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                      <History className="h-12 w-12 mb-4 opacity-20" />
                      <p className="text-xs font-black uppercase tracking-widest">No history yet</p>
                    </div>
                  )}
                </div>
              )}

              {/* Vault / Settings */}
              {activeTab === 'settings' && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {!activeSetting ? (
                    <div className="grid grid-cols-1 gap-4">
                      <button onClick={() => setActiveSetting('lang')} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-800 group hover:border-brand-500 transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all"><Globe className="h-5 w-5 text-blue-500" /></div>
                          <div className="text-left">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-widest uppercase">Global Language</h4>
                            <p className="text-[10px] text-slate-400 font-bold">Current: {selectedLanguage}</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1" />
                      </button>

                      <button onClick={() => setActiveSetting('visual')} className="flex items-center justify-between p-6 bg-slate-50 dark:bg-slate-800 rounded-[32px] border border-slate-100 dark:border-slate-800 group hover:border-brand-500 transition-all">
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all"><Palette className="h-5 w-5 text-brand-600" /></div>
                          <div className="text-left">
                            <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-widest uppercase">Visual Atmosphere</h4>
                            <p className="text-[10px] text-slate-400 font-bold">Theme and primary accent</p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1" />
                      </button>
                    </div>
                  ) : (
                    <div className="animate-in zoom-in-95 duration-200">
                      <button onClick={() => setActiveSetting(null)} className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-400 hover:text-brand-600 mb-8"><ArrowLeft className="h-3 w-3" /> Back</button>

                      {activeSetting === 'lang' && (
                        <div className="space-y-6">
                          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-widest uppercase text-xs">Select Working Language</h3>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {LANGUAGES.map((l) => (
                              <button
                                key={l}
                                onClick={() => { setSelectedLanguage(l); localStorage.setItem('userLanguage', l); }}
                                className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${selectedLanguage === l ? 'bg-brand-600 text-white border-brand-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-500'}`}
                              >
                                {l}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeSetting === 'visual' && (
                        <div className="space-y-10">
                          <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Display Theme</h4>
                            <div className="grid grid-cols-3 gap-4">
                              {[
                                { id: 'light', icon: Sun, label: 'Light' },
                                { id: 'dark', icon: Moon, label: 'Dark' },
                                { id: 'system', icon: Monitor, label: 'System' }
                              ].map((t) => (
                                <button
                                  key={t.id}
                                  onClick={() => setTheme(t.id as any)}
                                  className={`p-6 rounded-[32px] border flex flex-col items-center gap-3 transition-all ${theme === t.id ? 'border-brand-600 bg-brand-500/5 ring-4 ring-brand-500/5' : 'border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50'}`}
                                >
                                  <t.icon className={`h-6 w-6 ${theme === t.id ? 'text-brand-600' : 'text-slate-400'}`} />
                                  <span className={`text-[9px] font-black uppercase tracking-widest ${theme === t.id ? 'text-slate-900 dark:text-white' : 'text-slate-500'}`}>{t.label}</span>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2">Accent Aesthetics</h4>
                            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                              {ACCENT_COLORS.map((c) => (
                                <button
                                  key={c.name}
                                  onClick={() => { setAccentColor(c.color); localStorage.setItem('userAccent', c.color); }}
                                  className={`h-14 rounded-2xl flex items-center justify-center transition-all ${accentColor === c.color ? 'ring-4 ring-offset-4 ring-offset-white dark:ring-offset-slate-900 ring-slate-900 dark:ring-white scale-90' : 'hover:scale-105'}`}
                                  style={{ backgroundColor: c.color }}
                                >
                                  {accentColor === c.color && <Check className="h-5 w-5 text-white" />}
                                </button>
                              ))}
                            </div>
                            <div className="p-10 rounded-[32px] bg-slate-950 text-white relative overflow-hidden group">
                              <div className="absolute inset-0 bg-gradient-to-br from-brand-600/20 via-transparent to-transparent"></div>
                              <div className="relative">
                                <p className="text-[10px] font-black uppercase tracking-widest text-brand-500 mb-2">Live Preview</p>
                                <h5 className="text-xl font-black mb-1">OmniEngine UI</h5>
                                <div className="flex gap-2 mt-4">
                                  <div className="h-2 w-12 rounded-full" style={{ backgroundColor: accentColor }}></div>
                                  <div className="h-2 w-4 rounded-full bg-slate-700"></div>
                                  <div className="h-2 w-4 rounded-full bg-slate-700"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
