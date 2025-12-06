# Feedback Vos

A beautiful, customizable feedback widget for Next.js applications with built-in GitHub Issues integration.

## Features

- 🎨 Modern and responsive design
- 📸 Screenshot functionality
- 🎯 Three feedback types: Bug, Idea, Other
- ⚡ Built for Next.js 14+ (App Router)
- 🔌 Automatic GitHub Issues creation

## Installation

```bash
npm install feedback-vos
```

## Quick Start

```tsx
// app/layout.tsx
import { Widget } from 'feedback-vos';
import 'feedback-vos/styles';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Widget
          integration="github"
          githubConfig={{
            token: process.env.NEXT_PUBLIC_GITHUB_TOKEN!,
            owner: process.env.NEXT_PUBLIC_GITHUB_OWNER!,
            repo: process.env.NEXT_PUBLIC_GITHUB_REPO!,
          }}
          position="bottom-right"
        />
      </body>
    </html>
  );
}
```

## Configuration

### GitHub Setup

1. Create a GitHub Personal Access Token at https://github.com/settings/tokens with `repo` (private) or `public_repo` (public) scope and issue permissions
2. Add to `.env.local`:
   ```env
   NEXT_PUBLIC_GITHUB_TOKEN=your_github_token_here
   NEXT_PUBLIC_GITHUB_OWNER=your-username
   NEXT_PUBLIC_GITHUB_REPO=your-repo-name
   NEXT_PUBLIC_FEEDBACK_POSITION=bottom-right  # optional: bottom-left
   ```

**Important:** `owner` and `repo` are case-sensitive. Ensure Issues are enabled in your repository.

## API Reference

```typescript
interface WidgetProps {
  integration: 'github';
  githubConfig: {
    token: string;
    owner: string;
    repo: string;
    screenshotPath?: string; // default: '.feedback-vos'
  };
  position?: 'bottom-right' | 'bottom-left';
}
```

## How It Works

When feedback is submitted:
1. Feedback type and comment are captured
2. Screenshots are compressed and uploaded to `.feedback-vos/` in your repo
3. A GitHub issue is created with labels `feedback` and the feedback type

**Note:** Labels must exist in your repository. Screenshots are stored in your repo (no size limits).

## Troubleshooting

- **404:** Check repository exists, case-sensitive `owner/repo`, token access, Issues enabled
- **401:** Invalid/expired token or missing scope
- **403:** No issue permissions, Issues disabled, or rate limit exceeded

## Requirements

- Next.js 14+
- React 18+
- Tailwind CSS

## License

MIT License

---

[Vossen Design](https://vossendesign.nl)
