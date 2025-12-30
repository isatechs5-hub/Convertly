
import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Download, Loader2, PenTool, Type, Trash2, Plus, Move, Eraser, Square, Circle as CircleIcon, MousePointer, Undo, Redo, FileSignature, X, GripVertical, Highlighter, Image as ImageIcon, Layers, Stamp, Eye, EyeOff, Calendar, CheckCircle, XCircle, ArrowRight, AlignCenter, Lock, Unlock, PaintBucket, Bold, Italic, Underline, Baseline } from 'lucide-react';
import { AppView } from '../types';
import { renderPdfToImages, saveEditedPdf, extractPageTextItems } from '../services/pdfUtils';
import { generateDocumentContent } from '../services/openrouter';

interface Props {
    setView: (view: AppView) => void;
}

type ToolType = 'select' | 'draw' | 'text' | 'rect' | 'circle' | 'whiteout' | 'edit-text' | 'highlight' | 'image' | 'stamp';

interface TextObject {
    id: string;
    x: number;
    y: number;
    text: string;
    fontSize: number;
    fontFamily: string;
    color: string;
    backgroundColor?: string;
    width?: number;
    height?: number;
    opacity?: number;
    locked?: boolean;
    isBold?: boolean;
    isItalic?: boolean;
    isUnderline?: boolean;
}

interface ImageObject {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    src: string;
    opacity: number;
    locked?: boolean;
}

interface RedactionObject {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
}

interface DrawingPath {
    tool: 'draw' | 'highlight' | 'whiteout';
    points: { x: number, y: number }[];
    color: string;
    width: number;
    opacity: number;
}

