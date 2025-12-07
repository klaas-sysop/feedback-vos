'use client'

import html2canvas from 'html2canvas';
import { Camera, Trash, X, PencilSimple } from 'phosphor-react';
import { useState } from 'react';
import { Loading } from './Loading';
import { ScreenshotEditor } from './ScreenshotEditor';
import { Language } from '../lib/translations';

interface ScreenshotButtonProps {
  screenshot: string | null;
  onScreenshotTook: (screenshot: string | null) => void;
  language?: Language;
}

export function ScreenshotButton({
  screenshot,
  onScreenshotTook,
  language = 'en',
}: ScreenshotButtonProps) {
  const [isTakenScreenshot, setIsTakenScreenShot] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [tempScreenshot, setTempScreenshot] = useState<string | null>(null);
  
  async function handleTakeScreenshot() {
    setIsTakenScreenShot(true);
    const canvas = await html2canvas(document.querySelector('html')!, {
      ignoreElements: (element) => {
        // Exclude the feedback widget from screenshots
        return element.hasAttribute('data-feedback-widget') || 
               element.closest('[data-feedback-widget]') !== null;
      },
    });
    const base64image = canvas.toDataURL('image/png');
    onScreenshotTook(base64image);
    setIsTakenScreenShot(false);
  }

  function handleEditorSave(editedScreenshot: string) {
    onScreenshotTook(editedScreenshot);
    setShowEditor(false);
    setTempScreenshot(null);
  }

  function handleEditorCancel() {
    setShowEditor(false);
    setTempScreenshot(null);
  }

  function handleEditScreenshot() {
    if (screenshot) {
      setTempScreenshot(screenshot);
      setShowEditor(true);
    }
  }

  if (showEditor && (tempScreenshot || screenshot)) {
    return (
      <>
        <ScreenshotEditor
          screenshot={tempScreenshot || screenshot!}
          onSave={handleEditorSave}
          onCancel={handleEditorCancel}
          language={language}
        />
        {screenshot ? (
          <div className="flex items-center gap-2">
            <div className="relative group">
              <div
                className="p-1 w-10 h-10 rounded-md border border-zinc-600 flex 
                        justify-end items-end relative overflow-hidden"
                style={{
                  backgroundImage: `url(${screenshot})`,
                  backgroundPosition: 'center',
                  backgroundSize: 'cover',
                }}
              >
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-md" />
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onScreenshotTook(null);
                }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title={language === 'nl' ? 'Verwijderen' : 'Delete'}
              >
                <X weight="bold" className="w-3 h-3 text-white" />
              </button>
            </div>
            <button
              type="button"
              onClick={handleEditScreenshot}
              className="p-2 bg-zinc-800 rounded-md border-transparent hover:bg-zinc-700
                 transition-colors focus:outline-none focus:ring-2
                 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-brand-500"
              title={language === 'nl' ? 'Bewerk screenshot' : 'Edit screenshot'}
            >
              <PencilSimple weight="bold" className="w-5 h-5 text-zinc-100" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="p-2 bg-zinc-800 rounded-md border-transparent hover:bg-zinc-700
               transition-colors focus:outline-none focus:ring-2
               focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-brand-500"
            onClick={handleTakeScreenshot}
          >
            {isTakenScreenshot ? <Loading /> : <Camera weight="bold" className="w-6 h-6" />}
          </button>
        )}
      </>
    );
  }

  if (screenshot) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative group">
          <div
            className="p-1 w-10 h-10 rounded-md border border-zinc-600 flex 
                    justify-end items-end relative overflow-hidden"
            style={{
              backgroundImage: `url(${screenshot})`,
              backgroundPosition: 'center',
              backgroundSize: 'cover',
            }}
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-md" />
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onScreenshotTook(null);
            }}
            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
            title={language === 'nl' ? 'Verwijderen' : 'Delete'}
          >
            <X weight="bold" className="w-3 h-3 text-white" />
          </button>
        </div>
        <button
          type="button"
          onClick={handleEditScreenshot}
          className="p-2 bg-zinc-800 rounded-md border-transparent hover:bg-zinc-700
             transition-colors focus:outline-none focus:ring-2
             focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-brand-500"
          title={language === 'nl' ? 'Bewerk screenshot' : 'Edit screenshot'}
        >
          <PencilSimple weight="bold" className="w-5 h-5 text-zinc-100" />
        </button>
      </div>
    )
  }
  
  return (
    <button
      type="button"
      className="p-2 bg-zinc-800 rounded-md border-transparent hover:bg-zinc-700
         transitions-colors focus:outline-none focus:ring-2
         focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-brand-500"
      onClick={handleTakeScreenshot}
    >
      {isTakenScreenshot ? <Loading /> : <Camera weight="bold" className="w-6 h-6" />}
    </button>
  )
}

