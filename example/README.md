# Feedback Vos - Example Project

This is an example Next.js project to test the `feedback-vos` widget locally before publishing to npm.

## Setup

1. **Build the parent package first:**
   ```bash
   cd ..
   npm run build
   cd example
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables (required for GitHub integration):**
   
   Create a `.env.local` file in this directory:
   ```env
   NEXT_PUBLIC_GITHUB_TOKEN=your_github_personal_access_token
   ```
   
   **Important:** 
   - Get your GitHub Personal Access Token from https://github.com/settings/tokens
   - Select scope: `repo` (for private repos) or `public_repo` (for public repos)
   - See the main [README.md](../README.md) for detailed instructions on setting up GitHub integration

4. **Update the FeedbackWidget component:**
   
   Edit `app/components/FeedbackWidget.tsx` and update the `githubConfig` with your GitHub username and repository name:
   ```tsx
   githubConfig={{
     token: process.env.NEXT_PUBLIC_GITHUB_TOKEN!,
     owner: 'your-username',
     repo: 'your-repo-name',
   }}
   ```

## Running the Example

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see:
- A demo page with instructions
- A feedback button in the bottom-right corner
- Click the button to test the widget

## Testing the Widget

1. **Visual Testing:**
   - Click the feedback button (bottom-right corner)
   - Verify the widget opens correctly
   - Test all feedback types (Bug, Idea, Other)
   - Test the screenshot functionality
   - Test form submission

2. **Integration Testing:**
   - If you've configured GitHub, test submitting feedback
   - Check your GitHub repository issues to verify feedback was received
   - Test with different feedback types and screenshots

3. **Position Testing:**
   - Modify `app/components/FeedbackWidget.tsx` to test different positions:
     - `bottom-right` (default)
     - `bottom-left`
     - `top-right`
     - `top-left`

## How It Works

The example project uses `file:..` in `package.json` to link to the parent package. This simulates how the package would be used after publishing to npm.

When you make changes to the parent package:
1. Rebuild the parent package: `cd .. && npm run build`
2. The example project will automatically use the new build

## Notes

- The widget requires Tailwind CSS (already configured)
- Make sure the parent package is built before running this example
- The widget uses Next.js 14+ App Router