export const EditPdf: React.FC<Props> = ({ setView }) => {
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Tool State
    const [tool, setTool] = useState<ToolType>('select');
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(3);
    const [fontSize, setFontSize] = useState(16);
    const [opacity, setOpacity] = useState(1.0);

    // Canvas & Edits State
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);

    // Undo/Redo Stacks per page
    const [history, setHistory] = useState<Record<number, DrawingPath[][]>>({});
    const [redoStack, setRedoStack] = useState<Record<number, DrawingPath[][]>>({});
    const [currentPaths, setCurrentPaths] = useState<Record<number, DrawingPath[]>>({}); // Active paths on current page

    const [textObjects, setTextObjects] = useState<Record<number, TextObject[]>>({});
    const [imageObjects, setImageObjects] = useState<Record<number, ImageObject[]>>({});
    const [redactions, setRedactions] = useState<Record<number, RedactionObject[]>>({});

    const startPos = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
    const currentPath = useRef<DrawingPath | null>(null);

    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [selectedType, setSelectedType] = useState<'text' | 'image' | null>(null);
    const [draggedId, setDraggedId] = useState<string | null>(null);
    const dragOffset = useRef<{ x: number, y: number }>({ x: 0, y: 0 });

    // Resizing State
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState<string | null>(null);
    const resizeStartRef = useRef<{ x: number, y: number, w: number, h: number, fontSize: number, objX: number, objY: number }>({ x: 0, y: 0, w: 0, h: 0, fontSize: 0, objX: 0, objY: 0 });

    // Initialize Canvas for a page
    useEffect(() => {
        if (pages.length > 0 && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = pages[currentPage];

            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                redrawCanvas();
            };
        }
    }, [currentPage, pages, currentPaths]);

    // AI Command Listener
    useEffect(() => {
        const handleAiCommand = async (e: Event) => {
            const customEvent = e as CustomEvent;
            const prompt = customEvent.detail?.prompt;
            if (!prompt) return;

            setIsProcessing(true);
            try {
                const lower = prompt.toLowerCase();

                // 1. Color Commands (Heuristic)
                let newColor = null;
                if (lower.includes('blue')) newColor = '#2563eb';
                else if (lower.includes('red')) newColor = '#dc2626';
                else if (lower.includes('green')) newColor = '#16a34a';
                else if (lower.includes('black')) newColor = '#000000';
                else if (lower.includes('purple')) newColor = '#9333ea';

                if (newColor) {
                    setColor(newColor);
                    // Update all text on current page
                    setTextObjects(prev => ({
                        ...prev,
                        [currentPage]: (prev[currentPage] || []).map(t => ({ ...t, color: newColor! }))
                    }));
                }

                // 2. Smart Editing Commands (AI Driven)
                if (lower.includes('change') || lower.includes('replace') || lower.includes('typo') || lower.includes('remove') || lower.includes('delete')) {
                    const instruction = `User Request: "${prompt}"
                    Analyze this request for PDF editing.
                    Return strictly valid JSON with one of these structures:
                    1. Text Replacement: {"action": "replace", "find": "exact text to find", "replace": "new text"}
                    2. Deletion: {"action": "delete", "target": "text content to find and remove"}
                    
                    If the user wants to remove/delete text, use action "delete".
                    If the user wants to change/replace text, use action "replace".
                    If unsure, return {"error": "true"}.`;

                    const response = await generateDocumentContent(instruction, 'raw-text');
                    try {
                        const plan = JSON.parse(response.replace(/```json|```/g, '').trim());
                        
                        if (plan.action === 'replace' && plan.find && plan.replace) {
                            setTextObjects(prev => ({
                                ...prev,
                                [currentPage]: (prev[currentPage] || []).map(t => {
                                    if (t.text.toLowerCase().includes(plan.find.toLowerCase())) {
                                        return { ...t, text: t.text.replace(new RegExp(plan.find, 'gi'), plan.replace) };
                                    }
                                    return t;
                                })
                            }));
                        } else if (plan.action === 'delete' && plan.target) {
                             // Create redactions for found text
                             const textsToDelete = (textObjects[currentPage] || []).filter(t => 
                                 t.text.toLowerCase().includes(plan.target.toLowerCase())
                             );
                             
                             if (textsToDelete.length > 0) {
                                 // We don't just remove them from textObjects because if they are from PDF extraction, 
                                 // we might want to "redact" them visually if they are underlying PDF text.
                                 // But here textObjects are overlay objects (either user added or extracted).
                                 // If they are extracted, removing them from state removes them from "edit layer" 
                                 // but NOT from the background image unless we add a whiteout.
                                 
                                 // Strategy: Add whiteout (redaction) over them AND remove from textObjects
                                 
                                 const newRedactions: RedactionObject[] = textsToDelete.map(t => ({
                                     id: Date.now() + Math.random().toString(),
                                     x: t.x,
                                     y: t.y - (t.fontSize * 0.8), // Adjust for baseline
                                     width: t.text.length * (t.fontSize * 0.6), // Estimate width
                                     height: t.fontSize * 1.2
                                 }));

                                 setRedactions(prev => ({
                                     ...prev,
                                     [currentPage]: [...(prev[currentPage] || []), ...newRedactions]
                                 }));

                                 // Remove from text objects so they are not re-rendered
                                 setTextObjects(prev => ({
                                     ...prev,
                                     [currentPage]: prev[currentPage].filter(t => !t.text.toLowerCase().includes(plan.target.toLowerCase()))
                                 }));
                             }
                        }
                    } catch (err) {
                        console.log("AI Parse error", err);
                    }
                }
            } catch (error) {
                console.error("AI Command Failed", error);
            } finally {
                setIsProcessing(false);
            }
        };

        window.addEventListener('ai-edit-command', handleAiCommand);
        return () => window.removeEventListener('ai-edit-command', handleAiCommand);
    }, [currentPage]);


    const redrawCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw all paths
        const paths = currentPaths[currentPage] || [];
        paths.forEach(path => {
            ctx.beginPath();
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = path.color;
            ctx.lineWidth = path.width;
            ctx.globalAlpha = path.opacity;
            if (path.tool === 'highlight') {
                ctx.globalCompositeOperation = 'multiply';
                ctx.lineCap = 'square';
            } else {
                ctx.globalCompositeOperation = 'source-over';
            }

            if (path.points.length > 0) {
                ctx.moveTo(path.points[0].x, path.points[0].y);
                path.points.forEach(p => ctx.lineTo(p.x, p.y));
            }
            ctx.stroke();
        });

        // Reset context
        ctx.globalAlpha = 1.0;
        ctx.globalCompositeOperation = 'source-over';
    };

    const changePage = (idx: number) => {
        setCurrentPage(idx);
        setSelectedId(null);
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const f = e.target.files[0];
            setFile(f);
            setIsProcessing(true);
            try {
                const images = await renderPdfToImages(f);
                setPages(images);
                setCurrentPaths({});
                setTextObjects({});
                setImageObjects({});
                setRedactions({});
                setHistory({});
                setRedoStack({});
                setCurrentPage(0);
            } catch (err) {
                alert("Failed to render PDF for editing.");
            } finally {
                setIsProcessing(false);
            }
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const src = event.target?.result as string;
                const img = new Image();
                img.onload = () => {
                    // Scale down if too big
                    let width = img.width;
                    let height = img.height;
                    const maxSize = 300;
                    if (width > maxSize || height > maxSize) {
                        const ratio = width / height;
                        if (width > height) {
                            width = maxSize;
                            height = maxSize / ratio;
                        } else {
                            height = maxSize;
                            width = maxSize * ratio;
                        }
                    }

                    const newImg: ImageObject = {
                        id: Date.now().toString(),
                        x: 100,
                        y: 100,
                        width,
                        height,
                        src,
                        opacity: 1.0
                    };
                    setImageObjects(prev => ({
                        ...prev,
                        [currentPage]: [...(prev[currentPage] || []), newImg]
                    }));
                    setSelectedId(newImg.id);
                    setSelectedType('image');
                    setTool('select');
                };
                img.src = src;
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    // Drawing Logic
    const getPoint = (e: React.MouseEvent | React.TouchEvent) => {
        if (!canvasRef.current) return { x: 0, y: 0 };
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;

        let clientX = 0;
        let clientY = 0;

        if ('touches' in e) {
            const touch = e.touches[0] || e.changedTouches[0];
            if (touch) {
                clientX = touch.clientX;
                clientY = touch.clientY;
            }
        } else {
            clientX = (e as React.MouseEvent).clientX;
            clientY = (e as React.MouseEvent).clientY;
        }

        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY,
        };
    };

    const startDrawing = async (e: React.MouseEvent | React.TouchEvent) => {
        const { x, y } = getPoint(e);

        if (tool === 'select') return;

        if (tool === 'text') {
            const newId = Date.now().toString();
            const newText: TextObject = {
                id: newId,
                x: x,
                y: y,
                text: 'Type here',
                fontSize: fontSize,
                fontFamily: 'Arial',
                color: color,
                opacity: opacity,
                isBold: false,
                isItalic: false,
                isUnderline: false
            };
            setTextObjects(prev => ({
                ...prev,
                [currentPage]: [...(prev[currentPage] || []), newText]
            }));
            setSelectedId(newId);
            setSelectedType('text');
            setTool('select');
            return;
        }

        if (tool === 'edit-text' && file) {
            try {
                const items = await extractPageTextItems(file, currentPage);
                const hitItem = items.find(item => {
                    return x >= item.x && x <= item.x + item.width &&
                        y >= item.y && y <= item.y + item.height * 1.5;
                });

                if (hitItem) {
                    const redId = Date.now().toString() + '_red';
                    const redaction: RedactionObject = {
                        id: redId,
                        x: hitItem.x,
                        y: hitItem.y,
                        width: hitItem.width,
                        height: Math.max(hitItem.height, hitItem.fontSize * 2.0) // Ensure enough height to cover
                    };
                    setRedactions(prev => ({
                        ...prev,
                        [currentPage]: [...(prev[currentPage] || []), redaction]
                    }));

                    const textId = Date.now().toString() + '_txt';
                    const textObj: TextObject = {
                        id: textId,
                        x: hitItem.x,
                        y: hitItem.y + (hitItem.height * 0.8),
                        text: hitItem.text,
                        fontSize: hitItem.fontSize * 2.0, // Scale by 2.0 to match canvas resolution
                        fontFamily: 'Arial',
                        color: color,
                        opacity: 1
                    };
                    setTextObjects(prev => ({
                        ...prev,
                        [currentPage]: [...(prev[currentPage] || []), textObj]
                    }));
                    setSelectedId(textId);
                    setSelectedType('text');
                    setTool('select');
                    return;
                }
            } catch (err) {
                console.error("Text extraction failed", err);
            }
        }

        if (['draw', 'highlight', 'whiteout'].includes(tool)) {
            setIsDrawing(true);
            currentPath.current = {
                tool: tool as any,
                points: [{ x, y }],
                color: tool === 'whiteout' ? '#ffffff' : color,
                width: tool === 'highlight' ? 30 : (tool === 'whiteout' ? 20 : lineWidth),
                opacity: tool === 'highlight' ? 0.35 : opacity // Transparent highlighter
            };

            // Immediate visual feedback
            const ctx = canvasRef.current?.getContext('2d');
            if (ctx) {
                ctx.beginPath();
                ctx.moveTo(x, y);
            }
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing || !currentPath.current || !canvasRef.current) return;

        const { x, y } = getPoint(e);
        currentPath.current.points.push({ x, y });

        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
            ctx.lineCap = currentPath.current.tool === 'highlight' ? 'square' : 'round';
            ctx.lineJoin = 'round';
            ctx.strokeStyle = currentPath.current.color;
            ctx.lineWidth = currentPath.current.width;
            ctx.globalAlpha = currentPath.current.opacity;
            if (currentPath.current.tool === 'highlight') {
                ctx.globalCompositeOperation = 'multiply';
            } else {
                ctx.globalCompositeOperation = 'source-over';
            }

            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const stopDrawing = () => {
        if (!isDrawing || !currentPath.current) return;

        setIsDrawing(false);

        // Save to history
        const newPath = currentPath.current;
        setCurrentPaths(prev => {
            const pagePaths = prev[currentPage] || [];
            return {
                ...prev,
                [currentPage]: [...pagePaths, newPath]
            };
        });

        // Add to Undo Stack
        setHistory(prev => ({
            ...prev,
            [currentPage]: [...(prev[currentPage] || []), [...(currentPaths[currentPage] || [])]]
        }));

        // Clear Redo
        setRedoStack(prev => ({
            ...prev,
            [currentPage]: []
        }));

        currentPath.current = null;
        redrawCanvas(); // Ensure clean render
    };

    // Undo / Redo
    const handleUndo = () => {
        const pageHistory = history[currentPage] || [];
        if (pageHistory.length === 0) return;

        const previousState = pageHistory[pageHistory.length - 1];
        const newHistory = pageHistory.slice(0, -1);

        setRedoStack(prev => ({
            ...prev,
            [currentPage]: [...(prev[currentPage] || []), currentPaths[currentPage] || []]
        }));

        setHistory(prev => ({
            ...prev,
            [currentPage]: newHistory
        }));

        setCurrentPaths(prev => ({
            ...prev,
            [currentPage]: previousState
        }));
    };

    const handleRedo = () => {
        const pageRedo = redoStack[currentPage] || [];
        if (pageRedo.length === 0) return;

        const nextState = pageRedo[pageRedo.length - 1];
        const newRedo = pageRedo.slice(0, -1);

        setHistory(prev => ({
            ...prev,
            [currentPage]: [...(prev[currentPage] || []), currentPaths[currentPage] || []]
        }));

        setRedoStack(prev => ({
            ...prev,
            [currentPage]: newRedo
        }));

        setCurrentPaths(prev => ({
            ...prev,
            [currentPage]: nextState
        }));
    };

    // Dragging Logic
    const handleObjectDragStart = (e: React.MouseEvent, id: string, type: 'text' | 'image') => {
        if (tool !== 'select') return;
        e.stopPropagation();

        // Check lock status
        if (type === 'text') {
            const t = textObjects[currentPage].find(x => x.id === id);
            if (t?.locked) {
                setSelectedId(id);
                setSelectedType('text');
                return;
            }
        } else {
            const i = imageObjects[currentPage].find(x => x.id === id);
            if (i?.locked) {
                setSelectedId(id);
                setSelectedType('image');
                return;
            }
        }

        setSelectedId(id);
        setSelectedType(type);
        setDraggedId(id);

        const { x, y } = getPoint(e);
        let objX = 0, objY = 0;

        if (type === 'text') {
            const obj = textObjects[currentPage].find(t => t.id === id);
            if (obj) { objX = obj.x; objY = obj.y; }
        } else {
            const obj = imageObjects[currentPage].find(i => i.id === id);
            if (obj) { objX = obj.x; objY = obj.y; }
        }

        dragOffset.current = { x: x - objX, y: y - objY };
    };

    // Resizing Logic
    const handleResizeStart = (e: React.MouseEvent, handle: string, id: string, type: 'text' | 'image') => {
        e.stopPropagation();
        e.preventDefault();

        const { x, y } = getPoint(e);
        let obj: any = null;

        if (type === 'image') {
            obj = imageObjects[currentPage]?.find(i => i.id === id);
        } else {
            obj = textObjects[currentPage]?.find(t => t.id === id);
        }

        if (!obj) return;

        setIsResizing(true);
        setResizeHandle(handle);
        setSelectedId(id);
        setSelectedType(type);

        resizeStartRef.current = {
            x,
            y,
            w: obj.width || 0,
            h: obj.height || 0,
            fontSize: obj.fontSize || 0,
            objX: obj.x,
            objY: obj.y
        };
    };

    const handleObjectDragMove = (e: React.MouseEvent) => {
        // Handle Resizing
        if (isResizing && selectedId && resizeHandle) {
            const { x, y } = getPoint(e);
            const dx = x - resizeStartRef.current.x;
            const dy = y - resizeStartRef.current.y;

            if (selectedType === 'image') {
                setImageObjects(prev => ({
                    ...prev,
                    [currentPage]: prev[currentPage].map(img => {
                        if (img.id !== selectedId) return img;

                        let newW = resizeStartRef.current.w;
                        let newH = resizeStartRef.current.h;
                        let newX = resizeStartRef.current.objX;
                        let newY = resizeStartRef.current.objY;

                        if (resizeHandle.includes('e')) newW += dx;
                        if (resizeHandle.includes('w')) { newW -= dx; newX += dx; }
                        if (resizeHandle.includes('s')) newH += dy;
                        if (resizeHandle.includes('n')) { newH -= dy; newY += dy; }

                        if (newW < 20) newW = 20;
                        if (newH < 20) newH = 20;

                        return { ...img, x: newX, y: newY, width: newW, height: newH };
                    })
                }));
            } else if (selectedType === 'text') {
                setTextObjects(prev => ({
                    ...prev,
                    [currentPage]: prev[currentPage].map(txt => {
                        if (txt.id !== selectedId) return txt;

                        // Text scaling logic for all corners
                        let delta = 0;
                        if (resizeHandle === 'se') delta = dx + dy;
                        else if (resizeHandle === 'sw') delta = -dx + dy;
                        else if (resizeHandle === 'ne') delta = dx - dy;
                        else if (resizeHandle === 'nw') delta = -dx - dy;

                        const scale = Math.max(0.1, 1 + delta / 200);
                        let newSize = resizeStartRef.current.fontSize * scale;

                        if (newSize < 8) newSize = 8;
                        if (newSize > 200) newSize = 200;

                        return { ...txt, fontSize: newSize };
                    })
                }));
            }
            return;
        }

        if (!draggedId || tool !== 'select') return;
        const { x, y } = getPoint(e);

        if (selectedType === 'text') {
            setTextObjects(prev => ({
                ...prev,
                [currentPage]: prev[currentPage].map(t =>
                    t.id === draggedId
                        ? { ...t, x: x - dragOffset.current.x, y: y - dragOffset.current.y }
                        : t
                )
            }));
        } else if (selectedType === 'image') {
            setImageObjects(prev => ({
                ...prev,
                [currentPage]: prev[currentPage].map(i =>
                    i.id === draggedId
                        ? { ...i, x: x - dragOffset.current.x, y: y - dragOffset.current.y }
                        : i
                )
            }));
        }
    };

    const handleObjectDragEnd = () => {
        setDraggedId(null);
        setIsResizing(false);
        setResizeHandle(null);
    };

    const updateTextContent = (id: string, newText: string) => {
        setTextObjects(prev => ({
            ...prev,
            [currentPage]: prev[currentPage].map(t => t.id === id ? { ...t, text: newText } : t)
        }));
    };

    const deleteSelected = () => {
        if (!selectedId) return;
        if (selectedType === 'text') {
            setTextObjects(prev => ({
                ...prev,
                [currentPage]: prev[currentPage].filter(t => t.id !== selectedId)
            }));
        } else {
            setImageObjects(prev => ({
                ...prev,
                [currentPage]: prev[currentPage].filter(i => i.id !== selectedId)
            }));
        }
        setSelectedId(null);
    };

    const handleSave = async () => {
        if (!file) return;
        setIsProcessing(true);

        try {
            const finalPagesData: { pageIndex: number, imageData: string }[] = [];
            const allEditedPages = new Set([
                ...Object.keys(currentPaths).map(Number),
                ...Object.keys(textObjects).map(Number),
                ...Object.keys(imageObjects).map(Number),
                ...Object.keys(redactions).map(Number)
            ]);

            for (const pageIdx of allEditedPages) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d')!;

                // 1. Base Image
                const img = new Image();
                img.src = pages[pageIdx];
                await new Promise(r => img.onload = r);
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.drawImage(img, 0, 0);

                // 2. Redactions
                if (redactions[pageIdx]) {
                    ctx.fillStyle = '#ffffff';
                    redactions[pageIdx].forEach(r => ctx.fillRect(r.x, r.y, r.width, r.height));
                }

                // 3. Drawings
                const paths = currentPaths[pageIdx] || [];
                paths.forEach(path => {
                    ctx.beginPath();
                    ctx.lineCap = 'round';
                    ctx.lineJoin = 'round';
                    ctx.strokeStyle = path.color;
                    ctx.lineWidth = path.width;
                    ctx.globalAlpha = path.opacity;
                    if (path.tool === 'highlight') {
                        ctx.globalCompositeOperation = 'multiply';
                        ctx.lineCap = 'square';
                    } else {
                        ctx.globalCompositeOperation = 'source-over';
                    }
                    if (path.points.length > 0) {
                        ctx.moveTo(path.points[0].x, path.points[0].y);
                        path.points.forEach(p => ctx.lineTo(p.x, p.y));
                    }
                    ctx.stroke();
                });
                ctx.globalAlpha = 1.0;
                ctx.globalCompositeOperation = 'source-over';

                // 4. Images
                if (imageObjects[pageIdx]) {
                    for (const imgObj of imageObjects[pageIdx]) {
                        const i = new Image();
                        i.src = imgObj.src;
                        await new Promise(r => i.onload = r);
                        ctx.globalAlpha = imgObj.opacity;
                        ctx.drawImage(i, imgObj.x, imgObj.y, imgObj.width, imgObj.height);
                    }
                    ctx.globalAlpha = 1.0;
                }

                // 5. Text
                if (textObjects[pageIdx]) {
                    textObjects[pageIdx].forEach(t => {
                        if (!t.text) return;
                        if (!t.text) return;
                        const weight = t.isBold ? 'bold' : 'normal';
                        const style = t.isItalic ? 'italic' : 'normal';
                        ctx.font = `${style} ${weight} ${t.fontSize}px ${t.fontFamily || 'Arial'}`;

                        // Background Color (Highlight)
                        if (t.backgroundColor) {
                            const metrics = ctx.measureText(t.text);
                            const bgHeight = t.fontSize;
                            const bgWidth = metrics.width;
                            ctx.fillStyle = t.backgroundColor;
                            ctx.fillRect(t.x, t.y - bgHeight + (bgHeight * 0.2), bgWidth, bgHeight);
                        }

                        ctx.fillStyle = t.color;
                        ctx.globalAlpha = t.opacity || 1;
                        ctx.fillText(t.text, t.x, t.y);

                        // Underline
                        if (t.isUnderline) {
                            const metrics = ctx.measureText(t.text);
                            const width = metrics.width;
                            ctx.beginPath();
                            ctx.moveTo(t.x, t.y + 2);
                            ctx.lineTo(t.x + width, t.y + 2);
                            ctx.lineWidth = t.fontSize / 15;
                            ctx.strokeStyle = t.color;
                            ctx.stroke();
                        }
                    });
                }

                finalPagesData.push({
                    pageIndex: pageIdx,
                    imageData: canvas.toDataURL('image/png')
                });
            }

            if (finalPagesData.length === 0) {
                alert("No changes to save.");
                setIsProcessing(false);
                return;
            }

            const bytes = await saveEditedPdf(file, finalPagesData);
            const blob = new Blob([bytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `edited_${file.name}`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error(error);
            alert("Failed to save PDF.");
        } finally {
            setIsProcessing(false);
        }
    };

    const changeFontSize = (delta: number) => {
        const newSize = Math.min(200, Math.max(8, fontSize + delta));
        setFontSize(newSize);

        if (selectedId && selectedType === 'text') {
            setTextObjects(prev => ({
                ...prev,
                [currentPage]: prev[currentPage].map(t =>
                    t.id === selectedId ? { ...t, fontSize: newSize } : t
                )
            }));
        }
    };

    const handleFontSizeInput = (newSize: number) => {
        if (isNaN(newSize) || newSize < 1) return;
        newSize = Math.min(300, Math.max(8, newSize));
        setFontSize(newSize);

        if (selectedId && selectedType === 'text') {
            setTextObjects(prev => ({
                ...prev,
                [currentPage]: prev[currentPage].map(t =>
                    t.id === selectedId ? { ...t, fontSize: newSize } : t
                )
            }));
        }
    };

    // Feature: Opacity
    const changeOpacity = (val: number) => {
        setOpacity(val);
        if (selectedId) {
            if (selectedType === 'text') {
                setTextObjects(prev => ({
                    ...prev,
                    [currentPage]: prev[currentPage].map(t => t.id === selectedId ? { ...t, opacity: val } : t)
                }));
            } else {
                setImageObjects(prev => ({
                    ...prev,
                    [currentPage]: prev[currentPage].map(i => i.id === selectedId ? { ...i, opacity: val } : i)
                }));
            }
        }
    };

    // Feature: Font Family
    const changeFontFamily = (font: string) => {
        if (selectedId && selectedType === 'text') {
            setTextObjects(prev => ({
                ...prev,
                [currentPage]: prev[currentPage].map(t => t.id === selectedId ? { ...t, fontFamily: font } : t)
            }));
        }
    };

    // Feature: Z-Index (Layers)
    const bringToFront = () => {
        if (!selectedId) return;
        if (selectedType === 'text') {
            setTextObjects(prev => {
                const list = prev[currentPage] || [];
                const item = list.find(t => t.id === selectedId);
                if (!item) return prev;
                return { ...prev, [currentPage]: [...list.filter(t => t.id !== selectedId), item] };
            });
        } else {
            setImageObjects(prev => {
                const list = prev[currentPage] || [];
                const item = list.find(i => i.id === selectedId);
                if (!item) return prev;
                return { ...prev, [currentPage]: [...list.filter(i => i.id !== selectedId), item] };
            });
        }
    };

    const sendToBack = () => {
        if (!selectedId) return;
        if (selectedType === 'text') {
            setTextObjects(prev => {
                const list = prev[currentPage] || [];
                const item = list.find(t => t.id === selectedId);
                if (!item) return prev;
                return { ...prev, [currentPage]: [item, ...list.filter(t => t.id !== selectedId)] };
            });
        } else {
            setImageObjects(prev => {
                const list = prev[currentPage] || [];
                const item = list.find(i => i.id === selectedId);
                if (!item) return prev;
                return { ...prev, [currentPage]: [item, ...list.filter(i => i.id !== selectedId)] };
            });
        }
    };

    // Feature: Duplicate
    const duplicateSelected = () => {
        if (!selectedId) return;
        const newId = Date.now().toString();

        if (selectedType === 'text') {
            const item = textObjects[currentPage].find(t => t.id === selectedId);
            if (item) {
                const newItem = { ...item, id: newId, x: item.x + 20, y: item.y + 20 };
                setTextObjects(prev => ({ ...prev, [currentPage]: [...prev[currentPage], newItem] }));
                setSelectedId(newId);
            }
        } else {
            const item = imageObjects[currentPage].find(i => i.id === selectedId);
            if (item) {
                const newItem = { ...item, id: newId, x: item.x + 20, y: item.y + 20 };
                setImageObjects(prev => ({ ...prev, [currentPage]: [...prev[currentPage], newItem] }));
                setSelectedId(newId);
            }
        }
    };

    // Feature: Stamps
    const addStamp = (text: string, color: string) => {
        const newId = Date.now().toString();
        const stamp: TextObject = {
            id: newId,
            x: 100,
            y: 100,
            text: text,
            fontSize: 40,
            fontFamily: 'Courier New',
            color: color,
            opacity: 0.8
        };
        setTextObjects(prev => ({
            ...prev,
            [currentPage]: [...(prev[currentPage] || []), stamp]
        }));
        setSelectedId(newId);
        setSelectedType('text');
        setTool('select');
    };

    // Feature: Auto Date
    const addDateStamp = () => {
        const dateStr = new Date().toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric'
        });
        const newId = Date.now().toString();
        const dateObj: TextObject = {
            id: newId,
            x: 100,
            y: 100,
            text: dateStr,
            fontSize: 18,
            fontFamily: 'Arial',
            color: '#000000',
            opacity: 1
        };
        setTextObjects(prev => ({ ...prev, [currentPage]: [...(prev[currentPage] || []), dateObj] }));
        setSelectedId(newId);
        setSelectedType('text');
        setTool('select');
    };

    // Feature: Form Symbols
    const addSymbol = (symbol: string, color: string = '#000000') => {
        const newId = Date.now().toString();
        const symObj: TextObject = {
            id: newId,
            x: 100,
            y: 100,
            text: symbol,
            fontSize: 32,
            fontFamily: 'Arial',
            color: color,
            opacity: 1
        };
        setTextObjects(prev => ({ ...prev, [currentPage]: [...(prev[currentPage] || []), symObj] }));
        setSelectedId(newId);
        setSelectedType('text');
        setTool('select');
    };

    // Feature: Alignment
    const alignSelected = (align: 'center' | 'left' | 'right') => {
        if (!selectedId || !canvasRef.current) return;
        const canvasWidth = canvasRef.current.width;

        if (selectedType === 'text') {
            setTextObjects(prev => ({
                ...prev,
                [currentPage]: prev[currentPage].map(t => {
                    if (t.id !== selectedId) return t;
                    let newX = t.x;
                    // Estimate width roughly
                    const estWidth = t.text.length * (t.fontSize * 0.6);
                    if (align === 'center') newX = (canvasWidth / 2) - (estWidth / 2);
                    if (align === 'left') newX = 50;
                    if (align === 'right') newX = canvasWidth - estWidth - 50;
                    return { ...t, x: newX };
                })
            }));
        } else if (selectedType === 'image') {
            setImageObjects(prev => ({
                ...prev,
                [currentPage]: prev[currentPage].map(i => {
                    if (i.id !== selectedId) return i;
                    let newX = i.x;
                    if (align === 'center') newX = (canvasWidth / 2) - (i.width / 2);
                    if (align === 'left') newX = 50;
                    if (align === 'right') newX = canvasWidth - i.width - 50;
                    return { ...i, x: newX };
                })
            }));
        }
    };

    // Feature: Lock/Unlock
    const toggleLock = () => {
        if (!selectedId) return;
        if (selectedType === 'text') {
            setTextObjects(prev => ({
                ...prev,
                [currentPage]: prev[currentPage].map(t => t.id === selectedId ? { ...t, locked: !t.locked } : t)
            }));
        } else {
            setImageObjects(prev => ({
                ...prev,
                [currentPage]: prev[currentPage].map(i => i.id === selectedId ? { ...i, locked: !i.locked } : i)
            }));
        }
    };

    // Feature: Highlight Background
    const toggleHighlight = () => {
        if (selectedId && selectedType === 'text') {
            setTextObjects(prev => ({
                ...prev,
                [currentPage]: prev[currentPage].map(t => t.id === selectedId ? { ...t, backgroundColor: t.backgroundColor ? undefined : '#feff9c' } : t)
            }));
        }
    };

    // Feature: Text Styles
    const toggleBold = () => {
        if (selectedId && selectedType === 'text') {
            setTextObjects(prev => ({
                ...prev,
                [currentPage]: prev[currentPage].map(t => t.id === selectedId ? { ...t, isBold: !t.isBold } : t)
            }));
        }
    };

    const toggleItalic = () => {
        if (selectedId && selectedType === 'text') {
            setTextObjects(prev => ({
                ...prev,
                [currentPage]: prev[currentPage].map(t => t.id === selectedId ? { ...t, isItalic: !t.isItalic } : t)
            }));
        }
    };

    const toggleUnderline = () => {
        if (selectedId && selectedType === 'text') {
            setTextObjects(prev => ({
                ...prev,
                [currentPage]: prev[currentPage].map(t => t.id === selectedId ? { ...t, isUnderline: !t.isUnderline } : t)
            }));
        }
    };

    // Feature: Watermark
    const addWatermark = () => {
        const text = prompt("Enter Watermark Text:", "CONFIDENTIAL");
        if (!text) return;

        const newId = Date.now().toString();
        const watermark: TextObject = {
            id: newId,
            x: 100,
            y: 200,
            text: text,
            fontSize: 60,
            fontFamily: 'Arial',
            color: '#ff0000',
            opacity: 0.2, // Low opacity default
            isBold: true,
            isItalic: false,
            isUnderline: false
        };
        setTextObjects(prev => ({ ...prev, [currentPage]: [...(prev[currentPage] || []), watermark] }));
        setSelectedId(newId);
        setSelectedType('text');
    };

    // Sync font size when selecting text
    useEffect(() => {
        if (selectedId && selectedType === 'text') {
            const textObj = textObjects[currentPage]?.find(t => t.id === selectedId);
            if (textObj) {
                setFontSize(textObj.fontSize);
                setOpacity(textObj.opacity || 1);
            }
        } else if (selectedId && selectedType === 'image') {
            const imgObj = imageObjects[currentPage]?.find(i => i.id === selectedId);
            if (imgObj) {
                setOpacity(imgObj.opacity || 1);
            }
        }
    }, [selectedId, selectedType, currentPage, textObjects, imageObjects]);

    return (
        <div className="bg-slate-50 dark:bg-slate-900 min-h-screen flex flex-col font-sans" onMouseMove={handleObjectDragMove} onMouseUp={handleObjectDragEnd}>
            {/* Header */}
            <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 h-16 px-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => setView(AppView.HOME)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 dark:text-slate-400">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-800"></div>
                    <h1 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <PenTool className="h-4 w-4 text-brand-600" />
                        Editor
                    </h1>
                </div>

                {/* Toolbar */}
                {file && (
                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto">
                        <ToolButton active={tool === 'select'} onClick={() => setTool('select')} icon={MousePointer} title="Select / Move" />
                        <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                        <ToolButton active={tool === 'draw'} onClick={() => setTool('draw')} icon={PenTool} title="Freehand" />
                        <ToolButton active={tool === 'highlight'} onClick={() => setTool('highlight')} icon={Highlighter} title="Highlighter" />
                        <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                        <ToolButton active={tool === 'edit-text'} onClick={() => setTool('edit-text')} icon={FileSignature} title="Magic Edit Text" />
                        <ToolButton active={tool === 'whiteout'} onClick={() => setTool('whiteout')} icon={Eraser} title="Redact / Erase" />
                        <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                        <ToolButton active={tool === 'text'} onClick={() => setTool('text')} icon={Type} title="Add Text" />
                        <label className="p-2 rounded-md transition-all text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 cursor-pointer" title="Upload Image">
                            <ImageIcon className="h-5 w-5" />
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                        </label>

                        {/* Properties */}
                        <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="w-8 h-8 rounded cursor-pointer border-0 p-0 bg-transparent"
                            title="Color"
                        />

                        {(tool === 'text' || selectedType === 'text') && (
                            <div className="flex items-center gap-2 px-2">
                                <button onClick={() => changeFontSize(-4)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-xs font-bold text-slate-700 dark:text-white">-A</button>
                                <input
                                    type="number"
                                    value={Math.round(fontSize)}
                                    onChange={(e) => handleFontSizeInput(parseInt(e.target.value))}
                                    className="w-12 text-center text-xs font-mono bg-transparent border border-slate-200 dark:border-slate-700 rounded py-1 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                                />
                                <button onClick={() => changeFontSize(4)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-xs font-bold text-slate-700 dark:text-white">+A</button>
                            </div>
                        )}

                        <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                        <div className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Opacity</span>
                            <div className="flex flex-col gap-1">
                                <input
                                    type="range"
                                    min="0.1"
                                    max="1.0"
                                    step="0.1"
                                    value={opacity}
                                    onChange={(e) => changeOpacity(parseFloat(e.target.value))}
                                    className="w-16 h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                                    title="Opacity"
                                />
                                <div className="flex gap-0.5">
                                    {[0.25, 0.5, 0.75, 1].map(v => (
                                        <button key={v} onClick={() => changeOpacity(v)} className="w-3 h-3 bg-slate-100 dark:bg-slate-800 text-[8px] flex items-center justify-center rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                                            {v * 100}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Watermark Tool */}
                        <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                        <button onClick={addWatermark} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded" title="Add Watermark">
                            <Baseline className="h-4 w-4" />
                        </button>

                        {/* Date Tool */}
                        <button onClick={addDateStamp} className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded" title="Insert Date">
                            <Calendar className="h-4 w-4" />
                        </button>

                        <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>

                        {/* Form Symbols */}
                        <div className="flex items-center gap-1">
                            <button onClick={() => addSymbol('✓', '#22c55e')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500" title="Checkmark">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </button>
                            <button onClick={() => addSymbol('✗', '#ef4444')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500" title="Cross">
                                <XCircle className="h-4 w-4 text-red-600" />
                            </button>
                            <button onClick={() => addSymbol('➜', '#3b82f6')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500" title="Arrow">
                                <ArrowRight className="h-4 w-4 text-blue-600" />
                            </button>
                        </div>

                        {selectedId && (
                            <>
                                <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => alignSelected('center')} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500" title="Align Center">
                                        <AlignCenter className="h-4 w-4" />
                                    </button>
                                    <button onClick={toggleLock} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500" title={textObjects[currentPage]?.find(t => t.id === selectedId)?.locked ? "Unlock" : "Lock"}>
                                        {((selectedType === 'text' && textObjects[currentPage]?.find(t => t.id === selectedId)?.locked) ||
                                            (selectedType === 'image' && imageObjects[currentPage]?.find(i => i.id === selectedId)?.locked)) ?
                                            <Lock className="h-4 w-4 text-brand-600" /> : <Unlock className="h-4 w-4" />}
                                    </button>
                                    <button onClick={duplicateSelected} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500" title="Duplicate">
                                        <Plus className="h-4 w-4" />
                                    </button>
                                    <button onClick={bringToFront} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500" title="Bring to Front">
                                        <Layers className="h-4 w-4" />
                                    </button>
                                </div>
                            </>
                        )}

                        {(tool === 'text' || selectedType === 'text') && (
                            <>
                                <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>
                                <button onClick={toggleHighlight} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500" title="Highlight Text">
                                    <PaintBucket className="h-4 w-4 text-yellow-500" />
                                </button>
                                <div className="flex items-center gap-0.5 rounded bg-slate-200 dark:bg-slate-800 p-0.5">
                                    <button onClick={toggleBold} className="p-1 hover:bg-slate-300 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300" title="Bold">
                                        <Bold className="h-3 w-3" />
                                    </button>
                                    <button onClick={toggleItalic} className="p-1 hover:bg-slate-300 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300" title="Italic">
                                        <Italic className="h-3 w-3" />
                                    </button>
                                    <button onClick={toggleUnderline} className="p-1 hover:bg-slate-300 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300" title="Underline">
                                        <Underline className="h-3 w-3" />
                                    </button>
                                </div>
                                <select
                                    className="text-xs bg-transparent border-none focus:ring-0 text-slate-700 dark:text-slate-300 w-24"
                                    onChange={(e) => changeFontFamily(e.target.value)}
                                // defaultValue="Arial"
                                >
                                    <option value="Arial">Arial</option>
                                    <option value="Times New Roman">Times</option>
                                    <option value="mnipdf-font-1">Handwriting</option>
                                    <option value="Courier New">Courier</option>
                                    <option value="Georgia">Georgia</option>
                                </select>
                            </>
                        )}

                        <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>

                        {/* Stamp Tool */}
                        <div className="relative group">
                            <button className="p-2 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded" title="Stamps">
                                <Stamp className="h-4 w-4" />
                            </button>
                            <div className="absolute top-full left-0 mt-2 w-32 bg-white dark:bg-slate-900 shadow-xl rounded-lg border border-slate-100 dark:border-slate-700 p-2 hidden group-hover:block z-50">
                                <button onClick={() => addStamp('APPROVED', '#22c55e')} className="w-full text-xs font-bold text-green-600 hover:bg-green-50 p-2 rounded text-left">APPROVED</button>
                                <button onClick={() => addStamp('CONFIDENTIAL', '#ef4444')} className="w-full text-xs font-bold text-red-600 hover:bg-red-50 p-2 rounded text-left">CONFIDENTIAL</button>
                                <button onClick={() => addStamp('DRAFT', '#94a3b8')} className="w-full text-xs font-bold text-slate-500 hover:bg-slate-50 p-2 rounded text-left">DRAFT</button>
                            </div>
                        </div>

                        <div className="w-[1px] h-6 bg-slate-300 dark:bg-slate-700 mx-1"></div>

                        <button onClick={handleUndo} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded" title="Undo">
                            <Undo className="h-4 w-4" />
                        </button>
                        <button onClick={handleRedo} className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded" title="Redo">
                            <Redo className="h-4 w-4" />
                        </button>

                        {selectedId && (
                            <button onClick={deleteSelected} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded ml-2">
                                <Trash2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-2">
                    {file && (
                        <button
                            onClick={handleSave}
                            disabled={isProcessing}
                            className="px-4 py-2 bg-brand-600 text-white rounded-lg font-semibold hover:bg-brand-700 flex items-center gap-2 transition-all text-sm"
                        >
                            {isProcessing ? <Loader2 className="animate-spin h-4 w-4" /> : <Download className="h-4 w-4" />}
                            Save
                        </button>
                    )}
                </div>
            </div>

            {/* Main Area */}
            {!file ? (
                <div className="flex-grow flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white dark:bg-slate-800 p-12 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 text-center">
                        <div className="w-20 h-20 bg-brand-50 dark:bg-brand-900/20 text-brand-600 rounded-full flex items-center justify-center mx-auto mb-6">
                            <PenTool className="h-10 w-10" />
                        </div>
                        <h2 className="text-2xl font-black mb-2 text-slate-900 dark:text-white">Professional PDF Editor</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-8">Edit text, redact information, add images, and sign documents locally.</p>
                        <label className="w-full py-4 bg-slate-900 dark:bg-brand-600 text-white rounded-xl font-bold flex items-center justify-center gap-3 cursor-pointer hover:bg-slate-800 dark:hover:bg-brand-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                            <Plus className="h-5 w-5" /> Select PDF File
                            <input type="file" className="hidden" accept="application/pdf" onChange={handleFileChange} />
                        </label>
                    </div>
                </div>
            ) : (
                <div className="flex-grow flex overflow-hidden relative">

                    {/* Sidebar */}
                    <div className="w-64 bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto z-10 hidden md:flex">
                        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">Pages</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            {pages.map((img, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => changePage(idx)}
                                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all group ${currentPage === idx ? 'border-brand-600 ring-2 ring-brand-100 dark:ring-brand-900' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'}`}
                                >
                                    <img src={img} className="w-full h-auto" alt={`Page ${idx + 1}`} />
                                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-[10px] rounded">
                                        {idx + 1}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Canvas Viewport */}
                    <div className="flex-grow bg-slate-100 dark:bg-slate-900 overflow-auto flex justify-center p-8 relative select-none">
                        <div className="relative shadow-2xl bg-white" style={{ width: 'fit-content', height: 'fit-content' }}>
                            {/* Background Image */}
                            {pages[currentPage] && (
                                <img
                                    src={pages[currentPage]}
                                    className="pointer-events-none select-none block"
                                    style={{ maxWidth: 'none' }}
                                    alt="Page Background"
                                />
                            )}

                            {/* Redactions Layer */}
                            {redactions[currentPage]?.map(r => (
                                <div
                                    key={r.id}
                                    style={{
                                        position: 'absolute',
                                        left: r.x,
                                        top: r.y,
                                        width: r.width,
                                        height: r.height,
                                        backgroundColor: 'white',
                                        zIndex: 10
                                    }}
                                />
                            ))}

                            {/* Drawing Canvas */}
                            <canvas
                                ref={canvasRef}
                                onMouseDown={startDrawing}
                                onMouseUp={stopDrawing}
                                onMouseMove={draw}
                                onTouchStart={startDrawing}
                                onTouchEnd={stopDrawing}
                                onTouchMove={draw}
                                className={`absolute inset-0 w-full h-full ${tool === 'select' ? 'pointer-events-none' : 'cursor-crosshair'} z-20`}
                            />

                            {/* Image Objects Layer */}
                            {imageObjects[currentPage]?.map(img => (
                                <div
                                    key={img.id}
                                    onMouseDown={(e) => handleObjectDragStart(e, img.id, 'image')}
                                    onClick={(e) => { e.stopPropagation(); setSelectedId(img.id); setSelectedType('image'); }}
                                    style={{
                                        position: 'absolute',
                                        left: img.x,
                                        top: img.y,
                                        width: img.width,
                                        height: img.height,
                                        zIndex: 25,
                                        cursor: tool === 'select' ? 'move' : 'default',
                                        border: selectedId === img.id ? '2px dashed #3b82f6' : 'none',
                                        opacity: img.opacity ?? 1
                                    }}
                                >
                                    <img src={img.src} className="w-full h-full object-contain pointer-events-none" />
                                    {selectedId === img.id && (
                                        <>
                                            <div className="absolute -top-6 left-0 flex gap-1 bg-white shadow rounded px-1">
                                                <GripVertical className="h-4 w-4 text-slate-400" />
                                            </div>
                                            {/* Resize Handles */}
                                            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-nw-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'nw', img.id, 'image')} />
                                            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-ne-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'ne', img.id, 'image')} />
                                            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-sw-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'sw', img.id, 'image')} />
                                            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-blue-500 rounded-full cursor-se-resize z-50" onMouseDown={(e) => handleResizeStart(e, 'se', img.id, 'image')} />
                                        </>
                                    )}
                                </div>
                            ))}

                            {/* Text Objects Layer (Interactive) */}
                            {textObjects[currentPage]?.map(t => (
                                <div
                                    key={t.id}
                                    onMouseDown={(e) => handleObjectDragStart(e, t.id, 'text')}
                                    onClick={(e) => { e.stopPropagation(); setSelectedId(t.id); setSelectedType('text'); }}
                                    style={{
                                        position: 'absolute',
                                        left: t.x,
                                        top: t.y,
                                        transform: 'translateY(-80%)',
                                        zIndex: 30,
                                        cursor: tool === 'select' ? 'move' : 'default',
                                        border: selectedId === t.id ? '1px dashed #3b82f6' : '1px solid transparent',
                                        padding: '2px'
                                    }}
                                >
                                    <input
                                        value={t.text}
                                        onChange={(e) => updateTextContent(t.id, e.target.value)}
                                        style={{
                                            font: `${t.isItalic ? 'italic' : 'normal'} ${t.isBold ? 'bold' : 'normal'} ${t.fontSize}px ${t.fontFamily || 'Arial'}`,
                                            textDecoration: t.isUnderline ? 'underline' : 'none',
                                            color: t.color,
                                            background: t.backgroundColor || 'transparent',
                                            border: 'none',
                                            outline: 'none',
                                            width: `${Math.max(t.text.length + 1, 5)}ch`,
                                            textShadow: '0 0 2px rgba(255,255,255,0.5)',
                                            opacity: t.opacity ?? 1,
                                        }}
                                    />
                                    {selectedId === t.id && (
                                        <>
                                            {/* Resize Border */}
                                            <div className="absolute inset-0 border border-blue-500 pointer-events-none" style={{ transform: 'scale(1.1)' }}></div>

                                            {/* Top Handle (Move) - Hide if locked */}
                                            {!(t.locked) && (
                                                <div className="absolute -top-6 left-0 flex gap-1 bg-white shadow rounded px-1 cursor-move">
                                                    <GripVertical className="h-4 w-4 text-slate-400" />
                                                </div>
                                            )}

                                            {/* Text Resize Handles - Hide if locked */}
                                            {!(t.locked) && (
                                                <>
                                                    <div className="absolute -top-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-nw-resize z-50 shadow-sm" onMouseDown={(e) => handleResizeStart(e, 'nw', t.id, 'text')} />
                                                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-ne-resize z-50 shadow-sm" onMouseDown={(e) => handleResizeStart(e, 'ne', t.id, 'text')} />
                                                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-sw-resize z-50 shadow-sm" onMouseDown={(e) => handleResizeStart(e, 'sw', t.id, 'text')} />
                                                    <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full cursor-se-resize z-50 shadow-sm" onMouseDown={(e) => handleResizeStart(e, 'se', t.id, 'text')} />
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Floating Helper */}
                    {(tool === 'whiteout' || tool === 'edit-text') && (
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg pointer-events-none animate-in fade-in slide-in-from-bottom-4 z-50">
                            {tool === 'edit-text' ? 'Click text to edit' : 'Drag over content to erase'}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const ToolButton = ({ active, onClick, icon: Icon, title }: any) => (
    <button
        onClick={onClick}
        className={`p-2 rounded-md transition-all ${active ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm ring-1 ring-slate-200 dark:ring-slate-600' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800'}`}
        title={title}
    >
        <Icon className="h-5 w-5" />
    </button>
);
