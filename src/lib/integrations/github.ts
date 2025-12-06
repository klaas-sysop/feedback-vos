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

/**
 * Upload screenshot to repository and return the URL
 * This avoids the 65536 character limit by storing the image as a file
 */
async function uploadScreenshotToRepo(
  token: string,
  owner: string,
  repo: string,
  screenshot: string
): Promise<string> {
  // Compress screenshot first
  const compressedScreenshot = await compressScreenshot(screenshot, 1920, 0.7);
  
  // Convert base64 data URL to binary
  const base64Data = compressedScreenshot.split(',')[1]; // Remove data:image/jpeg;base64, prefix
  const binaryData = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
  
  // Get default branch from repository
  const repoResponse = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'feedback-vos',
      },
    }
  );
  
  let defaultBranch = 'main';
  if (repoResponse.ok) {
    const repoData = await repoResponse.json();
    defaultBranch = repoData.default_branch || 'main';
  }
  
  // Generate unique filename
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const filename = `feedback-${timestamp}-${randomId}.jpg`;
  const path = `.feedback-screenshots/${filename}`;
  
  // Convert binary to base64 for GitHub API
  const base64Content = btoa(String.fromCharCode(...binaryData));
  
  // Try to create the .feedback-screenshots folder if it doesn't exist
  // Check if folder exists by trying to get it
  const folderPath = '.feedback-screenshots';
  const folderCheckUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`;
  
  try {
    const folderCheck = await fetch(folderCheckUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'feedback-vos',
      },
    });
    
    // If folder doesn't exist (404), create it with a .gitkeep file
    if (folderCheck.status === 404) {
      const gitkeepContent = btoa('# Feedback screenshots folder\n');
      await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}/.gitkeep`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
          'User-Agent': 'feedback-vos',
        },
        body: JSON.stringify({
          message: 'Create feedback-screenshots folder',
          content: gitkeepContent,
          branch: defaultBranch,
        }),
      }).catch(() => {
        // Ignore errors creating folder - might already exist or permission issue
      });
    }
  } catch (folderError) {
    // Ignore folder creation errors - proceed with upload
    console.warn('Could not verify/create screenshots folder:', folderError);
  }
  
  // Upload to repository using GitHub Contents API
  const uploadUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
  
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'feedback-vos',
    },
    body: JSON.stringify({
      message: `Add feedback screenshot: ${filename}`,
      content: base64Content,
      branch: defaultBranch,
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message || 'Unknown error';
    
    // Provide more helpful error messages
    if (response.status === 409) {
      throw new Error(`File already exists. This is unexpected - please try again.`);
    } else if (response.status === 403) {
      throw new Error(`Permission denied. Make sure your token has write access to the repository.`);
    } else if (response.status === 422) {
      throw new Error(`Validation failed: ${errorMessage}. The file might be too large.`);
    }
    
    throw new Error(`Failed to upload screenshot (${response.status}): ${errorMessage}`);
  }
  
  const uploadData = await response.json();
  // Return the raw URL for direct image access in markdown
  return uploadData.content.download_url || `https://raw.githubusercontent.com/${owner}/${repo}/${defaultBranch}/${path}`;
}

/**
 * Compress and resize screenshot to reduce size
 * GitHub Issues have a 65536 character limit for the body
 * This function only works in browser environments
 */
function compressScreenshot(dataUrl: string, maxWidth: number = 1920, quality: number = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      reject(new Error('Screenshot compression only works in browser environments'));
      return;
    }

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      // Resize if too large
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to JPEG with compression (smaller than PNG)
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = dataUrl;
  });
}

/**
 * Verify that the repository exists and is accessible with the given token
 */
