import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Download, Loader2, PenTool, Plus, Trash2, Eraser } from 'lucide-react';
import { AppView } from '../types';
import { signPdfDocument } from '../services/pdfUtils';

interface Props {
  setView: (view: AppView) => void;
}

export const SignPdf: React.FC<Props> = ({ setView }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
      }
    }
  }, [file]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) canvas.getContext('2d')?.beginPath();
  };

  const draw = (e: any) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0].clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0].clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setFile(e.target.files[0]);
  };

  const handleSign = async () => {
    if (!file || !canvasRef.current) return;
    setIsProcessing(true);
    try {
      const sigData = canvasRef.current.toDataURL('image/png');
      const bytes = await signPdfDocument(file, sigData);
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `signed_${file.name}`;
      link.click();
    } catch (error) {
      alert("Signing failed.");
    } finally {
      setIsProcessing(false);
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
            <PenTool className="h-5 w-5 text-brand-600" /> Sign PDF
          </h1>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          {!file ? (
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer bg-slate-50 hover:bg-slate-100">
              <Plus className="w-10 h-10 text-slate-400 mb-2" />
              <p className="text-slate-500">Upload PDF to Sign</p>
              <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
            </label>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700">{file.name}</span>
                <button onClick={() => setFile(null)} className="text-red-500"><Trash2 className="h-5 w-5"/></button>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Draw Your Signature</label>
                <div className="relative">
                  <canvas
                    ref={canvasRef}
                    width={600}
                    height={200}
                    className="signature-pad w-full h-[200px] bg-white shadow-inner"
                    onMouseDown={startDrawing}
                    onMouseUp={stopDrawing}
                    onMouseMove={draw}
                    onTouchStart={startDrawing}
                    onTouchEnd={stopDrawing}
                    onTouchMove={draw}
                  />
                  <button onClick={clearCanvas} className="absolute bottom-2 right-2 p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 flex items-center gap-1 text-xs">
                    <Eraser className="h-4 w-4" /> Clear
                  </button>
                </div>
              </div>

              <button
                onClick={handleSign}
                disabled={isProcessing}
                className="w-full py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="animate-spin h-6 w-6" /> : <PenTool className="h-6 w-6" />}
                Sign & Download PDF
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};