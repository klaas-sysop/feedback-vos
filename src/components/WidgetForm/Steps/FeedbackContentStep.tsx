'use client'

import {ArrowLeft} from 'phosphor-react';
import { FormEvent, useState, useEffect } from 'react';
import { FeedbackType, getFeedbackTypes } from '..';
import { CloseButton } from '../../CloseButton';
import {Loading} from '../../Loading';
import { ScreenshotButton } from '../../ScreenshotButton';
import { FileUploadButton, UploadedFile } from '../../FileUploadButton';
import { sendToGitHub } from '../../../lib/integrations/github';
import { GitHubConfig, Theme } from '../../../types';
import { Language, getTranslations } from '../../../lib/translations';
import { getThemeClasses } from '../../../lib/theme';

interface FeedbackContentStepProps {
  feedbackType: FeedbackType;
  onFeedbackRestartRequest: () => void;
  onFeedbackSent: () => void;
  integration: 'github';
  githubConfig: GitHubConfig;
  language: Language;
  theme: Theme;
}

export function FeedbackContentStep({
  feedbackType,
  onFeedbackRestartRequest,
  onFeedbackSent,
  integration,
  githubConfig,
  language,
  theme,
}: FeedbackContentStepProps) {
  const t = getTranslations(language);
  const feedbackTypes = getFeedbackTypes(language);
  const themeClasses = getThemeClasses(theme);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const feedbackTypeData = feedbackTypes[feedbackType];
  const [comment, setComment] = useState('');
  const[isSendingFeedback, setIsSendingFeedback] = useState(false);

  // Cleanup object URLs when component unmounts or files change
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [uploadedFiles]);

  async function handleSubmitFeedback(e: FormEvent) {
    e.preventDefault();
    setIsSendingFeedback(true);
    
    try {
      const feedbackData = {
        type: feedbackType,
        comment,
        screenshot,
        files: uploadedFiles,
      };

      if (integration === 'github') {
        await sendToGitHub(githubConfig, feedbackData);
      } else {
        throw new Error('Invalid integration configuration');
      }
      
      setIsSendingFeedback(false);
      onFeedbackSent();
    } catch (error) {
      console.error('Error sending feedback:', error);
      setIsSendingFeedback(false);
      // TODO: Show error message to user
      alert(t.content.error);
    }
  }
  
  return (
    <>
      <header className="relative w-full">
        <button
          type="button"
          className={`absolute top-0 left-0 ${themeClasses.textTertiary} ${theme === 'dark' ? 'hover:text-zinc-100' : 'hover:text-gray-900'} z-10 p-2 md:p-2.5`}
          onClick={onFeedbackRestartRequest}
        >
          <ArrowLeft weight="bold" className="w-5 h-5 md:w-5 md:h-5" />
        </button>

        <span className={`text-lg md:text-xl leading-6 flex items-center gap-2 pl-10 md:pl-12 pr-10 md:pr-12 ${themeClasses.textPrimary}`}>
          <img
            src={feedbackTypeData.image.source}
            alt={feedbackTypeData.image.alt}
            className="w-5 h-5 md:w-6 md:h-6"
          />
          {feedbackTypeData.title}
        </span>
        <CloseButton className="absolute top-0 right-0 p-2 md:p-2.5" title={t.form.closeButton} theme={theme} />
      </header>
      <form onSubmit={handleSubmitFeedback} className="my-3 md:my-4 w-full">
        <textarea
          className={`w-full min-h-[100px] md:min-h-[112px] text-sm 
        ${themeClasses.textPrimary} ${themeClasses.borderSecondary} bg-transparent rounded-md p-2 md:p-3
        ${theme === 'dark' ? 'placeholder:text-zinc-400' : 'placeholder:text-gray-500'}
        focus:border-brand-500 focus:ring-brand-500 focus:ring-1 resize-none focus:outline-none
          ${theme === 'dark' ? 'scrollbar-thumb-zinc-700' : 'scrollbar-thumb-gray-400'} scrollbar-track-transparent scrollbar-thin`}
          placeholder={t.content.placeholder}
          onChange={(e) => setComment(e.target.value)}
        />
        <div className="mt-2">
          <FileUploadButton
            files={uploadedFiles}
            onFilesChanged={setUploadedFiles}
            language={language}
            theme={theme}
          />
        </div>
        <footer className="flex gap-2 mt-3">
          <ScreenshotButton
            screenshot={screenshot}
            onScreenshotTook={setScreenshot}
            language={language}
            theme={theme}
          />
          <button
            type="submit"
            disabled={comment.length === 0 || isSendingFeedback}
            className={`p-2 bg-brand-500 rounded-md border-transparent flex-1 justify-center
          items-center text-sm hover:bg-brand-300 focus:outline-none focus:ring-2
           focus:ring-offset-2 ${themeClasses.focusRingOffset} focus:ring-brand-500
           transition-colors disabled:opacity-50 disabled:cursor-not-allowed
           disabled:hover:bg-brand-500 flex text-white`}
          >
           {isSendingFeedback? <Loading/> :  t.content.sendButton}
          </button>
        </footer>
      </form>
    </>
  )
}

