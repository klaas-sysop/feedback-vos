'use client'

import { Widget } from 'feedback-vos'
import 'feedback-vos/styles'

export function FeedbackWidget() {
  return (
    <Widget
      integration="notion"
      notionConfig={{
        apiKey: process.env.NEXT_PUBLIC_NOTION_API_KEY || '',
        databaseId: process.env.NEXT_PUBLIC_NOTION_DATABASE_ID || '',
      }}
      position="bottom-right"
    />
  )
}

