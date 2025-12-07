'use client'

import { X, Check, Trash, ArrowCounterClockwise } from 'phosphor-react';
import { useState, useRef, useEffect, useCallback } from 'react';

interface ScreenshotEditorProps {
  screenshot: string;
  onSave: (editedScreenshot: string) => void;
  onCancel: () => void;
  language: 'en' | 'nl';
}

export function ScreenshotEditor({
  screenshot,
  onSave,
  onCancel,
  language,
}: ScreenshotEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#ef4444'); // red-500
  const [brushSize, setBrushSize] = useState(3);
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const t = {
    en: {
      save: 'Save',
      cancel: 'Cancel',
      clear: 'Clear',
      undo: 'Undo',
    },
    nl: {
      save: 'Opslaan',
      cancel: 'Annuleren',
      clear: 'Wissen',
      undo: 'Ongedaan maken',
    },
  }[language];

  const colors = [
    '#ef4444', // red-500
    '#f59e0b', // amber-500
    '#eab308', // yellow-500
    '#22c55e', // green-500
    '#3b82f6', // blue-500
    '#8b5cf6', // violet-500
    '#ec4899', // pink-500
    '#ffffff', // white
    '#000000', // black
  ];

  // Load image when screenshot changes
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
      }
    };
    img.src = screenshot;
  }, [screenshot]);

  const getCoordinates = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0] || e.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    } else {
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    }
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    setIsDrawing(true);

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, [color, brushSize, getCoordinates]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  }, [isDrawing, getCoordinates]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
  }, []);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
  };

  const undo = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Redraw the base image (simple undo - clears all drawings)
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);
  };

  const handleSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const editedScreenshot = canvas.toDataURL('image/png');
    onSave(editedScreenshot);
  };

  // Calculate canvas display size (max 600px width, maintain aspect ratio)
  const maxWidth = 600;
  const displayWidth = image ? Math.min(maxWidth, image.width) : maxWidth;
  const displayHeight = image ? (displayWidth / image.width) * image.height : 400;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-zinc-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="sticky top-0 bg-zinc-800 border-b border-zinc-700 p-4 flex items-center justify-between z-10">
          <h3 className="text-lg font-semibold text-zinc-100">
            {language === 'nl' ? 'Teken op screenshot' : 'Draw on screenshot'}
          </h3>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={undo}
              className="p-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-zinc-100 transition-colors"
              title={t.undo}
            >
              <ArrowCounterClockwise weight="bold" className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={clearCanvas}
              className="p-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-zinc-100 transition-colors"
              title={t.clear}
            >
              <Trash weight="bold" className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="p-2 bg-zinc-700 hover:bg-zinc-600 rounded-md text-zinc-100 transition-colors"
              title={t.cancel}
            >
              <X weight="bold" className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="p-2 bg-brand-500 hover:bg-brand-400 rounded-md text-zinc-100 transition-colors"
              title={t.save}
            >
              <Check weight="bold" className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4">
          {/* Color picker */}
          <div className="mb-4 flex items-center gap-4">
            <label className="text-sm text-zinc-300">
              {language === 'nl' ? 'Kleur:' : 'Color:'}
            </label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${
                    color === c
                      ? 'border-zinc-100 scale-110'
                      : 'border-zinc-600 hover:border-zinc-500'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>

          {/* Brush size */}
          <div className="mb-4 flex items-center gap-4">
            <label className="text-sm text-zinc-300">
              {language === 'nl' ? 'Grootte:' : 'Size:'}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="flex-1 max-w-xs"
            />
            <span className="text-sm text-zinc-400 w-8">{brushSize}</span>
          </div>

          {/* Canvas */}
          <div className="flex justify-center bg-zinc-900 rounded-lg p-4 overflow-auto">
            <canvas
              ref={canvasRef}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="cursor-crosshair border border-zinc-700 rounded"
              style={{
                width: `${displayWidth}px`,
                height: `${displayHeight}px`,
                maxWidth: '100%',
                maxHeight: '70vh',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
