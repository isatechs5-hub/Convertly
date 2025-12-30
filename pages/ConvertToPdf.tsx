import React, { useState } from 'react';
import { ArrowLeft, Download, Loader2, FileUp, Plus, Trash2, FileText, FileSpreadsheet, Image as ImageIcon } from 'lucide-react';
import { AppView } from '../types';
import { convertWordToPdf, convertExcelToPdf, convertImagesToPdf } from '../services/pdfUtils';

interface Props {
  setView: (view: AppView) => void;
}

export const ConvertToPdf: React.FC<Props> = ({ setView }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleConvert = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      let bytes: Uint8Array;
      const ext = file.name.split('.').pop()?.toLowerCase();

      if (ext === 'docx') {
        bytes = await convertWordToPdf(file);
      } else if (ext === 'xlsx' || ext === 'xls') {
        bytes = await convertExcelToPdf(file);
      } else if (['jpg', 'jpeg', 'png'].includes(ext || '')) {
        bytes = await convertImagesToPdf([file]);
      } else {
        alert("Unsupported file type for this converter.");
        return;
      }

      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.name.split('.')[0]}.pdf`;
      link.click();
    } catch (error) {
      console.error(error);
      alert("Conversion failed. Ensure the file is valid.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getIcon = () => {
    if (!file) return <FileUp className="h-8 w-8" />;
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'docx') return <FileText className="h-8 w-8 text-blue-600" />;
    if (ext === 'xlsx') return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
    return <ImageIcon className="h-8 w-8 text-orange-600" />;
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
      <div className="bg-white border-b border-slate-200 py-6 px-4 mb-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button onClick={() => setView(AppView.HOME)} className="flex items-center text-slate-500 hover:text-brand-600 font-medium transition-colors">
            <ArrowLeft className="h-5 w-5 mr-2" /> Back
          </button>
          <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <FileUp className="h-5 w-5 text-brand-600" /> Universal Converter
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                {getIcon()}
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Word, Excel, or Image to PDF</h2>
            <p className="text-slate-500">Fast, local, and secure conversion.</p>
          </div>

          {!file ? (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
              <Plus className="w-10 h-10 text-slate-400 mb-2" />
              <p className="text-sm text-slate-500 font-medium">Click to select DOCX, XLSX, or JPG</p>
              <input type="file" className="hidden" accept=".docx,.xlsx,.xls,.jpg,.jpeg,.png" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                {getIcon()}
                <div>
                  <p className="font-bold text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <button onClick={() => setFile(null)} className="text-red-500 p-2 hover:bg-red-50 rounded-lg"><Trash2 className="h-5 w-5" /></button>
            </div>
          )}

          {file && (
            <button
              onClick={handleConvert}
              disabled={isProcessing}
              className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              {isProcessing ? <Loader2 className="animate-spin h-6 w-6" /> : <Download className="h-6 w-6" />}
              {isProcessing ? 'Converting...' : 'Convert to PDF'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};