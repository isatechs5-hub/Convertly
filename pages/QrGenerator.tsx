
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, QrCode, Download, Loader2, Link as LinkIcon, Type, Wifi, Mail, Phone, MessageSquare, Sparkles, Wand2, Eye, Palette, Image as ImageIcon, MapPin, Bitcoin, CreditCard, Smartphone, Calendar, Share2, Layers, ShieldCheck, Save, History, Settings, X, Trash2 } from 'lucide-react';
import { AppView } from '../types';
import { generateDocumentContent } from '../services/openrouter';

interface Props {
  setView: (view: AppView) => void;
}

type QrType = 'URL' | 'TEXT' | 'WIFI' | 'EMAIL' | 'PHONE' | 'SMS' | 'VCARD' | 'EVENT' | 'CRYPTO' | 'LOCATION' | 'WHATSAPP' | 'PAYPAL' | 'ZOOM';

export const QrGenerator: React.FC<Props> = ({ setView }) => {
  const [activeTab, setActiveTab] = useState<'create' | 'design' | 'history'>('create');
  const [type, setType] = useState<QrType>('URL');
  const [value, setValue] = useState('');
  const [qrUrl, setQrUrl] = useState('');
  const [logo, setLogo] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [savedQrs, setSavedQrs] = useState<any[]>([]);

  // Design Customization
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [margin, setMargin] = useState(1);
  const [resolution, setResolution] = useState(1000);
  const [dotStyle, setDotStyle] = useState<'square' | 'rounded'>('square'); // Simulated via API if possible, else just aesthetic preview

  // Dynamic Fields
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [encryption, setEncryption] = useState('WPA');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [number, setNumber] = useState('');
  const [cryptoType, setCryptoType] = useState('BTC');
  const [cryptoAddress, setCryptoAddress] = useState('');
  const [lat, setLat] = useState('');
  const [long, setLong] = useState('');
  const [zoomId, setZoomId] = useState('');
  const [zoomPass, setZoomPass] = useState('');

  // VCard/Event specific states
  const [vcName, setVcName] = useState('');
  const [vcOrg, setVcOrg] = useState('');
  const [vcTitle, setVcTitle] = useState('');
  const [vcUrl, setVcUrl] = useState('');
  const [vcAddress, setVcAddress] = useState('');

  const [evTitle, setEvTitle] = useState('');
  const [evStart, setEvStart] = useState('');
  const [evEnd, setEvEnd] = useState('');
  const [evLoc, setEvLoc] = useState('');

  // AI Design Assistant State
  const [aiDesignSuggestion, setAiDesignSuggestion] = useState('');

  useEffect(() => {
    generateQr();
  }, [type, value, ssid, password, encryption, email, subject, body, number, cryptoType, cryptoAddress, lat, long, zoomId, zoomPass, fgColor, bgColor, margin, vcName, vcOrg, vcTitle, vcUrl, vcAddress, evTitle, evStart, evEnd, evLoc]);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('omni_qr_history');
    if (saved) setSavedQrs(JSON.parse(saved));
  }, []);

  const generateQr = () => {
    let data = '';
    // Build data string based on type
    switch (type) {
      case 'URL': case 'TEXT': data = value; break;
      case 'WIFI': data = `WIFI:S:${ssid};T:${encryption};P:${password};;`; break;
      case 'EMAIL': data = `MATMSG:TO:${email};SUB:${subject};BODY:${body};;`; break;
      case 'PHONE': data = `TEL:${number}`; break;
      case 'SMS': data = `SMSTO:${number}:${body}`; break;
      case 'VCARD':
        data = `BEGIN:VCARD\nVERSION:3.0\nN:${vcName}\nORG:${vcOrg}\nTITLE:${vcTitle}\nTEL:${number}\nEMAIL:${email}\nURL:${vcUrl}\nADR:;;${vcAddress};;;;\nEND:VCARD`;
        break;
      case 'EVENT':
        data = `BEGIN:VEVENT\nSUMMARY:${evTitle}\nDTSTART:${evStart.replace(/[-:]/g, '')}\nDTEND:${evEnd.replace(/[-:]/g, '')}\nLOCATION:${evLoc}\nDESCRIPTION:${body}\nEND:VEVENT`;
        break;
      case 'CRYPTO': data = `${cryptoType.toLowerCase()}:${cryptoAddress}`; break;
      case 'LOCATION': data = `geo:${lat},${long}`; break;
      case 'WHATSAPP': data = `https://wa.me/${number}?text=${encodeURIComponent(body)}`; break;
      case 'PAYPAL': data = `https://paypal.me/${value}`; break;
      case 'ZOOM': data = `https://zoom.us/j/${zoomId}?pwd=${zoomPass}`; break;
    }

    if (!data.trim()) {
      setQrUrl('');
      return;
    }

    // construct API URL with colors and margin
    const colorClean = fgColor.replace('#', '');
    const bgClean = bgColor.replace('#', '');
    const apiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${resolution}x${resolution}&data=${encodeURIComponent(data)}&bgcolor=${bgClean}&color=${colorClean}&margin=${margin}&qzone=${margin}`;
    setQrUrl(apiUrl);
  };

  const handleAiAction = async (action: 'design' | 'content') => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    try {
      if (action === 'content') {
        const prompt = `Convert this user request into the specific text format for a QR code data payload. 
        User Request: "${aiPrompt}"
        Type: "${type}"
        
        Rules:
        - If WiFi: Return "SSID|PASSWORD|ENCRYPTION" (e.g. HomeNet|123456|WPA)
        - If Event: Return valid iCalendar (.ics) string
        - If Contact: Return valid vCard 3.0 string
        - If Color/Design: Ignore, this is content only.
        - Default: Just return the improved/summarized text.
        
        Output ONLY the raw string data.`;

        const result = await generateDocumentContent(prompt, 'raw-text');

        // rudimentary parsing of AI response
        if (type === 'WIFI') {
          const parts = result.split('|');
          if (parts.length >= 2) { setSsid(parts[0].trim()); setPassword(parts[1].trim()); }
        } else {
          setValue(result);
        }
      } else {
        // Design Assistant
        const prompt = `Suggest 2 hex colors (Foreground, Background) based on this mood/brand: "${aiPrompt}". Output format: "#FG|#BG" (e.g. #FF0000|#FFFFFF)`;
        const result = await generateDocumentContent(prompt, 'raw-text');
        const parts = result.split('|');
        if (parts.length === 2) {
          setFgColor(parts[0].trim());
          setBgColor(parts[1].trim());
          setAiDesignSuggestion("Colors applied based on your brand!");
        }
      }
    } catch (e) {
      alert("AI Assistant busy. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => setLogo(ev.target?.result as string);
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const saveToHistory = () => {
    if (!qrUrl) return;
    const newEntry = { id: Date.now(), type, value, url: qrUrl, date: new Date().toLocaleDateString() };
    const updated = [newEntry, ...savedQrs];
    setSavedQrs(updated);
    localStorage.setItem('omni_qr_history', JSON.stringify(updated));
    setActiveTab('history');
  };

  const downloadQr = async (format: 'png' | 'svg' = 'png') => {
    if (!qrUrl) return;
    setIsGenerating(true);
    try {
      // Fetch the image to get a blob, to avoid CORS issues sometimes with direct link
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `omnipdf_qr_${Date.now()}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert("Download failed. Try right-clicking the image.");
    } finally {
      setIsGenerating(false);
    }
  };

  const typeIcons: any = {
    URL: LinkIcon, TEXT: Type, WIFI: Wifi, EMAIL: Mail, PHONE: Phone, SMS: MessageSquare,
    VCARD: CreditCard, EVENT: Calendar, CRYPTO: Bitcoin, LOCATION: MapPin, WHATSAPP: MessageSquare, PAYPAL: CreditCard, ZOOM: Smartphone
  };
  const CurrentIcon = typeIcons[type];

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-4 px-6 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => setView(AppView.HOME)} className="flex items-center text-slate-500 hover:text-purple-600 font-bold transition-all">
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-purple-600 text-white p-2 rounded-lg"><QrCode className="h-5 w-5" /></div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">AI QR STUDIO</h1>
            <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded-full">PRO</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setActiveTab('create')} className={`px-4 py-2 rounded-lg font-bold text-xs ${activeTab === 'create' ? 'bg-purple-100 text-purple-700' : 'text-slate-500'}`}>Create</button>
            <button onClick={() => setActiveTab('design')} className={`px-4 py-2 rounded-lg font-bold text-xs ${activeTab === 'design' ? 'bg-purple-100 text-purple-700' : 'text-slate-500'}`}>Design</button>
            <button onClick={() => setActiveTab('history')} className={`px-4 py-2 rounded-lg font-bold text-xs ${activeTab === 'history' ? 'bg-purple-100 text-purple-700' : 'text-slate-500'}`}>History</button>
          </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full p-6 gap-8">

        {/* LEFT PANEL: INPUTS */}
        <div className="w-full md:w-[450px] bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col">
          {activeTab === 'create' && (
            <div className="p-6 overflow-y-auto custom-scrollbar h-[calc(100vh-180px)]">
              {/* Type Grid */}
              <div className="grid grid-cols-4 gap-2 mb-8">
                {Object.keys(typeIcons).map((t) => {
                  const Icon = typeIcons[t];
                  return (
                    <button key={t} onClick={() => setType(t as QrType)} className={`flex flex-col items-center justify-center p-3 rounded-xl transition-all ${type === t ? 'bg-purple-600 text-white shadow-lg scale-105' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}>
                      <Icon className="h-5 w-5 mb-1" />
                      <span className="text-[8px] font-black">{t}</span>
                    </button>
                  )
                })}
              </div>

              {/* AI Assistant */}
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-2xl border border-purple-100 mb-8">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="text-xs font-black text-purple-900 uppercase">AI Smart Fill</span>
                </div>
                <div className="flex gap-2">
                  <input
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder={type === 'VCARD' ? "Paste email signature..." : type === 'EVENT' ? "Describe event..." : "Generate text..."}
                    className="flex-grow text-xs p-3 rounded-xl border border-purple-200 outline-none focus:ring-2 focus:ring-purple-400"
                  />
                  <button onClick={() => handleAiAction('content')} disabled={isAiLoading} className="bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition-all disabled:opacity-50">
                    {isAiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-purple-400 mt-2 leading-tight">Prompt AI to auto-fill fields for {type}.</p>
              </div>

              {/* Dynamic Inputs */}
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                {type === 'URL' && <input type="url" placeholder="https://website.com" value={value} onChange={e => setValue(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500" />}
                {type === 'TEXT' && <textarea rows={4} placeholder="Enter content..." value={value} onChange={e => setValue(e.target.value)} className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-purple-500" />}
                {type === 'EMAIL' && (
                  <div className="space-y-2">
                    <input type="email" placeholder="Recipient" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />
                    <input type="text" placeholder="Subject" value={subject} onChange={e => setSubject(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />
                    <textarea placeholder="Message" value={body} onChange={e => setBody(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />
                  </div>
                )}
                {type === 'WIFI' && (
                  <div className="space-y-2">
                    <input placeholder="SSID (Network Name)" value={ssid} onChange={e => setSsid(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />
                    <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />
                    <select value={encryption} onChange={e => setEncryption(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <option value="WPA">WPA/WPA2</option><option value="WEP">WEP</option><option value="nopass">No Password</option>
                    </select>
                  </div>
                )}

                {type === 'VCARD' && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <input placeholder="Full Name" value={vcName} onChange={e => setVcName(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />
                      <input placeholder="Phone" value={number} onChange={e => setNumber(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />
                    </div>
                    <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />
                    <input placeholder="Organization" value={vcOrg} onChange={e => setVcOrg(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />
                    <input placeholder="Job Title" value={vcTitle} onChange={e => setVcTitle(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />
                    <input placeholder="Website" value={vcUrl} onChange={e => setVcUrl(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />
                    <input placeholder="Address" value={vcAddress} onChange={e => setVcAddress(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />
                  </div>
                )}

                {type === 'EVENT' && (
                  <div className="space-y-2">
                    <input placeholder="Event Title" value={evTitle} onChange={e => setEvTitle(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />
                    <div className="grid grid-cols-2 gap-2">
                      <input type="datetime-local" value={evStart} onChange={e => setEvStart(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs" />
                      <input type="datetime-local" value={evEnd} onChange={e => setEvEnd(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs" />
                    </div>
                    <input placeholder="Location" value={evLoc} onChange={e => setEvLoc(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />
                    <textarea placeholder="Description" value={body} onChange={e => setBody(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />
                  </div>
                )}

                {type === 'PAYPAL' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest pl-1">PayPal.me Username</label>
                    <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3">
                      <span className="text-slate-500 font-bold">paypal.me/</span>
                      <input placeholder="username" value={value} onChange={e => setValue(e.target.value)} className="flex-grow bg-transparent outline-none font-bold text-slate-700" />
                    </div>
                  </div>
                )}

                {type === 'ZOOM' && (
                  <div className="space-y-2">
                    <input placeholder="Meeting ID" value={zoomId} onChange={e => setZoomId(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />
                    <input placeholder="Passcode" value={zoomPass} onChange={e => setZoomPass(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />
                  </div>
                )}

                {(type === 'CRYPTO') && (
                  <div className="space-y-2">
                    <select value={cryptoType} onChange={e => setCryptoType(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200"><option value="BTC">Bitcoin</option><option value="ETH">Ethereum</option></select>
                    <input placeholder="Wallet Address" value={cryptoAddress} onChange={e => setCryptoAddress(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />
                  </div>
                )}
                {(type === 'LOCATION') && (
                  <div className="flex gap-2">
                    <input placeholder="Latitude" value={lat} onChange={e => setLat(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />
                    <input placeholder="Longitude" value={long} onChange={e => setLong(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />
                  </div>
                )}
                {/* Fallback for others to just use value/body/number logic implied above */}
                {['PHONE', 'WHATSAPP', 'SMS'].includes(type) && (
                  <div className="space-y-2">
                    <input type="tel" placeholder="+1 234 567 8900" value={number} onChange={e => setNumber(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />
                    {type !== 'PHONE' && <textarea placeholder="Message..." value={body} onChange={e => setBody(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200" />}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'design' && (
            <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar h-[calc(100vh-180px)]">
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                <h3 className="text-xs font-black text-purple-900 uppercase mb-2">AI Design Assistant</h3>
                <div className="flex gap-2">
                  <input placeholder="Describe brand (e.g. Eco Friendly Cafe)" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} className="flex-grow text-xs p-2 rounded-lg border border-purple-200" />
                  <button onClick={() => handleAiAction('design')} className="bg-purple-600 text-white p-2 rounded-lg"><Palette className="h-4 w-4" /></button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">Foreground Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="h-10 w-full rounded-lg cursor-pointer" />
                    <input type="text" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-20 p-2 text-xs border rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">Background Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="h-10 w-full rounded-lg cursor-pointer" />
                    <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-20 p-2 text-xs border rounded-lg" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">Upload Logo (Overlay)</label>
                  <label className="flex items-center gap-2 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100">
                    <ImageIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-xs text-slate-600">Choose Image...</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  {logo && <button onClick={() => setLogo(null)} className="text-xs text-red-500 mt-2 flex items-center gap-1"><Trash2 className="h-3 w-3" /> Remove Logo</button>}
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 block mb-2">Margin & Resolution</label>
                  <input type="range" min="0" max="50" value={margin} onChange={e => setMargin(parseInt(e.target.value))} className="w-full mb-2" />
                  <select value={resolution} onChange={e => setResolution(parseInt(e.target.value))} className="w-full p-2 bg-slate-50 rounded-lg text-xs border">
                    <option value={500}>Low (500px)</option>
                    <option value={1000}>High (1000px)</option>
                    <option value={2000}>Ultra (2000px)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="p-6 overflow-y-auto custom-scrollbar h-[calc(100vh-180px)]">
              {savedQrs.length === 0 ? (
                <p className="text-center text-slate-400 text-sm mt-10">No saved QR codes yet.</p>
              ) : (
                <div className="space-y-3">
                  {savedQrs.map((qr) => (
                    <div key={qr.id} className="flex items-center gap-3 p-3 border rounded-xl hover:bg-slate-50">
                      <img src={qr.url} className="h-10 w-10 border rounded-lg" />
                      <div className="flex-grow overflow-hidden">
                        <p className="text-xs font-bold text-slate-800">{qr.type}</p>
                        <p className="text-[10px] text-slate-500 truncate">{qr.date}</p>
                      </div>
                      <button onClick={() => { setQrUrl(qr.url); setType(qr.type as any); setValue(qr.value); }} className="text-purple-600 text-xs font-bold">Load</button>
                    </div>
                  ))}
                </div>
              )}
              {savedQrs.length > 0 && <button onClick={() => { localStorage.removeItem('omni_qr_history'); setSavedQrs([]); }} className="w-full mt-4 text-xs text-red-500 bg-red-50 p-2 rounded-lg">Clear History</button>}
            </div>
          )}
        </div>

        {/* RIGHT PANEL: PREVIEW */}
        <div className="flex-grow bg-slate-100 rounded-3xl p-10 flex flex-col items-center justify-center relative overflow-hidden group">

          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/50 to-slate-200/50 pointer-events-none"></div>

          <div className="relative z-10 w-full max-w-sm">
            <div className="bg-white p-6 rounded-[40px] shadow-2xl border-4 border-white ring-1 ring-slate-100 transform transition-all hover:scale-105 duration-500">
              <div className="aspect-square bg-white rounded-[32px] flex items-center justify-center relative overflow-hidden">
                {qrUrl ? (
                  <div className="relative w-full h-full flex items-center justify-center">
                    <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain" />
                    {logo && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white p-1 rounded-full shadow-lg">
                          <img src={logo} className="h-10 w-10 object-contain rounded-full" />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-8 opacity-20">
                    <QrCode className="h-20 w-20 mx-auto mb-4" />
                    <p className="font-black uppercase tracking-widest">Generating...</p>
                  </div>
                )}
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-1">{type} QR CODE</p>
                {aiDesignSuggestion && <p className="text-[10px] text-green-500 font-bold mb-4">{aiDesignSuggestion}</p>}

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button onClick={() => downloadQr('png')} className="bg-slate-900 text-white py-3 rounded-xl font-bold text-xs hover:bg-black transition-all flex items-center justify-center gap-2">
                    <Download className="h-3 w-3" /> PNG
                  </button>
                  <button onClick={saveToHistory} className="bg-slate-100 text-slate-700 py-3 rounded-xl font-bold text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-2">
                    <Save className="h-3 w-3" /> Save
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats/Info */}
          <div className="mt-8 flex gap-6 opacity-40">
            <div className="flex flex-col items-center">
              <ShieldCheck className="h-5 w-5 mb-1" />
              <span className="text-[9px] uppercase font-bold">Secure</span>
            </div>
            <div className="flex flex-col items-center">
              <Layers className="h-5 w-5 mb-1" />
              <span className="text-[9px] uppercase font-bold">High Res</span>
            </div>
            <div className="flex flex-col items-center">
              <Settings className="h-5 w-5 mb-1" />
              <span className="text-[9px] uppercase font-bold">Custom</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
