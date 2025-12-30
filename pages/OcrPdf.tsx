import React, { useState } from 'react';
import { ArrowLeft, Loader2, Search, Plus, Trash2, FileText } from 'lucide-react';
import { AppView } from '../types';
import { renderPdfToImages } from '../services/pdfUtils';

interface Props {
  setView: (view: AppView) => void;
}

export const OcrPdf: React.FC<Props> = ({ setView }) => {
  const [file, setFile] = useState<File | null>(null);
  const [ocrText, setOcrText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleOcr = async () => {
    if (!file || !window.Tesseract) return;
    setIsProcessing(true);
    setOcrText('');
    try {
      const images = await renderPdfToImages(file);
      const worker = await window.Tesseract.createWorker('eng', 1, {
        logger: (m: any) => {
            if (m.status === 'recognizing text') setProgress(Math.floor(m.progress * 100));
        }
      });
      
      let fullText = '';
      for (const img of images) {
        const { data: { text } } = await worker.recognize(img);
        fullText += text + '\n\n';
      }
      
      await worker.terminate();
      setOcrText(fullText);
    } catch (error) {
      alert("OCR failed.");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-white border-b border-slate-200 py-6 px-4 mb-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => setView(AppView.HOME)} className="flex items-center text-slate-500 hover:text-brand-600 font-medium">
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </button>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Search className="h-5 w-5 text-brand-600" /> OCR PDF
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
                <h2 className="text-xl font-bold mb-4">Input PDF</h2>
                {!file ? (
                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100">
                        <Plus className="w-10 h-10 text-slate-400 mb-2" />
                        <p className="text-slate-500">Upload Scanned PDF</p>
                        <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                    </label>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                            <span className="font-bold">{file.name}</span>
                            <button onClick={() => setFile(null)} className="text-red-500"><Trash2 className="h-5 w-5"/></button>
                        </div>
                        <button
                            onClick={handleOcr}
                            disabled={isProcessing}
                            className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
                        >
                            {isProcessing ? <Loader2 className="animate-spin h-6 w-6" /> : <Search className="h-6 w-6" />}
                            {isProcessing ? `OCR Processing (${progress}%)` : 'Recognize Text'}
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 flex flex-col h-[500px]">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><FileText className="h-5 w-5 text-brand-600"/> Extracted Text</h2>
                <div className="flex-grow bg-slate-50 rounded-xl p-4 overflow-auto font-mono text-sm border border-slate-100 whitespace-pre-wrap">
                    {ocrText || (isProcessing ? "Scanning document..." : "Extract text from scanned PDFs here.")}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};