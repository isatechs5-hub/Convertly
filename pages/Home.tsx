import React from 'react';
import { AppView, Tool } from '../types';
import { ToolCard } from '../components/ToolCard';
import {
  Files, Scissors, Trash2, LayoutTemplate, Scan,
  Image, FileType, Printer, FileInput, FileOutput, Shield,
  RotateCw, Hash, Stamp, PenTool, Lock, Unlock,
  Search, Minimize, Wrench, FilePlus, ShieldAlert, Sparkles, MoveRight,
  ShieldCheck, Zap, Globe, Wand2, FileText, BookOpen, Database
} from 'lucide-react';

interface HomeProps {
  setView: (view: AppView) => void;
}

export const Home: React.FC<HomeProps> = ({ setView }) => {
  const categories = [
    {
      title: "Organize & Optimize",
      tools: [
        { id: 'merge', title: 'Merge PDF', description: 'Combine multiple PDFs into one unified document.', icon: Files, view: AppView.MERGE_PDF },
        { id: 'split', title: 'Split PDF', description: 'Extract pages from your PDF or save each page separately.', icon: Scissors, view: AppView.SPLIT_PDF },
        { id: 'remove', title: 'Remove Pages', description: 'Delete selected pages from your document with ease.', icon: Trash2, view: AppView.REMOVE_PAGES },
        { id: 'organize', title: 'Organize PDF', description: 'Sort, add and delete PDF pages. Drag and drop to reorder.', icon: LayoutTemplate, view: AppView.ORGANIZE_PDF },
        { id: 'compress', title: 'Compress PDF', description: 'Reduce file size while maximizing quality.', icon: Minimize, view: AppView.COMPRESS_PDF },
        { id: 'repair', title: 'Repair PDF', description: 'Recover data from damaged or corrupt documents.', icon: Wrench, view: AppView.REPAIR_PDF },
        { id: 'ocr', title: 'OCR PDF', description: 'Make scanned PDFs searchable and selectable.', icon: Search, view: AppView.OCR_PDF, isNew: true },
        { id: 'scan', title: 'Scan to PDF', description: 'Convert camera shots or images into professional PDFs.', icon: Scan, view: AppView.SCAN_TO_PDF },
      ]
    },
    {
      title: "Convert To PDF",
      tools: [
        { id: 'jpg-to-pdf', title: 'JPG to PDF', description: 'Convert images to PDF in seconds.', icon: Image, view: AppView.IMAGE_TO_PDF },
        { id: 'png-to-pdf', title: 'PNG to PDF', description: 'Convert PNG images to PDF documents.', icon: Image, view: AppView.PNG_TO_PDF, isNew: true },
        { id: 'gif-to-pdf', title: 'GIF to PDF', description: 'Convert animated GIFs to PDF.', icon: Image, view: AppView.GIF_TO_PDF, isNew: true },
        { id: 'bmp-to-pdf', title: 'BMP to PDF', description: 'Convert BMP images to PDF.', icon: Image, view: AppView.BMP_TO_PDF, isNew: true },
        { id: 'tiff-to-pdf', title: 'TIFF to PDF', description: 'Convert TIFF images to PDF.', icon: Image, view: AppView.TIFF_TO_PDF, isNew: true },
        { id: 'svg-to-pdf', title: 'SVG to PDF', description: 'Convert vector SVG to PDF.', icon: Image, view: AppView.SVG_TO_PDF, isNew: true },
        { id: 'word-to-pdf', title: 'WORD to PDF', description: 'Convert DOCX files to professional PDF.', icon: FileType, view: AppView.WORD_TO_PDF },
        { id: 'excel-to-pdf', title: 'EXCEL to PDF', description: 'Convert spreadsheets while preserving layout.', icon: FilePlus, view: AppView.EXCEL_TO_PDF },
        { id: 'ppt-to-pdf', title: 'PPT to PDF', description: 'Turn slides into easy-to-read PDF documents.', icon: FileInput, view: AppView.POWERPOINT_TO_PDF },
        { id: 'html-to-pdf', title: 'HTML to PDF', description: 'Save any web page as a PDF document.', icon: Printer, view: AppView.HTML_TO_PDF },
        { id: 'txt-to-pdf', title: 'TXT to PDF', description: 'Convert plain text files to PDF documents.', icon: FileText, view: AppView.TXT_TO_PDF, isNew: true },
        { id: 'rtf-to-pdf', title: 'RTF to PDF', description: 'Convert Rich Text Format files to PDF.', icon: FileText, view: AppView.RTF_TO_PDF, isNew: true },
        { id: 'pub-to-pdf', title: 'PUB to PDF', description: 'Convert Microsoft Publisher files to PDF.', icon: LayoutTemplate, view: AppView.PUB_TO_PDF, isNew: true },
        { id: 'epub-to-pdf', title: 'EPUB to PDF', description: 'Convert eBooks to PDF for easy reading.', icon: BookOpen, view: AppView.EPUB_TO_PDF, isNew: true },
        { id: 'heic-to-pdf', title: 'HEIC to PDF', description: 'Convert iPhone HEIC photos to PDF.', icon: Image, view: AppView.HEIC_TO_PDF, isNew: true },
        { id: 'sql-to-pdf', title: 'SQL to PDF', description: 'Convert SQL database scripts to PDF.', icon: Database, view: AppView.SQL_TO_PDF, isNew: true },
        { id: 'json-to-pdf', title: 'JSON to PDF', description: 'Convert JSON data files to readable PDF.', icon: FileText, view: AppView.JSON_TO_PDF, isNew: true },
        { id: 'xml-to-pdf', title: 'XML to PDF', description: 'Convert XML structure to PDF document.', icon: FileText, view: AppView.XML_TO_PDF, isNew: true },
        { id: 'csv-to-pdf', title: 'CSV to PDF', description: 'Convert CSV spreadsheets to PDF tables.', icon: FilePlus, view: AppView.CSV_TO_PDF, isNew: true },
        { id: 'log-to-pdf', title: 'LOG to PDF', description: 'Convert server logs to PDF archive.', icon: FileText, view: AppView.LOG_TO_PDF, isNew: true },
        { id: 'md-to-pdf', title: 'Markdown to PDF', description: 'Convert Markdown documentation to PDF.', icon: FileText, view: AppView.MD_TO_PDF, isNew: true },
        { id: 'webp-to-pdf', title: 'WebP to PDF', description: 'Convert WebP images to PDF.', icon: Image, view: AppView.WEBP_TO_PDF, isNew: true },
        { id: 'odt-to-pdf', title: 'ODT to PDF', description: 'Convert OpenOffice Writer to PDF.', icon: FileText, view: AppView.ODT_TO_PDF, isNew: true },
        { id: 'ods-to-pdf', title: 'ODS to PDF', description: 'Convert OpenOffice Sheets to PDF.', icon: FilePlus, view: AppView.ODS_TO_PDF, isNew: true },
        { id: 'odp-to-pdf', title: 'ODP to PDF', description: 'Convert OpenOffice Slides to PDF.', icon: FileOutput, view: AppView.ODP_TO_PDF, isNew: true },
        { id: 'tsv-to-pdf', title: 'TSV to PDF', description: 'Convert TSV data to PDF.', icon: Database, view: AppView.TSV_TO_PDF, isNew: true },
        // New Added Converters
        { id: 'jfif-to-pdf', title: 'JFIF to PDF', description: 'Convert JFIF images to PDF.', icon: Image, view: AppView.JFIF_TO_PDF, isNew: true },
        { id: 'ico-to-pdf', title: 'ICO to PDF', description: 'Convert Icon files to PDF.', icon: Image, view: AppView.ICO_TO_PDF, isNew: true },
        { id: 'raw-to-pdf', title: 'RAW to PDF', description: 'Convert RAW photos to PDF.', icon: Image, view: AppView.RAW_TO_PDF, isNew: true },
        { id: 'xps-to-pdf', title: 'XPS to PDF', description: 'Convert XPS documents to PDF.', icon: FileText, view: AppView.XPS_TO_PDF, isNew: true },
      ]
    },
    {
      title: "Convert From PDF",
      tools: [
        { id: 'pdf-to-jpg', title: 'PDF to JPG', description: 'Extract all images or convert pages to JPG.', icon: Image, view: AppView.PDF_TO_JPG },
        { id: 'pdf-to-png', title: 'PDF to PNG', description: 'Convert PDF pages to high-quality PNG.', icon: Image, view: AppView.PDF_TO_PNG, isNew: true },
        { id: 'pdf-to-gif', title: 'PDF to GIF', description: 'Convert PDF pages to GIF format.', icon: Image, view: AppView.PDF_TO_GIF, isNew: true },
        { id: 'pdf-to-bmp', title: 'PDF to BMP', description: 'Convert PDF to Bitmap image.', icon: Image, view: AppView.PDF_TO_BMP, isNew: true },
        { id: 'pdf-to-tiff', title: 'PDF to TIFF', description: 'Convert PDF to TIFF format.', icon: Image, view: AppView.PDF_TO_TIFF, isNew: true },
        { id: 'pdf-to-webp', title: 'PDF to WebP', description: 'Convert PDF to WebP images.', icon: Image, view: AppView.PDF_TO_WEBP, isNew: true },
        { id: 'pdf-to-svg', title: 'PDF to SVG', description: 'Convert PDF to vector SVG.', icon: Image, view: AppView.PDF_TO_SVG, isNew: true },
        { id: 'pdf-to-word', title: 'PDF to WORD', description: 'Convert PDFs to editable Word documents.', icon: FileOutput, view: AppView.PDF_TO_WORD },
        { id: 'pdf-to-excel', title: 'PDF to EXCEL', description: 'Export PDF table data to Excel sheets.', icon: FileOutput, view: AppView.PDF_TO_EXCEL },
        { id: 'pdf-to-ppt', title: 'PDF to PPT', description: 'Convert PDF files to editable presentations.', icon: FileOutput, view: AppView.PDF_TO_POWERPOINT },
        { id: 'pdf-to-pdfa', title: 'PDF to PDF/A', description: 'Archive PDFs in long-term standard format.', icon: Shield, view: AppView.PDF_TO_PDFA },
        { id: 'pdf-to-epub', title: 'PDF to EPUB', description: 'Convert PDF documents to eBook format.', icon: BookOpen, view: AppView.PDF_TO_EPUB, isNew: true },
        { id: 'pdf-to-rtf', title: 'PDF to RTF', description: 'Convert PDF to Rich Text Format.', icon: FileText, view: AppView.PDF_TO_RTF, isNew: true },
        { id: 'pdf-to-html', title: 'PDF to HTML', description: 'Convert PDF to web pages (HTML5).', icon: Globe, view: AppView.PDF_TO_HTML, isNew: true },
        { id: 'pdf-to-text', title: 'PDF to Text', description: 'Extract plain text from PDF documents.', icon: FileText, view: AppView.PDF_TO_TEXT, isNew: true },
        { id: 'pdf-to-json', title: 'PDF to JSON', description: 'Extract PDF content to JSON format.', icon: Database, view: AppView.PDF_TO_JSON, isNew: true },
        { id: 'pdf-to-xml', title: 'PDF to XML', description: 'Extract PDF content to XML format.', icon: Database, view: AppView.PDF_TO_XML, isNew: true },
        { id: 'pdf-to-csv', title: 'PDF to CSV', description: 'Extract PDF tables to CSV.', icon: FilePlus, view: AppView.PDF_TO_CSV, isNew: true },
        { id: 'pdf-to-md', title: 'PDF to Markdown', description: 'Convert PDF to Markdown.', icon: FileText, view: AppView.PDF_TO_MD, isNew: true },
        { id: 'pdf-to-odt', title: 'PDF to ODT', description: 'Convert PDF to OpenOffice Writer.', icon: FileText, view: AppView.PDF_TO_ODT, isNew: true },
        { id: 'pdf-to-tsv', title: 'PDF to TSV', description: 'Extract PDF tables to TSV.', icon: Database, view: AppView.PDF_TO_TSV, isNew: true },
        // New Added Converters
        { id: 'pdf-to-jfif', title: 'PDF to JFIF', description: 'Convert PDF to JFIF format.', icon: Image, view: AppView.PDF_TO_JFIF, isNew: true },
        { id: 'pdf-to-ico', title: 'PDF to ICO', description: 'Convert PDF to Icon format.', icon: Image, view: AppView.PDF_TO_ICO, isNew: true },
        { id: 'pdf-to-raw', title: 'PDF to RAW', description: 'Convert PDF to RAW image.', icon: Image, view: AppView.PDF_TO_RAW, isNew: true },
        { id: 'pdf-to-xps', title: 'PDF to XPS', description: 'Convert PDF to XPS format.', icon: FileText, view: AppView.PDF_TO_XPS, isNew: true },
      ]
    },
    {
      title: "Edit & AI",
      tools: [
        { id: 'edit-pdf', title: 'Edit PDF', description: 'Add text, shapes, and annotations easily.', icon: PenTool, view: AppView.EDIT_PDF },
        { id: 'sign', title: 'Sign PDF', description: 'E-sign documents securely with signatures.', icon: PenTool, view: AppView.SIGN_PDF },
        { id: 'watermark', title: 'Watermark', description: 'Protect files with text or image overlays.', icon: Stamp, view: AppView.WATERMARK_PDF },
        { id: 'ai-gen', title: 'AI Generator', description: 'Generate professional PDFs from simple prompts.', icon: Wand2, view: AppView.AI_GENERATOR, isAi: true },
        { id: 'ai-chat', title: 'AI Chat', description: 'Talk to your documents and get instant answers.', icon: Sparkles, view: AppView.AI_CHAT, isAi: true },
      ]
    },
    {
      title: "Security & More",
      tools: [
        { id: 'protect', title: 'Protect PDF', description: 'Secure documents with strong encryption.', icon: Lock, view: AppView.PROTECT_PDF },
        { id: 'unlock', title: 'Unlock PDF', description: 'Remove password and restrictions instantly.', icon: Unlock, view: AppView.UNLOCK_PDF },
        { id: 'redact', title: 'Redact PDF', description: 'Permanently hide sensitive document info.', icon: ShieldAlert, view: AppView.REDACT_PDF },
        { id: 'rotate', title: 'Rotate PDF', description: 'Rotate pages to the correct orientation permanently.', icon: RotateCw, view: AppView.ROTATE_PDF },
        { id: 'numbers', title: 'Page Numbers', description: 'Add sequential numbering to your PDF pages.', icon: Hash, view: AppView.NUMBER_PDF },
      ]
    }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="relative pt-24 pb-24 px-6 overflow-hidden bg-slate-50 dark:bg-slate-950">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-brand-500/10 blur-[150px] rounded-full"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-900 dark:text-white text-[11px] font-black uppercase tracking-[0.25em] mb-10 shadow-xl animate-content-fade">
            <div className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></div>
            Professional PDF Suite
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white mb-8 tracking-tighter leading-none animate-premium-reveal">
            Document work, <span className="text-brand-600 bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-rose-500">Elevated.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 mb-12 max-w-2xl mx-auto font-medium leading-relaxed animate-premium-reveal [animation-delay:0.15s]">
            The most powerful suite of PDF tools, built for professionals who demand speed, security, and AI-driven insights.
          </p>

          <div className="flex justify-center gap-12 flex-wrap animate-premium-reveal [animation-delay:0.3s] my-8">
            <button
              onClick={() => document.getElementById('all-tools')?.scrollIntoView({ behavior: 'smooth' })}
              className="group px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[12px] font-black text-sm shadow-2xl hover:bg-brand-600 dark:hover:bg-brand-600 dark:hover:text-white transition-all active:scale-95 flex items-center gap-2 animate-bounce"
            >
              Get Started <MoveRight className="h-3 w-3 group-hover:translate-x-2 transition-transform" />
            </button>
            <button
              onClick={() => setView(AppView.PRICING)}
              className="px-12 py-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-[12px] font-black text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm animate-pulse"
            >
              View Plans
            </button>
          </div>

          {/* Social Proof / Trust */}
          <div className="mt-24 pt-12 border-t border-slate-200/50 dark:border-slate-800/50 animate-premium-reveal [animation-delay:0.5s]">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-8">Trusted by Teams at</p>
            <div className="flex flex-wrap justify-center items-center gap-12 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all duration-700">
              {['Stripe', 'Figma', 'Linear', 'Revolut', 'Vercel'].map(brand => (
                <span key={brand} className="text-2xl font-black tracking-tighter">{brand}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="bg-white dark:bg-[#020617] py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { icon: ShieldCheck, title: "100% Secure", text: "End-to-end encryption. Your files never stay on our servers after processing." },
              { icon: Zap, title: "Blazing Speed", text: "Optimized for speed using local WASM processing. No server delays." },
              { icon: Globe, title: "Any Device", text: "Fully responsive workspace that works in any browser, anywhere." }
            ].map((feat, i) => (
              <div key={i} className="text-center group">
                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-900 text-brand-600 rounded-3xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all shadow-sm border border-slate-100 dark:border-slate-800">
                  <feat.icon className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">{feat.title}</h3>
                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">{feat.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Grid Section */}
      <div id="all-tools" className="max-w-7xl mx-auto px-6 py-24 pb-40">
        {categories.map((category, cIdx) => (
          <div key={category.title} className="mb-24 last:mb-0">
            <div className="flex items-center gap-6 mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">{category.title}</h2>
              <div className="h-1 flex-grow bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full w-24 bg-brand-500 animate-[shimmerPremium_3s_infinite_linear]"></div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 grid-stagger">
              {category.tools.map((tool) => (
                <ToolCard
                  key={tool.id}
                  tool={tool as any}
                  onClick={(t) => setView(t.view)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Floating CTA */}
      <div className="px-6 py-24 bg-slate-900 dark:bg-slate-950 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-brand-600/5 blur-[100px]"></div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-10 tracking-tighter leading-none animate-pulse">Ready to revolutionize <br /> your document flow?</h2>
          <button
            onClick={() => setView(AppView.PRICING)}
            className="px-12 py-5 bg-white text-slate-900 rounded-[28px] font-black text-2xl hover:bg-brand-600 hover:text-white shadow-2xl transition-all hover:scale-110 active:scale-95 animate-bounce"
          >
            Upgrade to Pro
          </button>
          <p className="mt-10 text-slate-500 font-bold uppercase tracking-[0.3em] text-xs animate-pulse">Used by 2M+ users monthly</p>
        </div>
      </div>
    </div>
  );
};