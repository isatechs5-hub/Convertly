import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, Loader2, LayoutTemplate, Plus, MoveUp, MoveDown, Trash2 } from 'lucide-react';
import { AppView } from '../types';
import { renderPdfToImages, reorderPdfPages } from '../services/pdfUtils';

interface Props {
  setView: (view: AppView) => void;
}

export const OrganizePdf: React.FC<Props> = ({ setView }) => {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState<{index: number, img: string}[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const selectedFile = e.target.files[0];
        if(selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setIsLoadingImages(true);
            try {
                const images = await renderPdfToImages(selectedFile);
                setPages(images.map((img, idx) => ({ index: idx, img })));
            } catch (err) {
                console.error(err);
                alert("Could not render PDF pages. Make sure PDF.js is loaded.");
            } finally {
                setIsLoadingImages(false);
            }
        } else {
            alert("Please upload a PDF file.");
        }
    }
  };

  const movePage = (currentIndex: number, direction: 'up' | 'down') => {
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === pages.length - 1) return;

    const newPages = [...pages];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Swap
    [newPages[currentIndex], newPages[targetIndex]] = [newPages[targetIndex], newPages[currentIndex]];
    setPages(newPages);
  };

  const handleSave = async () => {
    if (!file) return;
    setIsProcessing(true);
    try {
      const newOrder = pages.map(p => p.index);
      const bytes = await reorderPdfPages(file, newOrder);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `organized_${file.name}`;
      link.click();
    } catch (error) {
      console.error(error);
      alert("Failed to organize PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12">
       <div className="bg-white border-b border-slate-200 py-6 px-4 mb-8 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
            <button onClick={() => setView(AppView.HOME)} className="flex items-center text-slate-500 hover:text-brand-600 font-medium transition-colors">
                <ArrowLeft className="h-5 w-5 mr-2" /> Back to Tools
            </button>
            <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <LayoutTemplate className="h-5 w-5 text-brand-600" />
                Organize PDF
            </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4">
        {!file ? (
            <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-12 text-center">
                <div className="w-16 h-16 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <LayoutTemplate className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Organize PDF Pages</h2>
                <p className="text-slate-500 max-w-md mx-auto mb-8">Rearrange pages in your PDF file instantly.</p>
                <label className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-brand-600 hover:bg-brand-700 cursor-pointer shadow-sm">
                    <Plus className="h-5 w-5 mr-2" />
                    Select PDF File
                    <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                </label>
            </div>
        ) : (
            <div>
                 <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Drag/Move Pages to Reorder</h2>
                     <div className="flex gap-2">
                        <button onClick={() => setFile(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                        <button 
                            onClick={handleSave} 
                            disabled={isProcessing}
                            className="px-6 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 flex items-center gap-2"
                        >
                            {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : <Download className="h-4 w-4" />}
                            Save PDF
                        </button>
                     </div>
                 </div>

                 {isLoadingImages ? (
                     <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                         <Loader2 className="h-10 w-10 animate-spin mb-4 text-brand-500" />
                         <p>Rendering pages...</p>
                     </div>
                 ) : (
                     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                         {pages.map((page, idx) => (
                             <div key={idx} className="bg-white p-2 rounded-lg shadow-sm border border-slate-200 group relative">
                                 <div className="absolute top-2 left-2 bg-slate-900/70 text-white text-xs px-2 py-0.5 rounded">
                                     {idx + 1}
                                 </div>
                                 <img src={page.img} alt={`Page ${page.index + 1}`} className="w-full h-auto border border-slate-100 rounded mb-2" />
                                 <div className="flex justify-between gap-1">
                                     <button onClick={() => movePage(idx, 'up')} disabled={idx === 0} className="flex-1 bg-slate-100 hover:bg-slate-200 p-1 rounded disabled:opacity-30 flex justify-center">
                                         <MoveUp className="h-4 w-4 text-slate-600" />
                                     </button>
                                     <button onClick={() => movePage(idx, 'down')} disabled={idx === pages.length - 1} className="flex-1 bg-slate-100 hover:bg-slate-200 p-1 rounded disabled:opacity-30 flex justify-center">
                                         <MoveDown className="h-4 w-4 text-slate-600" />
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