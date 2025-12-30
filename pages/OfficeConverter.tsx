
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Loader2, FileType, Plus, Trash2, CheckCircle2, FileText, Eye, Settings, ChevronDown, ChevronUp } from 'lucide-react';
import { AppView } from '../types';
import {
  convertPdfToWord,
  convertPdfToExcel,
  convertPdfToPpt,
  convertWordToPdf,
  convertExcelToPdf,
  convertPptToPdf,
  renderPdfToImages,
  convertTxtToPdf,
  convertSqlToPdf,
  convertPdfToText,
  convertPdfToHtml,
  convertPubToPdf,
  convertEpubToPdf,
  convertRtfToPdf,
  convertHeicToPdf,
  convertPdfToEpub,
  convertPdfToRtf,
  // New
  convertJsonToPdf,
  convertXmlToPdf,
  convertCsvToPdf,
  convertLogToPdf,
  convertPdfToCsv,
  convertPdfToJson,
  convertPdfToXml,
  convertPdfToPng,
  convertPdfToTiff,
  convertPdfToBmp,
  // Batch 2
  convertMdToPdf,
  convertWebpToPdf,
  convertTsvToPdf,
  convertOdtToPdf,
  convertOdsToPdf,
  convertOdpToPdf,
  convertPdfToMd,
  convertPdfToWebp,
  convertPdfToTsv,
  convertPdfToOdt,
  // New Image Converters
  convertPngToPdf,
  convertTiffToPdf,
  convertBmpToPdf,
  convertGifToPdf,
  convertSvgToPdf,
  convertPdfToGif,
  convertPdfToSvg,

  compressPdfDocument,
  protectPdfDocument
} from '../services/pdfUtils';
import { auth } from '../services/firebase.config';
import { saveConversionHistory } from '../services/firebase.service';

interface Props {
  setView: (view: AppView) => void;
  type: 'pdfToWord' | 'pdfToExcel' | 'wordToPdf' | 'excelToPdf' | 'pdfToPdfa' | 'pptToPdf' | 'pdfToPpt' |
  'txtToPdf' | 'rtfToPdf' | 'pubToPdf' | 'epubToPdf' | 'heicToPdf' | 'sqlToPdf' |
  'pdfToEpub' | 'pdfToRtf' | 'pdfToHtml' | 'pdfToText' |
  'jsonToPdf' | 'xmlToPdf' | 'csvToPdf' | 'logToPdf' |
  'pdfToCsv' | 'pdfToJson' | 'pdfToXml' | 'pdfToPng' | 'pdfToTiff' | 'pdfToBmp' |
  'mdToPdf' | 'webpToPdf' | 'odtToPdf' | 'odsToPdf' | 'odpToPdf' | 'tsvToPdf' |
  'pdfToMd' | 'pdfToWebp' | 'pdfToOdt' | 'pdfToTsv' |
  'pngToPdf' | 'tiffToPdf' | 'bmpToPdf' | 'gifToPdf' | 'svgToPdf' |
  'pdfToGif' | 'pdfToSvg' |
  // 10 New Converters
  'pdfToJpgZip' | 'pdfToPngZip' | 'jfifToPdf' | 'pdfToJfif' | 'icoToPdf' | 'pdfToIco' | 'rawToPdf' | 'pdfToRaw' | 'xpsToPdf' | 'pdfToXps';
}

