export type FeedbackType = 'BUG' | 'IDEA' | 'OTHER';

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

export interface WidgetProps {
  integration: 'github';
  githubConfig: GitHubConfig;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

