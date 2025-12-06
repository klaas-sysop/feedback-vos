# Feedback Vos

A beautiful, customizable feedback widget for Next.js applications with built-in integrations for Notion and GitHub Issues.

## Features

- 🎨 Modern and responsive design
- 📸 Screenshot functionality
- 🎯 Three feedback types: Bug, Idea, Other
- ⚡ Built for Next.js 14+ (App Router)
- 🎨 Tailwind CSS styling
- 📱 Mobile-friendly
- 🔄 Real-time feedback submission
- 🔌 Built-in integrations:
  - **Notion API** - Send feedback directly to your Notion database
  - **GitHub Issues** - Create issues automatically from feedback

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
          integration="notion"
          notionConfig={{
            apiKey: process.env.NEXT_PUBLIC_NOTION_API_KEY!,
            databaseId: process.env.NEXT_PUBLIC_NOTION_DATABASE_ID!,
          }}
        />
      </body>
    </html>
  );
}
```

## Configuration

### Notion Integration

1. **Create a Notion Integration:**
   - Go to https://www.notion.so/my-integrations
   - Click "New integration"
   - Give it a name and select your workspace
   - Copy the "Internal Integration Token"

2. **Create a Notion Database:**
   Create a database with the following properties:
   - `Type` (Select property): Options should be `Bug`, `Idea`, `Other`
   - `Comment` (Rich Text property)
   - `Screenshot` (Files & Media property) - Optional
   - `Created At` (Created Time property) - Optional but recommended

3. **Share the database with your integration:**
   - Open your database
   - Click "..." in the top right
   - Select "Add connections"
   - Choose your integration

4. **Get your Database ID:**
   - Open your database in Notion
   - The URL will look like: `https://www.notion.so/workspace/DATABASE_ID?v=...`
   - Copy the `DATABASE_ID` (32 character hex string)

5. **Configure in your app:**
   ```tsx
   <Widget
     integration="notion"
     notionConfig={{
       apiKey: process.env.NEXT_PUBLIC_NOTION_API_KEY!,
       databaseId: process.env.NEXT_PUBLIC_NOTION_DATABASE_ID!,
     }}
   />
   ```

### GitHub Integration

1. **Create a GitHub Personal Access Token:**
   - Go to https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Give it a name and select scope: `repo` (for private repos) or `public_repo` (for public repos)
   - Copy the token

2. **Configure in your app:**
   ```tsx
   <Widget
     integration="github"
     githubConfig={{
       token: process.env.NEXT_PUBLIC_GITHUB_TOKEN!,
       owner: 'your-username',
       repo: 'your-repo-name',
     }}
   />
   ```

## API Reference

### Widget Props

```typescript
interface WidgetProps {
  integration: 'notion' | 'github';
  notionConfig?: NotionConfig;
  githubConfig?: GitHubConfig;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

interface NotionConfig {
  apiKey: string;
  databaseId: string;
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

### Notion Integration

```tsx
import { Widget } from 'feedback-vos';
import 'feedback-vos/styles';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        {children}
        <Widget
          integration="notion"
          notionConfig={{
            apiKey: process.env.NEXT_PUBLIC_NOTION_API_KEY!,
            databaseId: process.env.NEXT_PUBLIC_NOTION_DATABASE_ID!,
          }}
          position="bottom-right"
        />
      </body>
    </html>
  );
}
```

### GitHub Integration

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
          position="bottom-left"
        />
      </body>
    </html>
  );
}
```

## Environment Variables

Add these to your `.env.local` file:

```env
# For Notion
NEXT_PUBLIC_NOTION_API_KEY=secret_...
NEXT_PUBLIC_NOTION_DATABASE_ID=...

# For GitHub
NEXT_PUBLIC_GITHUB_TOKEN=ghp_...
```

**Note:** Since these are `NEXT_PUBLIC_` variables, they will be exposed to the client. For production, consider using a backend API route to handle the integrations server-side.

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
