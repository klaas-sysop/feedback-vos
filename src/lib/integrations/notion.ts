import { FeedbackType } from '../../types';

interface NotionConfig {
  apiKey: string;
  databaseId: string;
}

interface FeedbackData {
  type: FeedbackType;
  comment: string;
  screenshot: string | null;
}

export async function sendToNotion(
  config: NotionConfig,
  data: FeedbackData
): Promise<void> {
  const { apiKey, databaseId } = config;
  const { type, comment, screenshot } = data;

  // Map feedback type to Notion select value
  const typeMap: Record<FeedbackType, string> = {
    BUG: 'Bug',
    IDEA: 'Idea',
    OTHER: 'Other',
  };

  // Build the page properties
  const properties: any = {
    Type: {
      select: {
        name: typeMap[type],
      },
    },
    Comment: {
      rich_text: [
        {
          text: {
            content: comment,
          },
        },
      ],
    },
  };

  // Add screenshot if provided
  const children: any[] = [];
  if (screenshot) {
    // Notion doesn't support data URIs directly, so we'll add it as a paragraph with note
    // For production, you'd want to upload the image to a CDN first
    children.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            text: {
              content: 'Screenshot provided (see comment for details)',
            },
          },
        ],
      },
    });
    
    // Add screenshot as a file property if the database has that field
    // Note: This requires the screenshot to be uploaded to a public URL first
    // For now, we'll store the data URI in a text field
    properties.Screenshot = {
      rich_text: [
        {
          text: {
            content: screenshot.substring(0, 2000), // Truncate if too long
          },
        },
      ],
    };
  }

  const response = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: {
        database_id: databaseId,
      },
      properties,
      children,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Notion API error: ${error}`);
  }
}

