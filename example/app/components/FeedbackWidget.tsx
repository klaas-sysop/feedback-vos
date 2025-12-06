'use client'

import { Widget } from 'feedback-vos'
import 'feedback-vos/styles'

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
    />
  )
}

