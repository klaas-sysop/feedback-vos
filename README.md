# Feedback Vos

A beautiful, customizable feedback widget for Next.js applications with built-in integration for GitHub Issues.

## Features

- 🎨 Modern and responsive design
- 📸 Screenshot functionality
- 🎯 Three feedback types: Bug, Idea, Other
- ⚡ Built for Next.js 14+ (App Router)
- 🎨 Tailwind CSS styling
- 📱 Mobile-friendly
- 🔄 Real-time feedback submission
- 🔌 Built-in GitHub Issues integration - Create issues automatically from feedback

## Installation

```bash
npm install feedback-vos
# or
yarn add feedback-vos
# or
pnpm add feedback-vos
```

## Quick Start

### 1. Import the Widget

```tsx
import { Widget } from 'feedback-vos';
import 'feedback-vos/styles';
```

### 2. Add to your Layout

```tsx
// app/layout.tsx
import { Widget } from 'feedback-vos';
import 'feedback-vos/styles';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Widget
          integration="github"
          githubConfig={{
            token: process.env.NEXT_PUBLIC_GITHUB_TOKEN!,
            owner: 'your-username',
            repo: 'your-repo-name',
          }}
        />
      </body>
    </html>
  );
}
```

## Configuration

### GitHub Integration

1. **Create a GitHub Personal Access Token:**
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Give it a name and select scope: `repo` (for private repos) or `public_repo` (for public repos)
   - slect isssue premision
   - Copy the token

2. **Set up environment variables:**
   Create a `.env.local` file in your Next.js project root with:
   ```env
   NEXT_PUBLIC_GITHUB_TOKEN=your_github_token_here
   ```

3. **Configure in your app:**
   ```tsx
   <Widget
     integration="github"
     githubConfig={{
       token: process.env.NEXT_PUBLIC_GITHUB_TOKEN!,
       owner: 'your-username',  // Your GitHub username or organization name
       repo: 'your-repo-name',   // Repository name (case-sensitive)
     }}
     position="bottom-right"
   />
   ```

**Important Notes:**
- The `owner` and `repo` values are **case-sensitive** - make sure they match exactly
- The repository must exist and be accessible with your token
- For private repositories, your token needs the `repo` scope
- For public repositories, your token needs the `public_repo` scope
- Make sure Issues are enabled in your repository settings

## API Reference

### Widget Props

```typescript
interface WidgetProps {
  integration: 'github';
  githubConfig: GitHubConfig;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
}
```

### Position Options

- `bottom-right` (default) - Bottom right corner
- `bottom-left` - Bottom left corner
- `top-right` - Top right corner
- `top-left` - Top left corner

## Examples

### Basic GitHub Integration

```tsx
import { Widget } from 'feedback-vos';
import 'feedback-vos/styles';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Widget
          integration="github"
          githubConfig={{
            token: process.env.NEXT_PUBLIC_GITHUB_TOKEN!,
            owner: 'klaas-sysop',
            repo: 'my-project',
          }}
          position="bottom-right"
        />
      </body>
    </html>
  );
}
```

## Environment Variables

Add these to your `.env.local` file:

```env
# For GitHub
NEXT_PUBLIC_GITHUB_TOKEN=ghp_...
```

**Note:** Since this is a `NEXT_PUBLIC_` variable, it will be exposed to the client. For production, consider using a backend API route to handle the integration server-side.

## How It Works

When a user submits feedback through the widget:

1. The feedback type (Bug, Idea, or Other) is captured
2. The user's comment is included
3. If a screenshot was taken:
   - It's automatically compressed and optimized
   - Uploaded to your repository in `.feedback-screenshots/` folder
   - The image URL is included in the issue (not base64, so no size limits!)
4. A GitHub issue is automatically created with:
   - Title: `[TYPE] Feedback`
   - Body: Contains the comment and screenshot (if provided)
   - Labels: `feedback` and the feedback type (e.g., `bug`, `idea`, `other`)

**Note:** 
- Labels must exist in your repository. If they don't exist, GitHub will ignore them. You can create these labels in your repository settings under Issues → Labels.
- Screenshots are stored in `.feedback-screenshots/` folder in your repository. Make sure your token has write access to create files.

## Troubleshooting

### 404 Error: Not Found

If you get a 404 error, check:

1. **Repository exists:** Verify that `owner/repo` exists and is accessible
2. **Case sensitivity:** GitHub repository names are case-sensitive - make sure `owner` and `repo` match exactly
3. **Token access:** Your token must have access to the repository
4. **Issues enabled:** Make sure Issues are enabled in your repository settings (Settings → General → Features → Issues)

### 401 Error: Unauthorized

- Your GitHub token is invalid or expired
- Token doesn't have the required scope (`repo` for private repos, `public_repo` for public repos)
- Generate a new token at https://github.com/settings/tokens

### 403 Error: Forbidden

- Token doesn't have permission to create issues
- Repository has Issues disabled
- Rate limit exceeded (check your GitHub API rate limits)

## Styling

The widget uses Tailwind CSS. Make sure Tailwind is configured in your Next.js project. The widget styles are automatically included when you import `'feedback-vos/styles'`.

### Custom Colors

You can customize the brand colors by overriding Tailwind classes in your global CSS:

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Override brand colors */
.bg-brand-500 {
  background-color: #your-color;
}
```

## TypeScript Support

This package includes TypeScript definitions. No additional setup required.

## Requirements

- Next.js 14+
- React 18+
- Tailwind CSS (should already be in your Next.js project)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.

## Publishing

This package is ready to be published to npm. To publish:

1. **Ensure you're logged in to npm:**
   ```bash
   npm login
   ```

2. **Verify the build works:**
   ```bash
   npm run build
   ```
   This will generate the `dist/` folder with all necessary files.

3. **Check what will be published:**
   ```bash
   npm pack --dry-run
   ```
   This shows exactly which files will be included in the package.

4. **Publish to npm:**
   ```bash
   npm publish
   ```
   
   For the first publish, the package will be public by default. If you need to explicitly set access:
   ```bash
   npm publish --access public
   ```

5. **Update version for subsequent releases:**
   ```bash
   npm version patch  # for bug fixes (1.0.0 -> 1.0.1)
   npm version minor  # for new features (1.0.0 -> 1.1.0)
   npm version major  # for breaking changes (1.0.0 -> 2.0.0)
   npm publish
   ```

The `prepublishOnly` script in `package.json` will automatically run the build before publishing, ensuring the latest code is included.

## Support

For issues, questions, or feature requests, please open an issue on [GitHub](https://github.com/klaas-sysop/npm-feedback-vos).

---

Built with 💜 by [Klaas Sysop](https://github.com/klaas-sysop)
