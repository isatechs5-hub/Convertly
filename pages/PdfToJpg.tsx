import React, { useState } from 'react';
import { ArrowLeft, Download, Loader2, Image as ImageIcon, Plus } from 'lucide-react';
import { AppView } from '../types';
import { renderPdfToImages } from '../services/pdfUtils';

interface Props {
  setView: (view: AppView) => void;
}

export const PdfToJpg: React.FC<Props> = ({ setView }) => {
  const [file, setFile] = useState<File | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        if(selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setIsProcessing(true);
            try {
                const imgs = await renderPdfToImages(selectedFile);
                setImages(imgs);
            } catch (err) {
                console.error(err);
                alert("Could not convert PDF. Ensure PDF.js is loaded correctly.");
            } finally {
                setIsProcessing(false);
            }
        } else {
            alert("Please upload a PDF file.");
        }
    }
  };

  const downloadImage = (dataUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${file?.name.replace('.pdf', '')}_page_${index + 1}.jpg`;
    link.click();
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
       <div className="bg-white border-b border-slate-200 py-6 px-4 mb-8 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button onClick={() => setView(AppView.HOME)} className="flex items-center text-slate-500 hover:text-brand-600 font-medium transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" /> Back to Tools
            </button>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-brand-600" />
                PDF to JPG
            </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {!file ? (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ImageIcon className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Convert PDF to Images</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8">Extract every page of your PDF as a high-quality JPG image.</p>
                <label className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 cursor-pointer shadow-sm">
                    <Plus className="h-5 w-5 mr-2" />
                    Select PDF File
                    <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                </label>
            </div>
        ) : (
            <div>
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Converted Images ({images.length})</h2>
                    <button onClick={() => { setFile(null); setImages([]); }} className="text-slate-500 hover:text-red-500 text-sm">Convert Another</button>
                 </div>

                 {isProcessing ? (
                     <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                         <Loader2 className="h-10 w-10 animate-spin mb-4 text-brand-500" />
                         <p>Converting PDF pages...</p>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {images.map((img, idx) => (
                             <div key={idx} className="bg-white p-3 rounded-xl shadow-sm border border-slate-200">
                                 <img src={img} alt={`Page ${idx + 1}`} className="w-full h-auto border border-slate-100 rounded-lg mb-3 shadow-sm" />
                                 <div className="flex items-center justify-between px-1">
                                    <span className="text-sm font-medium text-slate-600">Page {idx + 1}</span>
                                    <button 
                                        onClick={() => downloadImage(img, idx)}
                                        className="flex items-center gap-1 text-xs font-bold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full hover:bg-brand-100 transition-colors"
                                    >
                                        <Download className="h-3 w-3" /> Download
                                    </button>
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
            </div>
        )}
      </div>
    </div>
  );
};