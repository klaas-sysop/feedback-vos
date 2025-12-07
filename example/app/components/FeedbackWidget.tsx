'use client'

import { Widget } from '../../../src/components/Widget'

export function FeedbackWidget() {
  return (
    <Widget
      integration="github"
      githubConfig={{
        token: process.env.NEXT_PUBLIC_GITHUB_TOKEN!,
        owner: process.env.NEXT_PUBLIC_GITHUB_OWNER!,
        repo: process.env.NEXT_PUBLIC_GITHUB_REPO!,
      }}
      position={process.env.NEXT_PUBLIC_FEEDBACK_POSITION as 'bottom-right' | 'bottom-left' | undefined}
      language={process.env.NEXT_PUBLIC_FEEDBACK_LANG as 'en' | 'nl' | undefined}
      theme={process.env.NEXT_PUBLIC_FEEDBACK_THEME as 'light' | 'dark' | undefined}
    />
  )
}

