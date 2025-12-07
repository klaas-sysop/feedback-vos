'use client'


// For local development, use relative imports
//import '../../../src/styles.css'
//import { Widget } from '../../../src/components/Widget'

// For production, use:
import { Widget } from 'feedback-vos'
import 'feedback-vos/styles'


export function FeedbackWidget() {
  // Widget will automatically check NEXT_PUBLIC_FEEDBACK_ENABLED internally
  // If not set or set to 'true', widget is shown
  // If set to 'false', widget is hidden
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

