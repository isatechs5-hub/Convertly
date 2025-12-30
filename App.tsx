
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { AiPdfGenerator } from './pages/AiPdfGenerator';
import { AiPdfChat } from './pages/AiPdfChat';
import { MergePdf } from './pages/MergePdf';
import { SplitPdf } from './pages/SplitPdf';
import { RemovePages } from './pages/RemovePages';
import { ExtractPages } from './pages/ExtractPages';
import { OrganizePdf } from './pages/OrganizePdf';
import { PdfToJpg } from './pages/PdfToJpg';
import { ImageToPdf } from './pages/ImageToPdf';
import { CropPdf } from './pages/CropPdf';
import { RotatePdf } from './pages/RotatePdf';
import { ProtectPdf } from './pages/ProtectPdf';
import { UnlockPdf } from './pages/UnlockPdf';
import { WatermarkPdf } from './pages/WatermarkPdf';
import { NumberPdf } from './pages/NumberPdf';
import { OcrPdf } from './pages/OcrPdf';
import { SignPdf } from './pages/SignPdf';
import { ScanToPdf } from './pages/ScanToPdf';
import { EditPdf } from './pages/EditPdf';
import { CompressPdf } from './pages/CompressPdf';
import { GenericProcessPage } from './pages/GenericProcessPage';
import { OfficeConverter } from './pages/OfficeConverter';
import { GenericTool } from './pages/GenericTool';
import { QrGenerator } from './pages/QrGenerator';
import { About } from './pages/About';
import { Profile } from './pages/Profile';
import { Login } from './pages/Login';
import { ApiDashboard } from './pages/ApiDashboard';
import { TeamsPage, BlogPage, RoadmapPage, LegalPage } from './pages/StaticPages';
import { PaymentSuccess } from './pages/PaymentSuccess';
import { ComingSoon } from './pages/ComingSoon';
import { AppView } from './types';
import {
  Minimize, Wrench, Ghost, ShieldCheck, Search,
  UserCheck, Languages, Tag, ListOrdered, ShieldAlert,
  ArrowRightLeft, FileText, LayoutTemplate, PenTool, Check
} from 'lucide-react';
import {
  repairPdfDocument, compressPdfDocument, convertPdfToGrayscale,
  sanitizePdfMetadata, extractFullTextFromPdf, addBatesNumbering
} from './services/pdfUtils';
import { convertToMarkdown, scoreResume, translatePdfText } from './services/gemini';
import { GlobalAiAssistant } from './components/GlobalAiAssistant';

