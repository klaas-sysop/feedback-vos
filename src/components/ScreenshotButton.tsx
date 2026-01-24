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
    try {
      setIsTakenScreenShot(true);
      // Capture only the viewport (visible area), not the entire page
      // Use document.body instead of document.documentElement for better viewport capture
      const canvas = await html2canvas(document.body, {
        width: window.innerWidth,
        height: window.innerHeight,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,
        scrollX: -window.scrollX,
        scrollY: -window.scrollY,
        scale: 1, // Use scale 1 for consistent sizing
        useCORS: true,
        allowTaint: true, // Allow external images for better rendering
        backgroundColor: null, // Preserve page background
        removeContainer: false, // Maintain proper container rendering
        logging: false,
        ignoreElements: (element) => {
          // 1. Ignore the widget itself
          const isWidget = element.hasAttribute("data-feedback-widget") || element.closest("[data-feedback-widget]") !== null;
          if (isWidget) return true;

          // 2. Ignore ONLY 0-sized media elements (these are the crashers)
          const tagName = element.tagName;
          if (tagName === "IMG" || tagName === "CANVAS" || tagName === "VIDEO" || tagName === "SVG") {
            const rect = element.getBoundingClientRect();
            if (rect.width < 1 || rect.height < 1) {
              console.warn("FeedbackWidget: Ignoring 0-sized media element:", tagName, element);
              return true;
            }
          }
          // NOTE: Do NOT ignore other elements based on size, as that might hide containers!
          return false;
        },
      });

      // Check for valid canvas dimensions to prevent InvalidStateError
      if (canvas.width === 0 || canvas.height === 0) {
        console.warn('Screenshot failed: Captured canvas has 0 width or height');
        return;
      }

      // Normalize to responsive resolution: mobile (1080x1920) or desktop (1920x1080)
      const isMobile = window.innerWidth < 768;
      const targetWidth = isMobile ? 1080 : 1920;
      const targetHeight = isMobile ? 1920 : 1080;

      // Create a new canvas with the target dimensions
      const normalizedCanvas = document.createElement('canvas');
      normalizedCanvas.width = targetWidth;
      normalizedCanvas.height = targetHeight;

      const ctx = normalizedCanvas.getContext('2d');
      if (!ctx) {
        return;
      }

      // Enable high-quality image smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw the screenshot to fit 1920x1080 (maintain aspect ratio, center it)
      const sourceAspect = canvas.width / canvas.height;
      const targetAspect = targetWidth / targetHeight;

      let drawWidth = targetWidth;
      let drawHeight = targetHeight;
      let drawX = 0;
      let drawY = 0;

      if (sourceAspect > targetAspect) {
        // Source is wider - fit to height
        drawHeight = targetHeight;
        drawWidth = drawHeight * sourceAspect;
        drawX = (targetWidth - drawWidth) / 2;
      } else {
        // Source is taller - fit to width
        drawWidth = targetWidth;
        drawHeight = drawWidth / sourceAspect;
        drawY = (targetHeight - drawHeight) / 2;
      }

      // Fill background with white (or you could use a color from the page)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Draw the screenshot centered
      ctx.drawImage(canvas, drawX, drawY, drawWidth, drawHeight);

      const base64image = normalizedCanvas.toDataURL('image/png', 1.0);
      onScreenshotTook(base64image);
    } catch (error) {
      console.error('Failed to take screenshot:', error);
    } finally {
      setIsTakenScreenShot(false);
    }
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

