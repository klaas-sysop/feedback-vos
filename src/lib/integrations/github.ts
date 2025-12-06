import { FeedbackType, GitHubConfig } from '../../types';

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
  screenshot: string,
  screenshotPath?: string
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
  
  // Use configured path or default to '.feedback-vos'
  const folderPath = screenshotPath || '.feedback-vos';
  
  // Generate unique filename
  const timestamp = Date.now();
  const randomId = Math.random().toString(36).substring(2, 9);
  const filename = `feedback-${timestamp}-${randomId}.jpg`;
  const path = `${folderPath}/${filename}`;
  
  // Convert binary to base64 for GitHub API
  const base64Content = btoa(String.fromCharCode(...binaryData));
  
  // Try to create the folder if it doesn't exist
  // Check if folder exists by trying to get it
  const folderCheckUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}`;
  
  try {
    const folderCheck = await fetch(folderCheckUrl, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'feedback-vos',
      },
    });
    
    // If folder doesn't exist (404), create it with a README.md file
    if (folderCheck.status === 404) {
      const readmeContent = btoa('# Feedback Screenshots\n\nThis folder contains screenshots from user feedback.\n');
      try {
        const folderCreateResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${folderPath}/README.md`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
            'User-Agent': 'feedback-vos',
          },
          body: JSON.stringify({
            message: 'Create feedback screenshots folder',
            content: readmeContent,
            branch: defaultBranch,
          }),
        });
        
        if (!folderCreateResponse.ok) {
          const folderError = await folderCreateResponse.json().catch(() => ({}));
          console.warn('Could not create folder, proceeding with upload anyway:', folderError);
        } else {
          console.log(`Folder ${folderPath} created successfully`);
        }
      } catch (folderCreateError) {
        // Ignore errors creating folder - might already exist or permission issue
        console.warn('Could not create folder, proceeding with upload:', folderCreateError);
      }
    } else if (folderCheck.status === 200) {
      // Folder exists, check if it's actually a folder (should return array) or a file
      const folderData = await folderCheck.json().catch(() => null);
      if (folderData && !Array.isArray(folderData)) {
        // It's a file, not a folder - this will cause issues
        throw new Error(`Path "${folderPath}" exists as a file, not a folder. Please use a different path or remove the file.`);
      }
      console.log(`Folder ${folderPath} already exists`);
    }
  } catch (folderError) {
    // If it's our custom error, re-throw it
    if (folderError instanceof Error && folderError.message.includes('exists as a file')) {
      throw folderError;
    }
    // Ignore other folder errors - proceed with upload
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
  
  // Return the GitHub blob URL with ?raw=true for direct image access in markdown
  // Format: https://github.com/owner/repo/blob/branch/path?raw=true
  // This URL will work in GitHub issues and markdown
  const rawUrl = `https://github.com/${owner}/${repo}/blob/${defaultBranch}/${path}?raw=true`;
  
  console.log(`Screenshot uploaded successfully to: ${rawUrl}`);
  
  // Return the raw URL (works better in GitHub issues)
  return rawUrl;
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
  const { token, owner, repo, screenshotPath } = config;
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

  // Limit comment length early to prevent body from being too long
  // GitHub's absolute limit is 65536 characters
  // Base body text: "**Type:** ${type}\n\n**Comment:**\n" ≈ 30 chars
  // Screenshot URL: "![Screenshot](url)" ≈ 150 chars
  // Safety margin: 1000 chars
  // So max comment length: 65536 - 30 - 150 - 1000 = 64356
  const ABSOLUTE_MAX_LENGTH = 65536;
  const BASE_BODY_LENGTH = 50; // Approximate length of base text
  const SCREENSHOT_URL_LENGTH = 150; // Approximate length of screenshot markdown
  const SAFETY_MARGIN = 1000; // Safety margin for any additional formatting
  const MAX_COMMENT_LENGTH = ABSOLUTE_MAX_LENGTH - BASE_BODY_LENGTH - SCREENSHOT_URL_LENGTH - SAFETY_MARGIN;
  
  const limitedComment = comment.length > MAX_COMMENT_LENGTH 
    ? comment.substring(0, MAX_COMMENT_LENGTH) + '\n\n... (comment truncated)'
    : comment;

  // Build issue body
  let body = `**Type:** ${type}\n\n**Comment:**\n${limitedComment}`;

  // Upload screenshot to repository if provided
  // This avoids the 65536 character limit by storing the image as a file
  if (screenshot) {
    try {
      console.log('Uploading screenshot to repository...');
      console.log('Screenshot path:', screenshotPath || '.feedback-vos');
      const screenshotUrl = await uploadScreenshotToRepo(token, owner, repo, screenshot, screenshotPath);
      console.log('Screenshot uploaded successfully, URL:', screenshotUrl);
      // Add screenshot reference (just the image, link is redundant)
      body += `\n\n**Screenshot:**\n![Screenshot](${screenshotUrl})`;
      console.log('Body length after adding screenshot URL:', body.length);
    } catch (error) {
      // If upload fails, skip screenshot entirely (don't use base64 as it's too large)
      console.error('Failed to upload screenshot to repository:', error);
      // Don't add error message to body - just note that screenshot failed
      // This keeps the body short
      body += `\n\n**Screenshot:** Upload failed - screenshot not included.`;
      console.log('Body length after upload failure:', body.length);
    }
  }
  
  // CRITICAL: Final safety check - ensure body is ALWAYS within limit before sending
  // GitHub's absolute limit is 65536 characters
  const SAFE_MAX_LENGTH = 65000; // Use 65000 as safe margin
  
  // Log body length for debugging
  console.log(`Issue body length before final check: ${body.length} characters`);
  
  // If body is too long, truncate it progressively
  if (body.length > SAFE_MAX_LENGTH) {
    console.warn(`Body is too long (${body.length}), truncating...`);
    
    // Calculate how much we need to reduce
    const excess = body.length - SAFE_MAX_LENGTH;
    
    // Find the comment section
    const commentStartMarker = '\n\n**Comment:**\n';
    const commentStart = body.indexOf(commentStartMarker);
    const screenshotStart = body.indexOf('\n\n**Screenshot:**');
    
    if (commentStart > 0) {
      // Calculate comment boundaries
      const commentStartPos = commentStart + commentStartMarker.length;
      const commentEndPos = screenshotStart > 0 ? screenshotStart : body.length;
      const currentComment = body.substring(commentStartPos, commentEndPos);
      
      // Calculate new comment length (reduce by excess + safety margin)
      const newCommentLength = Math.max(100, currentComment.length - excess - 500);
      const truncatedComment = currentComment.substring(0, newCommentLength) + '\n\n... (truncated due to size limit)';
      
      // Rebuild body with truncated comment
      const beforeComment = body.substring(0, commentStartPos);
      const afterComment = screenshotStart > 0 ? body.substring(screenshotStart) : '';
      body = beforeComment + truncatedComment + afterComment;
    }
  }
  
  // Absolute final check - if still too long, force truncate aggressively
  if (body.length >= ABSOLUTE_MAX_LENGTH) {
    console.error(`Body STILL too long after truncation: ${body.length} characters. Force truncating.`);
    
    const baseText = `**Type:** ${type}\n\n**Comment:**\n`;
    const maxCommentLength = ABSOLUTE_MAX_LENGTH - baseText.length - 1000; // Large margin for screenshot text
    
    // Use original comment, not limitedComment, to ensure we get a fresh truncation
    const safeComment = comment.substring(0, Math.max(100, maxCommentLength)) + '\n\n... (truncated due to size limit)';
    body = baseText + safeComment;
    
    // Remove screenshot if present (it will be added back if upload succeeds, but with URL not base64)
    const screenshotIndex = body.indexOf('\n\n**Screenshot:**');
    if (screenshotIndex > 0) {
      body = body.substring(0, screenshotIndex) + '\n\n**Screenshot:** Not included due to size limit.';
    }
  }
  
  // Final verification - ensure we're under the limit
  if (body.length >= ABSOLUTE_MAX_LENGTH) {
    // Emergency: use minimal body
    const minimalBase = `**Type:** ${type}\n\n**Comment:**\n`;
    const maxSafeComment = ABSOLUTE_MAX_LENGTH - minimalBase.length - 100;
    const minimalComment = comment.substring(0, Math.max(50, maxSafeComment)) + '\n\n... (truncated)';
    body = minimalBase + minimalComment;
  }
  
  console.log(`Final issue body length: ${body.length} characters (limit: ${ABSOLUTE_MAX_LENGTH})`);
  
  // Final hard check - throw error if still too long (should never happen)
  if (body.length >= ABSOLUTE_MAX_LENGTH) {
    throw new Error(`CRITICAL: Cannot create issue - body is ${body.length} characters, exceeds GitHub limit of ${ABSOLUTE_MAX_LENGTH}.`);
  }

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

