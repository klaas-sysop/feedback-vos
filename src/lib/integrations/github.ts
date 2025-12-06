import { FeedbackType } from '../../types';

interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}

interface FeedbackData {
  type: FeedbackType;
  comment: string;
  screenshot: string | null;
}

export async function sendToGitHub(
  config: GitHubConfig,
  data: FeedbackData
): Promise<void> {
  const { token, owner, repo } = config;
  const { type, comment, screenshot } = data;

  // Build issue title
  const title = `[${type}] Feedback`;

  // Build issue body
  let body = `**Type:** ${type}\n\n**Comment:**\n${comment}`;

  // Add screenshot as base64 image in body if provided
  if (screenshot) {
    body += `\n\n**Screenshot:**\n![Screenshot](${screenshot})`;
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/issues`,
    {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        body,
        labels: ['feedback', type.toLowerCase()],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`GitHub API error: ${error}`);
  }
}

