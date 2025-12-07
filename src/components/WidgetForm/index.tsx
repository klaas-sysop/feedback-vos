'use client'

import { bugImageUrl, ideaImageUrl, thoughtImageUrl } from '../../lib/svg-assets';
import { useState } from 'react';
import { FeedbackTypeStep } from './Steps/FeedbackTypeStep';
import { FeedbackContentStep } from './Steps/FeedbackContentStep';
import { FeedbackSuccessStep } from './Steps/FeedbackSuccessStep';
import { FeedbackType, GitHubConfig, Theme } from '../../types';
import { Language, getTranslations } from '../../lib/translations';
import { getThemeClasses } from '../../lib/theme';

export function getFeedbackTypes(language: Language = 'en') {
  const t = getTranslations(language);
  return {
    BUG: {
      title: t.types.bug,
      image: {
        source: bugImageUrl,
        alt: 'A purple caterpillar image',
      },
    },
    IDEA: {
      title: t.types.idea,
      image: {
        source: ideaImageUrl,
        alt: 'A Lamp image',
      },
    },
    OTHER: {
      title: t.types.other,
      image: {
        source: thoughtImageUrl,
        alt: 'A thought balloon image',
      },
    },
  };
}

export type { FeedbackType };

interface WidgetFormProps {
  integration: 'github';
  githubConfig: GitHubConfig;
  language: Language;
  theme: Theme;
}

export function WidgetForm({ integration, githubConfig, language, theme }: WidgetFormProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null)
  const [feedbackSent, setFeedbackSent] = useState(false)
  const themeClasses = getThemeClasses(theme);
  
  function handleRestartFeedback() {
    setFeedbackSent(false); 
    setFeedbackType(null);
  }
  
  return (
    <div className={`${themeClasses.bgPrimary} p-3 md:p-4 relative rounded-2xl mb-4 flex flex-col items-center shadow-lg w-[calc(100vw-2rem)] md:w-auto md:min-w-[384px] max-w-md`}>
      {feedbackSent ? (
        <FeedbackSuccessStep onFeedbackRestartRequest={handleRestartFeedback} language={language} theme={theme} />
      ) : (
        <>
          {!feedbackType ? (
            <FeedbackTypeStep onFeedbackTypeChanged={setFeedbackType} language={language} theme={theme} />
          ) : (
            <FeedbackContentStep
              feedbackType={feedbackType}
              onFeedbackRestartRequest={handleRestartFeedback}
              onFeedbackSent={() => setFeedbackSent(true)}
              integration={integration}
              githubConfig={githubConfig}
              language={language}
              theme={theme}
            />
          )}
        </>
      )}
      <footer className={`text-xs ${themeClasses.textMuted} mt-2`}>
        <a
          className="underline underline-offset-2"
          href="https://vossendesign.nl"
          target="_blank"
          rel="noopener noreferrer"
        >
          Vossen Design
        </a>
      </footer>
    </div>
  )
}

