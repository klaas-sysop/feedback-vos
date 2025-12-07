'use client'

import { bugImageUrl, ideaImageUrl, thoughtImageUrl } from '../../lib/svg-assets';
import { useState } from 'react';
import { FeedbackTypeStep } from './Steps/FeedbackTypeStep';
import { FeedbackContentStep } from './Steps/FeedbackContentStep';
import { FeedbackSuccessStep } from './Steps/FeedbackSuccessStep';
import { FeedbackType, GitHubConfig } from '../../types';
import { Language, getTranslations } from '../../lib/translations';

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
}

export function WidgetForm({ integration, githubConfig, language }: WidgetFormProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null)
  const [feedbackSent, setFeedbackSent] = useState(false)
  
  function handleRestartFeedback() {
    setFeedbackSent(false); 
    setFeedbackType(null);
  }
  
  return (
    <div className="bg-zinc-900 p-3 md:p-4 relative rounded-2xl mb-4 flex flex-col items-center shadow-lg w-[calc(100vw-2rem)] md:w-auto max-w-md">
      {feedbackSent ? (
        <FeedbackSuccessStep onFeedbackRestartRequest={handleRestartFeedback} language={language} />
      ) : (
        <>
          {!feedbackType ? (
            <FeedbackTypeStep onFeedbackTypeChanged={setFeedbackType} language={language} />
          ) : (
            <FeedbackContentStep
              feedbackType={feedbackType}
              onFeedbackRestartRequest={handleRestartFeedback}
              onFeedbackSent={() => setFeedbackSent(true)}
              integration={integration}
              githubConfig={githubConfig}
              language={language}
            />
          )}
        </>
      )}
      <footer className="text-xs text-neutral-400 mt-2">
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