const Pricing = ({ setView }: { setView: (v: AppView) => void }) => {
  const [isYearly, setIsYearly] = useState(false);

  const handlePlanClick = (planName: string) => {
    if (planName === "Free") {
      setView(AppView.HOME);
      return;
    }

    let url = "";
    if (planName === "Pro") {
      // Monthly: $3, Yearly: $5
      url = isYearly ? "https://rzp.io/rzp/yb9YGrX" : "https://rzp.io/rzp/2wYVHi1";
    } else if (planName === "Max") {
      // Monthly: $5, Yearly: $10
      url = isYearly ? "https://rzp.io/rzp/CadM3sK" : "https://rzp.io/rzp/Pu3hzw9v";
    }

    if (url) {
      window.open(url, '_blank');
    }
  };

  // Prices updated as per request
  const plans = [
    {
      name: "Free",
      price: "0",
      features: [
        "Up to 5 files merge",
        "Standard AI Chat",
        "Limited OCR (2 pages)",
        "Basic PDF Editing",
        "Community Support"
      ],
      buttonText: "Current Plan",
      primary: false
    },
    {
      name: "Pro",
      price: isYearly ? "5" : "3",
      features: [
        "Unlimited merging",
        "Advanced AI PDF Chat",
        "OCR up to 100 pages",
        "Priority processing",
        "Email Support",
        "50 Converter Uses / Month",
        "Process up to 50 PDFs"
      ],
      buttonText: "Upgrade to Pro",
      primary: true
    },
    {
      name: "Max",
      price: isYearly ? "10" : "5",
      features: [
        "Everything in Pro",
        "Unlimited Converter Uses",
        "Unlimited PDF Processing",
        "Batch AI Document Creation",
        "Private On-Device OCR",
        "API Access (beta)",
        "24/7 Priority Support",
        "Dedicated Account Manager"
      ],
      buttonText: "Get Started Max",
      primary: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-20 px-6 transition-colors duration-300">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-4xl sm:text-6xl font-black mb-6 text-slate-900 dark:text-white tracking-tighter">Choose Your Plan</h2>
        <p className="text-slate-500 dark:text-slate-400 font-medium mb-12 text-lg">Scale your document workflow with advanced AI capabilities.</p>

        <div className="flex items-center justify-center gap-4 mb-16">
          <span className={`text-sm font-bold ${!isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className="w-14 h-8 bg-slate-200 dark:bg-slate-800 rounded-full relative transition-colors focus:outline-none"
          >
            <div className={`absolute top-1 left-1 w-6 h-6 bg-brand-600 rounded-full transition-transform ${isYearly ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
          <span className={`text-sm font-bold ${isYearly ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>Yearly <span className="text-brand-600 text-[10px] ml-1">Best Value</span></span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan.name} className={`bg-white dark:bg-slate-900 p-10 rounded-[40px] shadow-xl border ${plan.primary ? 'border-brand-500 ring-4 ring-brand-50 dark:ring-brand-900/10' : 'border-slate-100 dark:border-slate-800'} flex flex-col relative overflow-hidden group transition-all hover:-translate-y-2`}>
              {plan.primary && <div className="absolute top-0 left-0 w-full h-2 bg-brand-600"></div>}
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">{plan.name}</h3>
              <div className="flex items-end justify-center mb-8">
                <span className="text-5xl font-black text-slate-900 dark:text-white">${plan.price}</span>
                <span className="text-slate-400 font-bold ml-1 mb-1">{isYearly ? '/yr' : '/mo'}</span>
              </div>
              <ul className="text-left space-y-4 mb-10 flex-grow">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-slate-600 dark:text-slate-400 text-sm font-medium">
                    <Check className={`h-5 w-5 mt-0.5 flex-shrink-0 ${plan.primary ? 'text-brand-600' : 'text-slate-400'}`} />
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handlePlanClick(plan.name)}
                className={`w-full py-4 rounded-2xl font-black text-lg transition-all shadow-lg active:scale-95 ${plan.primary ? 'bg-brand-600 text-white hover:bg-brand-700' : 'bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700'}`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>

        <button onClick={() => setView(AppView.HOME)} className="mt-16 text-slate-500 dark:text-slate-400 font-bold hover:text-brand-600 transition-colors">
          Back to Home
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSetView = (view: AppView) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView(view);
      setIsTransitioning(false);
      window.scrollTo({ top: 0, behavior: 'instant' });
    }, 300);
  };

  useEffect(() => {
    // Check for Payment Success Query Params
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      const plan = params.get('plan') || 'pro';
      localStorage.setItem('user_plan', plan); // Persist Unlock

      // Clean URL
      window.history.replaceState({}, document.title, window.location.pathname);

      setCurrentView(AppView.PAYMENT_SUCCESS);
    }
  }, []);

  const renderView = () => {
    switch (currentView) {
      case AppView.HOME: return <Home setView={handleSetView} />;

      // Organize Section
      case AppView.MERGE_PDF: return <MergePdf setView={handleSetView} />;
      case AppView.SPLIT_PDF: return <SplitPdf setView={handleSetView} />;
      case AppView.REMOVE_PAGES: return <RemovePages setView={handleSetView} />;
      case AppView.EXTRACT_PAGES: return <ExtractPages setView={handleSetView} />;
      case AppView.ORGANIZE_PDF: return <OrganizePdf setView={handleSetView} />;
      case AppView.IMAGE_TO_PDF: return <ImageToPdf setView={handleSetView} />;
      case AppView.SCAN_TO_PDF: return <ScanToPdf setView={handleSetView} />;

      // Convert Section
      case AppView.WORD_TO_PDF: return <OfficeConverter setView={handleSetView} type="wordToPdf" />;
      case AppView.EXCEL_TO_PDF: return <OfficeConverter setView={handleSetView} type="excelToPdf" />;
      case AppView.POWERPOINT_TO_PDF: return <OfficeConverter setView={handleSetView} type="pptToPdf" />;
      case AppView.HTML_TO_PDF: return <GenericTool setView={handleSetView} type="html" />;
      // New To PDF
      case AppView.TXT_TO_PDF: return <OfficeConverter setView={handleSetView} type="txtToPdf" />;
      case AppView.RTF_TO_PDF: return <OfficeConverter setView={handleSetView} type="rtfToPdf" />;
      case AppView.PUB_TO_PDF: return <OfficeConverter setView={handleSetView} type="pubToPdf" />;
      case AppView.EPUB_TO_PDF: return <OfficeConverter setView={handleSetView} type="epubToPdf" />;
      case AppView.HEIC_TO_PDF: return <OfficeConverter setView={handleSetView} type="heicToPdf" />;
      case AppView.SQL_TO_PDF: return <OfficeConverter setView={handleSetView} type="sqlToPdf" />;
      // New Data & Dev
      case AppView.JSON_TO_PDF: return <OfficeConverter setView={handleSetView} type="jsonToPdf" />;
      case AppView.XML_TO_PDF: return <OfficeConverter setView={handleSetView} type="xmlToPdf" />;
      case AppView.CSV_TO_PDF: return <OfficeConverter setView={handleSetView} type="csvToPdf" />;
      case AppView.LOG_TO_PDF: return <OfficeConverter setView={handleSetView} type="logToPdf" />;
      // New Batch 2 (To PDF)
      case AppView.MD_TO_PDF: return <OfficeConverter setView={handleSetView} type="mdToPdf" />;
      case AppView.WEBP_TO_PDF: return <OfficeConverter setView={handleSetView} type="webpToPdf" />;
      case AppView.ODT_TO_PDF: return <OfficeConverter setView={handleSetView} type="odtToPdf" />;
      case AppView.ODS_TO_PDF: return <OfficeConverter setView={handleSetView} type="odsToPdf" />;
      case AppView.ODP_TO_PDF: return <OfficeConverter setView={handleSetView} type="odpToPdf" />;
      case AppView.TSV_TO_PDF: return <OfficeConverter setView={handleSetView} type="tsvToPdf" />;

      case AppView.PDF_TO_JPG: return <PdfToJpg setView={handleSetView} />;
      case AppView.PDF_TO_WORD: return <OfficeConverter setView={handleSetView} type="pdfToWord" />;
      case AppView.PDF_TO_EXCEL: return <OfficeConverter setView={handleSetView} type="pdfToExcel" />;
      case AppView.PDF_TO_POWERPOINT: return <OfficeConverter setView={handleSetView} type="pdfToPpt" />;
      case AppView.PDF_TO_PDFA: return <OfficeConverter setView={handleSetView} type="pdfToPdfa" />;
      // New From PDF
      case AppView.PDF_TO_EPUB: return <OfficeConverter setView={handleSetView} type="pdfToEpub" />;
      case AppView.PDF_TO_RTF: return <OfficeConverter setView={handleSetView} type="pdfToRtf" />;
      case AppView.PDF_TO_HTML: return <OfficeConverter setView={handleSetView} type="pdfToHtml" />;
      case AppView.PDF_TO_TEXT: return <OfficeConverter setView={handleSetView} type="pdfToText" />;
      // New Image/Data Extraction
      case AppView.PDF_TO_PNG: return <OfficeConverter setView={handleSetView} type="pdfToPng" />;
      case AppView.PDF_TO_TIFF: return <OfficeConverter setView={handleSetView} type="pdfToTiff" />;
      case AppView.PDF_TO_BMP: return <OfficeConverter setView={handleSetView} type="pdfToBmp" />;
      case AppView.PDF_TO_JSON: return <OfficeConverter setView={handleSetView} type="pdfToJson" />;
      case AppView.PDF_TO_XML: return <OfficeConverter setView={handleSetView} type="pdfToXml" />;
      case AppView.PDF_TO_CSV: return <OfficeConverter setView={handleSetView} type="pdfToCsv" />;
      // New Batch 2 (From PDF)
      case AppView.PDF_TO_MD: return <OfficeConverter setView={handleSetView} type="pdfToMd" />;
      case AppView.PDF_TO_WEBP: return <OfficeConverter setView={handleSetView} type="pdfToWebp" />;
      case AppView.PDF_TO_ODT: return <OfficeConverter setView={handleSetView} type="pdfToOdt" />;
      case AppView.PDF_TO_TSV: return <OfficeConverter setView={handleSetView} type="pdfToTsv" />;
      case AppView.PDF_TO_GIF: return <OfficeConverter setView={handleSetView} type="pdfToGif" />;
      case AppView.PDF_TO_SVG: return <OfficeConverter setView={handleSetView} type="pdfToSvg" />;

      // New Image to PDF Converters
      case AppView.PNG_TO_PDF: return <OfficeConverter setView={handleSetView} type="pngToPdf" />;
      case AppView.TIFF_TO_PDF: return <OfficeConverter setView={handleSetView} type="tiffToPdf" />;
      case AppView.BMP_TO_PDF: return <OfficeConverter setView={handleSetView} type="bmpToPdf" />;
      case AppView.GIF_TO_PDF: return <OfficeConverter setView={handleSetView} type="gifToPdf" />;
      case AppView.SVG_TO_PDF: return <OfficeConverter setView={handleSetView} type="svgToPdf" />;

      // 10 New Route Cases
      case AppView.JFIF_TO_PDF: return <OfficeConverter setView={handleSetView} type="jfifToPdf" />;
      case AppView.ICO_TO_PDF: return <OfficeConverter setView={handleSetView} type="icoToPdf" />;
      case AppView.RAW_TO_PDF: return <OfficeConverter setView={handleSetView} type="rawToPdf" />;
      case AppView.XPS_TO_PDF: return <OfficeConverter setView={handleSetView} type="xpsToPdf" />;
      case AppView.PDF_TO_JFIF: return <OfficeConverter setView={handleSetView} type="pdfToJfif" />;
      case AppView.PDF_TO_ICO: return <OfficeConverter setView={handleSetView} type="pdfToIco" />;
      case AppView.PDF_TO_RAW: return <OfficeConverter setView={handleSetView} type="pdfToRaw" />;
      case AppView.PDF_TO_XPS: return <OfficeConverter setView={handleSetView} type="pdfToXps" />;
      case AppView.PDF_TO_JPG_ZIP: return <OfficeConverter setView={handleSetView} type="pdfToJpgZip" />;
      case AppView.PDF_TO_PNG_ZIP: return <OfficeConverter setView={handleSetView} type="pdfToPngZip" />;


      // Edit Section
      case AppView.ROTATE_PDF: return <RotatePdf setView={handleSetView} />;
      case AppView.NUMBER_PDF: return <NumberPdf setView={handleSetView} />;
      case AppView.WATERMARK_PDF: return <WatermarkPdf setView={handleSetView} />;
      case AppView.CROP_PDF: return <CropPdf setView={handleSetView} />;
      case AppView.SIGN_PDF: return <SignPdf setView={handleSetView} />;
      case AppView.EDIT_PDF: return <EditPdf setView={handleSetView} />;
      case AppView.METADATA_EDITOR: return <GenericProcessPage setView={handleSetView} title="Metadata Editor" icon={Tag} description="Edit document Author, Title, and Date fields." action={(file) => repairPdfDocument(file)} />;
      case AppView.BATES_NUMBERING: return <GenericProcessPage setView={handleSetView} title="Bates Numbering" icon={ListOrdered} description="Apply sequential identification for legal files." action={(file) => addBatesNumbering(file, 'BATES')} />;

      // Security Section
      case AppView.UNLOCK_PDF: return <UnlockPdf setView={handleSetView} />;
      case AppView.PROTECT_PDF: return <ProtectPdf setView={handleSetView} />;
      case AppView.REDACT_PDF: return <GenericTool setView={handleSetView} type="redact" />;
      case AppView.COMPARE_PDF: return <GenericTool setView={handleSetView} type="compare" />;

      // Optimize/Repair Section
      case AppView.REPAIR_PDF: return <GenericProcessPage setView={handleSetView} title="Repair PDF" icon={Wrench} description="Fix damaged or corrupt PDF structures." action={repairPdfDocument} />;
      case AppView.COMPRESS_PDF: return <CompressPdf setView={handleSetView} />;
      case AppView.GRAYSCALE_PDF: return <GenericProcessPage setView={handleSetView} title="Grayscale PDF" icon={Ghost} description="Convert to B&W to save ink." action={convertPdfToGrayscale} />;
      case AppView.SANITIZE_PDF: return <GenericProcessPage setView={handleSetView} title="Sanitize PDF" icon={ShieldCheck} description="Remove all hidden tracking metadata." action={sanitizePdfMetadata} />;

      // AI Section
      case AppView.AI_CHAT: return <AiPdfChat setView={handleSetView} />;
      case AppView.AI_GENERATOR: return <AiPdfGenerator setView={handleSetView} />;
      case AppView.AI_RESUME_SCORER:
        return <GenericProcessPage setView={handleSetView} title="AI Resume Scorer" icon={UserCheck} description="Professional AI feedback on your CV." action={async (file) => {
          const text = await extractFullTextFromPdf(file);
          const feedback = await scoreResume(text);
          return new TextEncoder().encode(feedback);
        }} isTextResponse />;

      case AppView.AI_TRANSLATOR:
        return <GenericProcessPage setView={handleSetView} title="AI PDF Translator" icon={Languages} description="Translate your document content accurately." action={async (file) => {
          const text = await extractFullTextFromPdf(file);
          const translated = await translatePdfText(text, 'Hindi');
          return new TextEncoder().encode(translated);
        }} isTextResponse />;

      case AppView.AI_MARKDOWN:
        return <GenericProcessPage setView={handleSetView} title="AI to Markdown" icon={Search} description="Convert PDF content to clean Markdown." action={async (file) => {
          const text = await extractFullTextFromPdf(file);
          const md = await convertToMarkdown(text);
          return new TextEncoder().encode(md);
        }} isTextResponse />;

      // Auth & Static
      case AppView.LOGIN: return <Login setView={handleSetView} />;
      case AppView.QR_GENERATOR: return <QrGenerator setView={handleSetView} />;
      case AppView.ABOUT: return <About setView={handleSetView} />;
      case AppView.PAYMENT_SUCCESS: return <PaymentSuccess setView={handleSetView} />;

      case AppView.PRICING: return <Pricing setView={handleSetView} />;
      case AppView.API_PORTAL: return <ApiDashboard setView={handleSetView} />;
      case AppView.COMING_SOON: return <ComingSoon setView={handleSetView} title="API Portal" description="Our developer API is currently in closed beta." />;
      case AppView.TEAMS: return <TeamsPage setView={handleSetView} />;
      case AppView.BLOG: return <BlogPage setView={handleSetView} />;
      case AppView.ROADMAP: return <RoadmapPage setView={handleSetView} />;
      // Removed DOCUMENTATION case
      case AppView.PRIVACY_POLICY: return <LegalPage setView={handleSetView} type="privacy" />;
      case AppView.TERMS_OF_SERVICE: return <LegalPage setView={handleSetView} type="terms" />;
      case AppView.PROFILE: return <Profile setView={handleSetView} />;
      default: return <Home setView={handleSetView} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans selection:bg-brand-500 selection:text-white bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navbar currentView={currentView} setView={handleSetView} />
      <main className={`flex-grow transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {renderView()}
      </main>
      <Footer setView={handleSetView} />
      <GlobalAiAssistant currentView={currentView} setView={handleSetView} />
    </div>
  );
};

export default App;
