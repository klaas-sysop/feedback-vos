export type FeedbackType = 'BUG' | 'IDEA' | 'OTHER';

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  screenshotPath?: string; // Optional: path where screenshots are stored (default: 'feedback-screenshots')
}

export interface WidgetProps {
  integration: 'github';
  githubConfig: GitHubConfig;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  language?: 'en' | 'nl';
}