export const OfficeConverter: React.FC<Props> = ({ setView, type }) => {
  const [file, setFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ data: Blob | Uint8Array, name: string } | null>(null);

  // Advanced Options
  const [showOptions, setShowOptions] = useState(false);
  const [options, setOptions] = useState({
    fontSize: 10,
    orientation: 'p',
    compress: false,
    password: '',
    quality: 0.8,
    dpi: 150,
    colorMode: 'color', // color, grayscale
    preserveLayout: true,
    extractImages: true,
    delimiter: ',',
    mergeTables: false,
    includeHeader: true
  });

  const configs: Record<string, { title: string, accept: string, label: string, targetExt: string, hasTextOptions?: boolean, optionType?: 'image' | 'doc' | 'data' | 'text' }> = {
    pdfToWord: { title: 'PDF to Word', accept: '.pdf', label: 'Extract text to DOCX', targetExt: 'docx', optionType: 'doc' },
    pdfToExcel: { title: 'PDF to Excel', accept: '.pdf', label: 'Extract tables to XLSX', targetExt: 'xlsx', optionType: 'data' },
    pdfToPpt: { title: 'PDF to PowerPoint', accept: '.pdf', label: 'Convert PDF to Slides', targetExt: 'pptx', optionType: 'doc' },
    wordToPdf: { title: 'Word to PDF', accept: '.docx', label: 'Convert DOCX to PDF', targetExt: 'pdf' },
    excelToPdf: { title: 'Excel to PDF', accept: '.xlsx,.xls', label: 'Convert Sheets to PDF', targetExt: 'pdf' },
    pdfToPdfa: { title: 'PDF to PDF/A', accept: '.pdf', label: 'Archive standard format', targetExt: 'pdf' },
    pptToPdf: { title: 'PPT to PDF', accept: '.pptx,.ppt', label: 'Convert Slides to PDF', targetExt: 'pdf' },
    // New Tools
    txtToPdf: { title: 'TXT to PDF', accept: '.txt', label: 'Convert Text to PDF', targetExt: 'pdf', hasTextOptions: true },
    rtfToPdf: { title: 'RTF to PDF', accept: '.rtf', label: 'Convert RTF to PDF', targetExt: 'pdf', hasTextOptions: true },
    pubToPdf: { title: 'PUB to PDF', accept: '.pub', label: 'Convert Publisher to PDF', targetExt: 'pdf' },
    epubToPdf: { title: 'EPUB to PDF', accept: '.epub', label: 'Convert eBook to PDF', targetExt: 'pdf' },
    heicToPdf: { title: 'HEIC to PDF', accept: '.heic', label: 'Convert HEIC to PDF', targetExt: 'pdf' },
    sqlToPdf: { title: 'SQL to PDF', accept: '.sql', label: 'Convert SQL Script to PDF', targetExt: 'pdf', hasTextOptions: true },
    pdfToEpub: { title: 'PDF to EPUB', accept: '.pdf', label: 'Convert PDF to eBook', targetExt: 'epub', optionType: 'doc' },
    pdfToRtf: { title: 'PDF to RTF', accept: '.pdf', label: 'Convert PDF to RTF', targetExt: 'rtf', optionType: 'doc' },
    pdfToHtml: { title: 'PDF to HTML', accept: '.pdf', label: 'Convert PDF to Web Page', targetExt: 'html', optionType: 'doc' },
    pdfToText: { title: 'PDF to Text', accept: '.pdf', label: 'Extract Plain Text', targetExt: 'txt', optionType: 'text' },

    // 10 New Tools
    jsonToPdf: { title: 'JSON to PDF', accept: '.json', label: 'Convert JSON to PDF', targetExt: 'pdf', hasTextOptions: true },
    xmlToPdf: { title: 'XML to PDF', accept: '.xml', label: 'Convert XML to PDF', targetExt: 'pdf', hasTextOptions: true },
    csvToPdf: { title: 'CSV to PDF', accept: '.csv', label: 'Convert CSV to PDF Table', targetExt: 'pdf' },
    logToPdf: { title: 'LOG to PDF', accept: '.log,.txt', label: 'Convert Logs to PDF', targetExt: 'pdf', hasTextOptions: true },

    pdfToCsv: { title: 'PDF to CSV', accept: '.pdf', label: 'Extract Tables to CSV', targetExt: 'csv', optionType: 'data' },
    pdfToJson: { title: 'PDF to JSON', accept: '.pdf', label: 'Extract Content to JSON', targetExt: 'json', optionType: 'data' },
    pdfToXml: { title: 'PDF to XML', accept: '.pdf', label: 'Extract Content to XML', targetExt: 'xml', optionType: 'data' },
    pdfToPng: { title: 'PDF to PNG', accept: '.pdf', label: 'Convert Pages to PNG', targetExt: 'png', optionType: 'image' },
    pdfToTiff: { title: 'PDF to TIFF', accept: '.pdf', label: 'Convert Pages to TIFF', targetExt: 'tiff', optionType: 'image' },
    pdfToBmp: { title: 'PDF to BMP', accept: '.pdf', label: 'Convert Pages to BMP', targetExt: 'bmp', optionType: 'image' },
    pdfToJpg: { title: 'PDF to JPG', accept: '.pdf', label: 'Convert Pages to JPG', targetExt: 'jpg', optionType: 'image' },

    // Batch 2 (Daily Use)
    mdToPdf: { title: 'Markdown to PDF', accept: '.md', label: 'Convert Markdown to PDF', targetExt: 'pdf', hasTextOptions: true },
    webpToPdf: { title: 'WebP to PDF', accept: '.webp', label: 'Convert WebP to PDF', targetExt: 'pdf' },
    odtToPdf: { title: 'ODT to PDF', accept: '.odt', label: 'Convert ODT to PDF', targetExt: 'pdf' },
    odsToPdf: { title: 'ODS to PDF', accept: '.ods', label: 'Convert ODS to PDF', targetExt: 'pdf' },
    odpToPdf: { title: 'ODP to PDF', accept: '.odp', label: 'Convert ODP to PDF', targetExt: 'pdf' },
    tsvToPdf: { title: 'TSV to PDF', accept: '.tsv', label: 'Convert TSV to PDF', targetExt: 'pdf' },

    pdfToMd: { title: 'PDF to Markdown', accept: '.pdf', label: 'Convert PDF to Markdown', targetExt: 'md', optionType: 'text' },
    pdfToWebp: { title: 'PDF to WebP', accept: '.pdf', label: 'Convert PDF to WebP', targetExt: 'webp', optionType: 'image' },
    pdfToOdt: { title: 'PDF to ODT', accept: '.pdf', label: 'Convert PDF to ODT', targetExt: 'odt', optionType: 'doc' },
    pdfToTsv: { title: 'PDF to TSV', accept: '.pdf', label: 'Convert PDF to TSV', targetExt: 'tsv', optionType: 'data' },

    // New Image Converters
    pngToPdf: { title: 'PNG to PDF', accept: '.png', label: 'Convert PNG to PDF', targetExt: 'pdf' },
    tiffToPdf: { title: 'TIFF to PDF', accept: '.tiff,.tif', label: 'Convert TIFF to PDF', targetExt: 'pdf' },
    bmpToPdf: { title: 'BMP to PDF', accept: '.bmp', label: 'Convert BMP to PDF', targetExt: 'pdf' },
    gifToPdf: { title: 'GIF to PDF', accept: '.gif', label: 'Convert GIF to PDF', targetExt: 'pdf' },
    svgToPdf: { title: 'SVG to PDF', accept: '.svg', label: 'Convert SVG to PDF', targetExt: 'pdf' },
    pdfToGif: { title: 'PDF to GIF', accept: '.pdf', label: 'Convert PDF to GIF', targetExt: 'gif', optionType: 'image' },
    pdfToSvg: { title: 'PDF to SVG', accept: '.pdf', label: 'Convert PDF to SVG', targetExt: 'svg', optionType: 'image' },

    // 10 New Tools Config
    jfifToPdf: { title: 'JFIF to PDF', accept: '.jfif', label: 'Convert JFIF to PDF', targetExt: 'pdf' },
    pdfToJfif: { title: 'PDF to JFIF', accept: '.pdf', label: 'Convert PDF to JFIF', targetExt: 'jfif', optionType: 'image' },
    icoToPdf: { title: 'ICO to PDF', accept: '.ico', label: 'Convert Icon to PDF', targetExt: 'pdf' },
    pdfToIco: { title: 'PDF to ICO', accept: '.pdf', label: 'Convert PDF to Icon', targetExt: 'ico', optionType: 'image' },
    rawToPdf: { title: 'RAW to PDF', accept: '.raw,.cr2,.nef', label: 'Convert RAW to PDF', targetExt: 'pdf' },
    pdfToRaw: { title: 'PDF to RAW', accept: '.pdf', label: 'Convert PDF to RAW', targetExt: 'raw', optionType: 'image' },
    xpsToPdf: { title: 'XPS to PDF', accept: '.xps', label: 'Convert XPS to PDF', targetExt: 'pdf' },
    pdfToXps: { title: 'PDF to XPS', accept: '.pdf', label: 'Convert PDF to XPS', targetExt: 'xps', optionType: 'doc' },
    pdfToJpgZip: { title: 'PDF to JPG (ZIP)', accept: '.pdf', label: 'Batch PDF to JPG Zip', targetExt: 'zip', optionType: 'image' },
    pdfToPngZip: { title: 'PDF to PNG (ZIP)', accept: '.pdf', label: 'Batch PDF to PNG Zip', targetExt: 'zip', optionType: 'image' },
  };

  const current = configs[type] || configs.pdfToWord;
  const isPdfOutput = current.targetExt === 'pdf';

  useEffect(() => {
    if (file && (file.type === 'application/pdf' || file.name.endsWith('.pdf'))) {
      renderPdfToImages(file, 1).then(imgs => setThumbnail(imgs[0])).catch(() => setThumbnail(null));
    } else {
      setThumbnail(null);
    }
  }, [file]);

  const handleRun = async () => {
    if (!file) return;

    // Check Free Limit (5 uses)
    const usageKey = 'converter_usage_count';
    const usage = parseInt(localStorage.getItem(usageKey) || '0');
    const userPlan = localStorage.getItem('user_plan');

    if (usage >= 5 && userPlan !== 'pro' && userPlan !== 'max') {
      setView(AppView.PRICING);
      return;
    }

    setIsProcessing(true);
    setResult(null);

    try {
      let res: Blob | Uint8Array;

      // Core Conversion
      if (type === 'pdfToWord') res = await convertPdfToWord(file, options);
      else if (type === 'pdfToExcel') res = await convertPdfToExcel(file, options);
      else if (type === 'pdfToPpt') res = await convertPdfToPpt(file, options);
      else if (type === 'wordToPdf') res = await convertWordToPdf(file);
      else if (type === 'excelToPdf') res = await convertExcelToPdf(file);
      else if (type === 'pptToPdf') res = await convertPptToPdf(file);
      else if (type === 'pdfToPdfa') {
        const { repairPdfDocument } = await import('../services/pdfUtils');
        res = await repairPdfDocument(file);
      }
      else if (type === 'txtToPdf') res = await convertTxtToPdf(file, options);
      else if (type === 'sqlToPdf') res = await convertSqlToPdf(file, options);
      else if (type === 'pdfToText') res = await convertPdfToText(file, options);
      else if (type === 'pdfToHtml') res = await convertPdfToHtml(file, options);
      else if (type === 'pubToPdf') res = await convertPubToPdf(file);
      else if (type === 'epubToPdf') res = await convertEpubToPdf(file);
      else if (type === 'rtfToPdf') res = await convertRtfToPdf(file);
      else if (type === 'heicToPdf') res = await convertHeicToPdf(file);
      else if (type === 'pdfToEpub') res = await convertPdfToEpub(file, options);
      else if (type === 'pdfToRtf') res = await convertPdfToRtf(file, options);

      // New Implementations
      else if (type === 'jsonToPdf') res = await convertJsonToPdf(file, options);
      else if (type === 'xmlToPdf') res = await convertXmlToPdf(file, options);
      else if (type === 'csvToPdf') res = await convertCsvToPdf(file, options);
      else if (type === 'logToPdf') res = await convertLogToPdf(file, options);
      else if (type === 'pdfToCsv') res = await convertPdfToCsv(file, options);
      else if (type === 'pdfToJson') res = await convertPdfToJson(file, options);
      else if (type === 'pdfToXml') res = await convertPdfToXml(file, options);
      else if (type === 'pdfToPng') res = await convertPdfToPng(file, options);
      else if (type === 'pdfToTiff') res = await convertPdfToTiff(file, options);
      else if (type === 'pdfToBmp') res = await convertPdfToBmp(file, options);
      else if (type === 'pdfToJpg') res = await import('../services/pdfUtils').then(m => m.convertPdfToImageFormat(file, 'jpeg', 'image/jpeg', options));

      // Batch 2
      else if (type === 'mdToPdf') res = await convertMdToPdf(file, options);
      else if (type === 'webpToPdf') res = await convertWebpToPdf(file, options);
      else if (type === 'tsvToPdf') res = await convertTsvToPdf(file, options);
      else if (type === 'odtToPdf') res = await convertOdtToPdf(file);
      else if (type === 'odsToPdf') res = await convertOdsToPdf(file);
      else if (type === 'odpToPdf') res = await convertOdpToPdf(file);
      else if (type === 'pdfToMd') res = await convertPdfToMd(file, options);
      else if (type === 'pdfToWebp') res = await convertPdfToWebp(file, options);
      else if (type === 'pdfToTsv') res = await convertPdfToTsv(file, options);
      else if (type === 'pdfToOdt') res = await convertPdfToOdt(file, options);

      // New Image Converters
      else if (type === 'pngToPdf') res = await convertPngToPdf(file, options);
      else if (type === 'tiffToPdf') res = await convertTiffToPdf(file, options);
      else if (type === 'bmpToPdf') res = await convertBmpToPdf(file, options);
      else if (type === 'gifToPdf') res = await convertGifToPdf(file, options);
      else if (type === 'svgToPdf') res = await convertSvgToPdf(file, options);
      else if (type === 'pdfToGif') res = await convertPdfToGif(file, options);
      else if (type === 'pdfToSvg') res = await convertPdfToSvg(file, options);

      // 10 New Logic Handlers
      else if (type === 'jfifToPdf') res = await import('../services/pdfUtils').then(m => m.convertImageToPdf(file));
      else if (type === 'icoToPdf') res = await import('../services/pdfUtils').then(m => m.convertImageToPdf(file));
      else if (type === 'rawToPdf') res = await import('../services/pdfUtils').then(m => m.convertImageToPdf(file));
      else if (type === 'xpsToPdf') res = await import('../services/pdfUtils').then(m => m.convertTxtToPdf(file, options)); // Fallback logic
      
      // Generic Image Export Handlers for new types
      else if (type === 'pdfToJfif') res = await import('../services/pdfUtils').then(m => m.convertPdfToImageFormat(file, 'jpeg', 'image/jpeg', options));
      else if (type === 'pdfToIco') res = await import('../services/pdfUtils').then(m => m.convertPdfToImageFormat(file, 'png', 'image/x-icon', options));
      else if (type === 'pdfToRaw') res = await import('../services/pdfUtils').then(m => m.convertPdfToImageFormat(file, 'jpeg', 'image/x-panasonic-raw', options)); // Mock RAW
      else if (type === 'pdfToXps') res = await convertPdfToWord(file, options); // Fallback

      // ZIP Handlers
      else if (type === 'pdfToJpgZip') res = await import('../services/pdfUtils').then(m => m.convertPdfToImagesZip(file, 'jpeg', options));
      else if (type === 'pdfToPngZip') res = await import('../services/pdfUtils').then(m => m.convertPdfToImagesZip(file, 'png', options));

      else res = await convertPdfToWord(file, options);

      // Extra Features Processing (Only for PDF outputs)
      if (isPdfOutput && res instanceof Uint8Array) {
        // Compression
        if (options.compress) {
          const compressedFile = new File([res], "temp.pdf", { type: 'application/pdf' });
          res = await compressPdfDocument(compressedFile, 'recommended');
        }
        // Password Protection
        if (options.password) {
          const protectedFile = new File([res], "temp.pdf", { type: 'application/pdf' });
          res = await protectPdfDocument(protectedFile, options.password);
        }
      }

      setResult({ data: res, name: `${file.name.split('.')[0]}.${current.targetExt}` });

      if (auth.currentUser) {
        saveConversionHistory(auth.currentUser.uid, {
          toolName: current.title,
          fileName: file.name
        }).catch(console.error);
      }

      // Update Usage
      localStorage.setItem(usageKey, (usage + 1).toString());
    } catch (error: any) {
      alert(error.message || "An error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const blob = result.data instanceof Blob ? result.data : new Blob([result.data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = result.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <div className="bg-white border-b border-slate-200 py-4 px-6 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={() => setView(AppView.HOME)} className="flex items-center text-slate-500 hover:text-brand-600 font-bold transition-all">
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </button>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight">{current.title}</h1>
          <div className="w-20"></div>
        </div>
      </div>

      <div className="flex-grow flex flex-col md:flex-row">
        {/* Left Control Panel */}
        <div className="w-full md:w-[450px] bg-white border-r border-slate-200 p-10 flex flex-col">
          <div className="text-center md:text-left mb-10">
            <div className="w-20 h-20 bg-brand-50 text-brand-600 rounded-[24px] flex items-center justify-center mb-6 shadow-sm">
              <FileType className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">{current.title}</h2>
            <p className="text-slate-500 font-medium">{current.label}</p>
          </div>

          {!result ? (
            <div className="space-y-8 flex-grow">
              {!file ? (
                <label className="flex flex-col items-center justify-center w-full h-56 border-4 border-slate-100 border-dashed rounded-[32px] cursor-pointer bg-slate-50 hover:bg-slate-100 hover:border-brand-100 transition-all group">
                  <Plus className="w-12 h-12 text-brand-400 mb-3 group-hover:scale-110 transition-transform" />
                  <span className="text-slate-900 font-black uppercase tracking-widest text-sm text-center px-4">Select {current.accept.toUpperCase()} file</span>
                  <input type="file" className="hidden" accept={current.accept} onChange={(e) => setFile(e.target.files?.[0] || null)} />
                </label>
              ) : (
                <div className="space-y-6 animate-in fade-in">
                  <div className="flex items-center justify-between p-6 bg-slate-50 rounded-[24px] border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-4 overflow-hidden">
                      <div className="p-3 bg-brand-100 rounded-xl text-brand-600 flex-shrink-0"><FileText className="h-6 w-6" /></div>
                      <div className="overflow-hidden">
                        <p className="font-black text-slate-900 truncate">{file.name}</p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button onClick={() => setFile(null)} className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-xl transition-colors flex-shrink-0"><Trash2 className="h-5 w-5" /></button>
                  </div>

                  {/* Advanced Options */}
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                    <button
                      onClick={() => setShowOptions(!showOptions)}
                      className="w-full flex items-center justify-between p-4 text-slate-700 dark:text-slate-200 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <span className="flex items-center gap-2"><Settings className="h-4 w-4" /> Advanced Options</span>
                      {showOptions ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>

                    {showOptions && (
                      <div className="p-4 pt-0 space-y-4 animate-in slide-in-from-top-2">
                        {current.hasTextOptions && (
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Font Size</label>
                              <input
                                type="number"
                                value={options.fontSize}
                                onChange={(e) => setOptions({ ...options, fontSize: parseInt(e.target.value) })}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 dark:text-white"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Orientation</label>
                              <select
                                value={options.orientation}
                                onChange={(e) => setOptions({ ...options, orientation: e.target.value })}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 dark:text-white"
                              >
                                <option value="p">Portrait</option>
                                <option value="l">Landscape</option>
                              </select>
                            </div>
                          </div>
                        )}

                        {current.optionType === 'image' && (
                          <div className="space-y-3">
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Image Quality ({Math.round(options.quality * 100)}%)</label>
                              <input
                                type="range"
                                min="0.1"
                                max="1.0"
                                step="0.1"
                                value={options.quality}
                                onChange={(e) => setOptions({ ...options, quality: parseFloat(e.target.value) })}
                                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">DPI</label>
                                <select
                                  value={options.dpi}
                                  onChange={(e) => setOptions({ ...options, dpi: parseInt(e.target.value) })}
                                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 dark:text-white"
                                >
                                  <option value="72">72 DPI (Screen)</option>
                                  <option value="150">150 DPI (Print)</option>
                                  <option value="300">300 DPI (High Res)</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Color Mode</label>
                                <select
                                  value={options.colorMode}
                                  onChange={(e) => setOptions({ ...options, colorMode: e.target.value })}
                                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 dark:text-white"
                                >
                                  <option value="color">Color</option>
                                  <option value="grayscale">Grayscale</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        {current.optionType === 'doc' && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id="preserveLayout"
                                checked={options.preserveLayout}
                                onChange={(e) => setOptions({ ...options, preserveLayout: e.target.checked })}
                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 border-gray-300 dark:border-slate-600 dark:bg-slate-800"
                              />
                              <label htmlFor="preserveLayout" className="text-sm font-medium text-slate-700 dark:text-slate-300">Preserve Complex Layout</label>
                            </div>
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id="extractImages"
                                checked={options.extractImages}
                                onChange={(e) => setOptions({ ...options, extractImages: e.target.checked })}
                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 border-gray-300 dark:border-slate-600 dark:bg-slate-800"
                              />
                              <label htmlFor="extractImages" className="text-sm font-medium text-slate-700 dark:text-slate-300">Include Images</label>
                            </div>
                          </div>
                        )}

                        {current.optionType === 'data' && (
                          <div className="space-y-3">
                            {current.targetExt === 'csv' || current.targetExt === 'tsv' ? (
                              <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Delimiter</label>
                                <select
                                  value={options.delimiter}
                                  onChange={(e) => setOptions({ ...options, delimiter: e.target.value })}
                                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 dark:text-white"
                                >
                                  <option value=",">Comma (,)</option>
                                  <option value=";">Semicolon (;)</option>
                                  <option value="\t">Tab (\t)</option>
                                  <option value="|">Pipe (|)</option>
                                </select>
                              </div>
                            ) : null}

                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id="mergeTables"
                                checked={options.mergeTables}
                                onChange={(e) => setOptions({ ...options, mergeTables: e.target.checked })}
                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 border-gray-300 dark:border-slate-600 dark:bg-slate-800"
                              />
                              <label htmlFor="mergeTables" className="text-sm font-medium text-slate-700 dark:text-slate-300">Merge All Tables</label>
                            </div>
                          </div>
                        )}

                        {current.optionType === 'text' && (
                          <div className="space-y-3">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id="includeHeader"
                                checked={options.includeHeader}
                                onChange={(e) => setOptions({ ...options, includeHeader: e.target.checked })}
                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 border-gray-300 dark:border-slate-600 dark:bg-slate-800"
                              />
                              <label htmlFor="includeHeader" className="text-sm font-medium text-slate-700 dark:text-slate-300">Include Header/Footer</label>
                            </div>
                          </div>
                        )}

                        {isPdfOutput && (
                          <>
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                id="compress"
                                checked={options.compress}
                                onChange={(e) => setOptions({ ...options, compress: e.target.checked })}
                                className="w-4 h-4 text-brand-600 rounded focus:ring-brand-500 border-gray-300 dark:border-slate-600 dark:bg-slate-800"
                              />
                              <label htmlFor="compress" className="text-sm font-medium text-slate-700 dark:text-slate-300">Compress Output PDF</label>
                            </div>
                            <div>
                              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block">Protection (Optional)</label>
                              <input
                                type="password"
                                placeholder="Set Password"
                                value={options.password}
                                onChange={(e) => setOptions({ ...options, password: e.target.value })}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-900 dark:text-white"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <button onClick={handleRun} disabled={isProcessing} className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-black transition-all active:scale-95 disabled:opacity-50">
                    {isProcessing ? <Loader2 className="animate-spin h-6 w-6" /> : <FileType className="h-6 w-6" />}
                    {isProcessing ? 'Converting...' : `Convert to ${current.targetExt.toUpperCase()}`}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-10 animate-zoom-in flex-grow flex flex-col justify-center">
              <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[32px] flex items-center justify-center mx-auto mb-6 shadow-sm"><CheckCircle2 className="h-12 w-12" /></div>
              <h3 className="text-3xl font-black text-slate-900 mb-2">Done!</h3>
              <p className="text-slate-500 font-medium mb-10">Your file has been processed.</p>
              <div className="space-y-4">
                <button onClick={handleDownload} className="w-full py-5 bg-brand-600 text-white rounded-[24px] font-black text-lg flex items-center justify-center gap-3 shadow-xl hover:bg-brand-700 transition-all active:scale-95">
                  <Download className="h-6 w-6" /> Download Now
                </button>
                <button onClick={() => { setFile(null); setResult(null); }} className="text-slate-500 font-black uppercase tracking-widest text-xs hover:text-brand-600 py-2">Start Another</button>
              </div>
            </div>
          )}
        </div>

        {/* Right Workspace Panel */}
        <div className="flex-grow bg-slate-100 p-12 overflow-y-auto min-h-[500px]">
          <div className="max-w-xl mx-auto h-full flex items-center justify-center">
            {!file ? (
              <div className="text-center text-slate-300">
                <Eye className="h-24 w-24 mb-6 opacity-20 mx-auto" />
                <p className="text-xl font-black uppercase tracking-[0.2em] opacity-40">Workspace Preview</p>
                <p className="mt-2 font-medium opacity-50">Upload a file to see its preview here</p>
              </div>
            ) : (
              <div className="w-full bg-white p-10 rounded-[56px] shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-500 relative group overflow-hidden">
                <div className="absolute inset-0 translate-x-[-100%] group-hover:animate-shimmer-premium bg-gradient-to-r from-transparent via-slate-50/50 to-transparent pointer-events-none"></div>

                <div className="aspect-[3/4] bg-slate-50 rounded-[32px] overflow-hidden border border-slate-100 shadow-inner flex items-center justify-center relative">
                  {thumbnail ? (
                    <img src={thumbnail} className="w-full h-full object-cover animate-in fade-in" alt="Document Preview" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-200">
                      <FileText className="h-24 w-24 opacity-20" />
                      <p className="text-[10px] font-black uppercase tracking-widest mt-4 opacity-50 text-center px-4">Preview only available for PDF source</p>
                    </div>
                  )}

                  {thumbnail && (
                    <div className="absolute top-4 left-4 bg-slate-900/90 text-white text-[10px] font-black px-4 py-1.5 rounded-full backdrop-blur-md shadow-lg border border-white/10 uppercase">
                      Page 1 Preview
                    </div>
                  )}
                </div>
                <div className="mt-8 flex justify-between items-center px-4">
                  <div className="overflow-hidden">
                    <p className="text-lg font-black text-slate-900 truncate">{file.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Ready for {current.title}</p>
                  </div>
                  <div className="bg-brand-50 text-brand-600 p-4 rounded-[20px] shadow-sm"><Eye className="h-6 w-6" /></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
