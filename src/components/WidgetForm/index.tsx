'use client'

import { bugImageUrl, ideaImageUrl, thoughtImageUrl } from '../../lib/svg-assets';
import { useState } from 'react';
import { FeedbackTypeStep } from './Steps/FeedbackTypeStep';
import { FeedbackContentStep } from './Steps/FeedbackContentStep';
import { FeedbackSuccessStep } from './Steps/FeedbackSuccessStep';
import { FeedbackType, NotionConfig, GitHubConfig } from '../../types';

export const feedbackTypes = {
  BUG: {
    title: 'Bug',
    image: {
      source: bugImageUrl,
      alt: 'A purple caterpillar image',
    },
  },
  IDEA: {
    title: 'Idea',
    image: {
      source: ideaImageUrl,
      alt: 'A Lamp image',
    },
  },
  OTHER: {
    title: 'Other',
    image: {
      source: thoughtImageUrl,
      alt: 'A thought balloon image',
    },
  },
}

export type { FeedbackType };

interface WidgetFormProps {
  integration: 'notion' | 'github';
  notionConfig?: NotionConfig;
  githubConfig?: GitHubConfig;
}

export function WidgetForm({ integration, notionConfig, githubConfig }: WidgetFormProps) {
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null)
  const [feedbackSent, setFeedbackSent] = useState(false)
  
  function handleRestartFeedback() {
    setFeedbackSent(false); 
    setFeedbackType(null);
  }
  
  return (
    <div className="bg-zinc-900 p-4 relative rounded-2xl mb-4 flex flex-col items-center shadow-lg w-[calc(100vw-2rem)] md:w-auto">
      {feedbackSent ? (
        <FeedbackSuccessStep onFeedbackRestartRequest={handleRestartFeedback} />
      ) : (
        <>
          {!feedbackType ? (
            <FeedbackTypeStep onFeedbackTypeChanged={setFeedbackType} />
          ) : (
            <FeedbackContentStep
              feedbackType={feedbackType}
              onFeedbackRestartRequest={handleRestartFeedback}
              onFeedbackSent={() => setFeedbackSent(true)}
              integration={integration}
              notionConfig={notionConfig}
              githubConfig={githubConfig}
            />
          )}
        </>
      )}
      <footer className="text-xs text-neutral-400">
        Built with 💜 by{' '}
        <a
          className="underline underline-offset-2"
          href="https://github.com/klaas-sysop"
        >
          Klaas Sysop
        </a>
      </footer>
    </div>
  )
}