async function verifyRepositoryAccess(
  token: string,
  owner: string,
  repo: string
): Promise<{ exists: boolean; hasIssues: boolean; error?: string }> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'feedback-vos',
        },
      }
    );

    if (response.status === 404) {
      return { exists: false, hasIssues: false, error: 'Repository not found' };
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        exists: false,
        hasIssues: false,
        error: errorData.message || `HTTP ${response.status}`,
      };
    }

    const repoData = await response.json();
    return {
      exists: true,
      hasIssues: repoData.has_issues !== false, // Default is true if not specified
    };
  } catch (error) {
    return {
      exists: false,
      hasIssues: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function sendToGitHub(
  config: GitHubConfig,
  data: FeedbackData
): Promise<void> {
  const { token, owner, repo } = config;
  const { type, comment, screenshot } = data;

  // Validate configuration
  if (!token || !owner || !repo) {
    throw new Error('GitHub configuration is incomplete. Please provide token, owner, and repo.');
  }

  // Verify repository access before attempting to create issue
  const verification = await verifyRepositoryAccess(token, owner, repo);
  if (!verification.exists) {
    throw new Error(
      `Repository "${owner}/${repo}" not found or not accessible.\n` +
      `Error: ${verification.error || 'Unknown error'}\n\n` +
      `Please verify:\n` +
      `- Repository exists at https://github.com/${owner}/${repo}\n` +
      `- Your token has access to this repository\n` +
      `- Token has "repo" scope (for private) or "public_repo" scope (for public)`
    );
  }

  if (!verification.hasIssues) {
    throw new Error(
      `Issues are disabled for repository "${owner}/${repo}".\n\n` +
      `Please enable Issues in repository Settings → General → Features → Issues`
    );
  }

  // Build issue title
  const title = `[${type}] Feedback`;

  // Build issue body
  let body = `**Type:** ${type}\n\n**Comment:**\n${comment}`;

  // Upload screenshot to repository if provided
  // This avoids the 65536 character limit by storing the image as a file
  if (screenshot) {
    try {
      const screenshotUrl = await uploadScreenshotToRepo(token, owner, repo, screenshot);
      body += `\n\n**Screenshot:**\n![Screenshot](${screenshotUrl})`;
    } catch (error) {
      // If upload fails, skip screenshot entirely (don't use base64 as it's too large)
      console.warn('Failed to upload screenshot to repository, skipping screenshot:', error);
      body += `\n\n**Screenshot:** Screenshot upload failed. Please describe the issue in detail.`;
    }
  }
  
  // CRITICAL: Final safety check - ensure body is ALWAYS within limit before sending
  // GitHub's absolute limit is 65536 characters
  const ABSOLUTE_MAX_LENGTH = 65536;
  const SAFE_MAX_LENGTH = 65000; // Use 65000 as safe margin
  
  // Log body length for debugging
  console.log(`Issue body length: ${body.length} characters`);
  
  if (body.length > SAFE_MAX_LENGTH) {
    // First, try to remove screenshot if present
    const screenshotIndex = body.indexOf('\n\n**Screenshot:**');
    if (screenshotIndex > 0) {
      // Check if removing screenshot helps
      const bodyWithoutScreenshot = body.substring(0, screenshotIndex) + '\n\n**Screenshot:** Screenshot was too large to include.';
      if (bodyWithoutScreenshot.length <= SAFE_MAX_LENGTH) {
        body = bodyWithoutScreenshot;
      } else {
        // Still too long, need to truncate comment
        body = bodyWithoutScreenshot;
      }
    }
    
    // If still too long after removing screenshot, truncate comment
    if (body.length > SAFE_MAX_LENGTH) {
      const commentStart = body.indexOf('\n\n**Comment:**\n') + 16;
      if (commentStart > 16) {
        const screenshotIndexAfter = body.indexOf('\n\n**Screenshot:**', commentStart);
        const commentEnd = screenshotIndexAfter > 0 ? screenshotIndexAfter : body.length;
        const maxCommentLength = SAFE_MAX_LENGTH - commentStart - 200; // Leave margin
        
        if (maxCommentLength > 100) {
          const originalComment = body.substring(commentStart, commentEnd);
          const truncatedComment = originalComment.substring(0, maxCommentLength) + '\n\n... (truncated due to size limit)';
          const screenshotPart = screenshotIndexAfter > 0 ? body.substring(screenshotIndexAfter) : '';
          body = body.substring(0, commentStart) + truncatedComment + screenshotPart;
        } else {
          // Can't fit even truncated comment, use minimal body
          body = `**Type:** ${type}\n\n**Comment:** ${comment.substring(0, 500)}... (truncated)\n\n**Screenshot:** Screenshot was too large to include.`;
        }
      }
    }
  }
  
  // Absolute final check - if still too long, force truncate
  if (body.length > ABSOLUTE_MAX_LENGTH) {
    console.error(`Body still too long after all attempts: ${body.length} characters. Force truncating.`);
    body = body.substring(0, SAFE_MAX_LENGTH) + '\n\n... (content truncated due to GitHub size limits)';
  }
  
  // Final verification
  if (body.length > ABSOLUTE_MAX_LENGTH) {
    throw new Error(`Cannot create issue: body is ${body.length} characters, exceeds GitHub limit of ${ABSOLUTE_MAX_LENGTH}`);
  }
  
  console.log(`Final issue body length: ${body.length} characters`);

  const url = `https://api.github.com/repos/${owner}/${repo}/issues`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'feedback-vos',
      },
      body: JSON.stringify({
        title,
        body,
        // Note: Labels must exist in the repository. If they don't exist, GitHub will ignore them.
        // You can create these labels in your repository settings if needed.
        labels: ['feedback', type.toLowerCase()],
      }),
    });

    if (!response.ok) {
      let errorMessage = `GitHub API error (${response.status}): `;
      
      try {
        const errorData = await response.json();
        errorMessage += errorData.message || JSON.stringify(errorData);
        
        // Provide helpful error messages for common issues
        if (response.status === 404) {
          errorMessage += `\n\nTrying to access: ${url}`;
          errorMessage += `\n\nPossible causes:\n`;
          errorMessage += `- Repository "${owner}/${repo}" does not exist or is not accessible\n`;
          errorMessage += `- Token does not have access to this repository\n`;
          errorMessage += `- Check that owner and repo names are correct (case-sensitive)\n`;
          errorMessage += `- Verify the repository URL: https://github.com/${owner}/${repo}\n`;
          errorMessage += `- Make sure Issues are enabled in repository settings\n`;
          errorMessage += `\nTo debug:\n`;
          errorMessage += `1. Visit https://github.com/${owner}/${repo} to verify it exists\n`;
          errorMessage += `2. Check repository Settings → General → Features → Issues (must be enabled)\n`;
          errorMessage += `3. Verify your token has "repo" scope (for private) or "public_repo" scope (for public)\n`;
          errorMessage += `4. Test token access: curl -H "Authorization: Bearer YOUR_TOKEN" https://api.github.com/repos/${owner}/${repo}`;
        } else if (response.status === 401) {
          errorMessage += `\n\nPossible causes:\n`;
          errorMessage += `- Invalid or expired GitHub token\n`;
          errorMessage += `- Token does not have the required "repo" or "public_repo" scope\n`;
          errorMessage += `- Generate a new token at https://github.com/settings/tokens`;
        } else if (response.status === 422) {
          errorMessage += `\n\nPossible causes:\n`;
          errorMessage += `- Issue body is too long (maximum is 65536 characters)\n`;
          errorMessage += `- Screenshot is too large - it will be automatically compressed\n`;
          errorMessage += `- Try reducing the comment length or removing the screenshot\n`;
          errorMessage += `- Invalid label names (labels must exist in the repository)`;
        } else if (response.status === 403) {
          errorMessage += `\n\nPossible causes:\n`;
          errorMessage += `- Token does not have permission to create issues\n`;
          errorMessage += `- Repository has issues disabled\n`;
          errorMessage += `- Rate limit exceeded (check GitHub API rate limits)\n`;
          errorMessage += `- Check repository Settings → General → Features → Issues`;
        }
      } catch (parseError) {
        const errorText = await response.text();
        errorMessage += errorText || 'Unknown error';
      }
      
      throw new Error(errorMessage);
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error(`Failed to create GitHub issue: ${String(error)}`);
  }
}

