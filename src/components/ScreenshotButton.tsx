'use client'

import html2canvas from 'html2canvas';
import { Camera, Trash, X, PencilSimple } from 'phosphor-react';
import { useState } from 'react';
import { Loading } from './Loading';
import { ScreenshotEditor } from './ScreenshotEditor';
import { Language } from '../lib/translations';
import { Theme } from '../types';
import { getThemeClasses } from '../lib/theme';

interface ScreenshotButtonProps {
  screenshot: string | null;
  onScreenshotTook: (screenshot: string | null) => void;
  language?: Language;
  theme?: Theme;
}

export function ScreenshotButton({
  screenshot,
  onScreenshotTook,
  language = 'en',
  theme = 'dark',
}: ScreenshotButtonProps) {
  const [isTakenScreenshot, setIsTakenScreenShot] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [tempScreenshot, setTempScreenshot] = useState<string | null>(null);
  const themeClasses = getThemeClasses(theme);
  
  async function handleTakeScreenshot() {
    setIsTakenScreenShot(true);
    const canvas = await html2canvas(document.body, {
      width: window.innerWidth,
      height: window.innerHeight,
      scrollX: -window.scrollX,
      scrollY: -window.scrollY,
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
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
          theme={theme}
        />
        {screenshot ? (
          <div className="flex items-center gap-2">
            <div className="relative group">
              <div
                className={`p-1 w-10 h-10 rounded-md border ${themeClasses.borderSecondary} flex 
                        justify-end items-end relative overflow-hidden`}
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
              className={`p-2 ${themeClasses.bgSecondary} rounded-md border-transparent ${themeClasses.bgHoverSecondary}
                 transition-colors focus:outline-none focus:ring-2
                 focus:ring-offset-2 ${themeClasses.focusRingOffset} focus:ring-brand-500`}
              title={language === 'nl' ? 'Bewerk screenshot' : 'Edit screenshot'}
            >
              <PencilSimple weight="bold" className={`w-5 h-5 ${themeClasses.textPrimary}`} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            className={`p-2 ${themeClasses.bgSecondary} rounded-md border-transparent ${themeClasses.bgHoverSecondary}
               transition-colors focus:outline-none focus:ring-2
               focus:ring-offset-2 ${themeClasses.focusRingOffset} focus:ring-brand-500`}
            onClick={handleTakeScreenshot}
          >
            {isTakenScreenshot ? <Loading /> : <Camera weight="bold" className={`w-6 h-6 ${themeClasses.iconColor}`} />}
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
            className={`p-1 w-10 h-10 rounded-md border ${themeClasses.borderSecondary} flex 
                    justify-end items-end relative overflow-hidden`}
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
          className={`p-2 ${themeClasses.bgSecondary} rounded-md border-transparent ${themeClasses.bgHoverSecondary}
             transition-colors focus:outline-none focus:ring-2
             focus:ring-offset-2 ${themeClasses.focusRingOffset} focus:ring-brand-500`}
          title={language === 'nl' ? 'Bewerk screenshot' : 'Edit screenshot'}
        >
          <PencilSimple weight="bold" className={`w-5 h-5 ${themeClasses.textPrimary}`} />
        </button>
      </div>
    )
  }
  
  return (
    <button
      type="button"
      className={`p-2 ${themeClasses.bgSecondary} rounded-md border-transparent ${themeClasses.bgHoverSecondary}
         transitions-colors focus:outline-none focus:ring-2
         focus:ring-offset-2 ${themeClasses.focusRingOffset} focus:ring-brand-500`}
      onClick={handleTakeScreenshot}
    >
      {isTakenScreenshot ? <Loading /> : <Camera weight="bold" className={`w-6 h-6 ${themeClasses.iconColor}`} />}
    </button>
  )
}

