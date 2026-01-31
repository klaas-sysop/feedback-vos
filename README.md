# Feedback Vos

A beautiful, customizable feedback widget for Next.js applications with built-in GitHub Issues integration.

## Links

- 📦 [NPM Package](https://www.npmjs.com/package/feedback-vos)
- 🐙 [GitHub Repository](https://github.com/klaas-sysop/feedback-vos)
- 🎨 [Live Demo](https://feedback.vossendesign.nl/)

## Features

- 🎨 Modern and responsive design with dark/light theme support
- 📸 Screenshot functionality
- 🎯 Three feedback types: Bug, Idea, Other
- ⚡ Built for Next.js 14+ and 16+ (App Router)
- 🔌 Automatic GitHub Issues creation

## Installation

```bash
npm install feedback-vos
```

## Quick Start

Since the Widget component requires client-side features, you need to create a client component wrapper.

**Step 1:** Create a client component wrapper:

```tsx
// app/components/FeedbackWidget.tsx
'use client'

import { Widget } from 'feedback-vos'
import 'feedback-vos/styles'

export default function FeedbackWidget() {
  return (
    <Widget
      integration="github"
      githubConfig={{
        token: process.env.NEXT_PUBLIC_GITHUB_TOKEN!,
        owner: process.env.NEXT_PUBLIC_GITHUB_OWNER!,
        repo: process.env.NEXT_PUBLIC_GITHUB_REPO!,
      }}
      position={process.env.NEXT_PUBLIC_FEEDBACK_POSITION as 'bottom-right' | 'bottom-left' | undefined}
      language={process.env.NEXT_PUBLIC_FEEDBACK_LANG as 'en' | 'nl' | undefined}
      theme={process.env.NEXT_PUBLIC_FEEDBACK_THEME as 'light' | 'dark' | undefined}
    />
  )
}
```

**Important:** 
- The `'use client'` directive must be at the very top of the file (before any imports)
- Both imports (`Widget` and `'feedback-vos/styles'`) are required
- Make sure the file is saved and your dev server is restarted after creating this component

**Step 2:** Use the wrapper in your layout:

```tsx
// app/layout.tsx
import FeedbackWidget from './components/FeedbackWidget'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <FeedbackWidget />
      </body>
    </html>
  )
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
   NEXT_PUBLIC_FEEDBACK_POSITION=bottom-right  # optional: bottom-left, top-right, top-left
   NEXT_PUBLIC_FEEDBACK_LANG=nl  # optional: 'nl' for Dutch, 'en' for English (default)
   NEXT_PUBLIC_FEEDBACK_THEME=light
   NEXT_PUBLIC_FEEDBACK_ENABLED=true  # optional: set to 'false' to disable widget (default: 'true')
   ```

**Important:** `owner` and `repo` are case-sensitive. Ensure Issues are enabled in your repository.

### Environment-Specific Configuration

You can control widget visibility per environment using `NEXT_PUBLIC_FEEDBACK_ENABLED`:

```env
# Production - disable widget
NEXT_PUBLIC_FEEDBACK_ENABLED=false

# Staging - enable widget
NEXT_PUBLIC_FEEDBACK_ENABLED=true
```

**Note:** The widget is enabled by default if `NEXT_PUBLIC_FEEDBACK_ENABLED` is not set, ensuring backward compatibility.

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
  position?: 'bottom-right' | 'bottom-left'; // or use NEXT_PUBLIC_FEEDBACK_POSITION env var
  language?: 'en' | 'nl'; // defaults to 'en', or use NEXT_PUBLIC_FEEDBACK_LANG env var
  theme?: 'light' | 'dark'; // defaults to 'dark', or use NEXT_PUBLIC_FEEDBACK_THEME env var
}
```

## How It Works

When feedback is submitted:
1. Feedback type and comment are captured
2. Screenshots are compressed and uploaded to `.feedback-vos/` in your repo
3. A GitHub issue is created with labels `feedback` and the feedback type

**Note:** Labels must exist in your repository. Screenshots are stored in your repo (no size limits).

## Troubleshooting

### Using with non-Tailwind Projects

This plugin is designed to be isolated and work within any project, regardless of whether it uses Tailwind CSS or not. 

- **CSS Isolation:** The plugin's CSS is scoped to `[data-feedback-widget]` and does not include Tailwind's global preflight resets, so it won't affect your existing site's styles.
- **Global Styles:** You can safely import `feedback-vos/styles` (or `dist/styles.css`) in your global CSS file or root layout without worrying about side effects.

### Widget Not Visible (Troubleshooting)
 
The widget uses inline styles to ensure it's always visible, even with CSS conflicts. If the widget is still not showing up, check the following:

1. **Verify the client component wrapper is created correctly:**
   - Ensure `'use client'` directive is at the top of your `FeedbackWidget.tsx`
   - Verify the component is imported and used in `layout.tsx`

2. **Check environment variables:**
   - Ensure all `NEXT_PUBLIC_*` variables are in `.env.local` (not `.env`)
   - Restart your Next.js dev server after adding/changing environment variables
   - Verify `NEXT_PUBLIC_FEEDBACK_ENABLED` is not set to `'false'` or `'0'`

3. **Verify styles are imported:**
   - Ensure `import 'feedback-vos/styles'` is in your `FeedbackWidget.tsx`
   - Check browser console for CSS loading errors

4. **Check for CSS conflicts:**
   - The widget uses `z-50` for positioning - ensure no other styles override this
   - Verify Tailwind CSS is properly configured in your project
   - **CRITICAL:** The widget requires `brand` colors in your Tailwind config (see Requirements section below)
   - **Widget outside viewport or not visible:** If the widget appears outside the screen or is not visible, add this CSS to your global stylesheet (e.g., `globals.css`):
     ```css
     [data-feedback-widget="true"] {
       position: fixed !important;
       bottom: 1rem !important;
       right: 1rem !important;
       z-index: 9999 !important;
     }
     ```
     This ensures the widget is always visible regardless of CSS conflicts or parent container transforms.

5. **Debug in browser console:**
   ```javascript
   // Check if widget element exists
   document.querySelector('[data-feedback-widget="true"]')
   
   // Check environment variable (client-side)
   console.log(process.env.NEXT_PUBLIC_FEEDBACK_ENABLED)
   ```

6. **Common mistakes:**
   - ❌ Forgetting to add `'use client'` directive
   - ❌ Not importing `'feedback-vos/styles'`
   - ❌ Using `.env` instead of `.env.local` for environment variables
   - ❌ Not restarting the dev server after adding environment variables
   - ❌ Importing `Widget` directly in `layout.tsx` instead of using the wrapper component
   - ❌ **Missing `brand` colors in Tailwind config (widget button will be invisible!)**

### GitHub Integration Issues

- **404:** Check repository exists, case-sensitive `owner/repo`, token access, Issues enabled
- **401:** Invalid/expired token or missing scope
- **403:** No issue permissions, Issues disabled, or rate limit exceeded

## Requirements

- Next.js 14+ or 16+
- React 18+ or 19+
- Tailwind CSS

### Tailwind CSS Configuration

The widget uses custom brand colors. Add these to your `tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // ... your existing config
  theme: {
    extend: {
      colors: {
        brand: {
          300: '#E86A4A',
          400: '#E86A4A', // Optional, for hover states
          500: '#D4421E',
        }
      },
    },
  },
}
```

**Important:** Without these brand colors, the widget button will not be visible!

## License

MIT License

---

[Vossen Design](https://vossendesign.nl)
