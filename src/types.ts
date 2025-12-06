export type FeedbackType = 'BUG' | 'IDEA' | 'OTHER';

export interface NotionConfig {
  apiKey: string;
  databaseId: string;
}

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

export interface WidgetProps {
  integration: 'notion' | 'github';
  notionConfig?: NotionConfig;
  githubConfig?: GitHubConfig;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

