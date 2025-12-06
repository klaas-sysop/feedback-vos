export default function Home() {
  return (
    <main className="min-h-screen p-8 md:p-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          Feedback Vos Example
        </h1>
        <p className="text-zinc-400 mb-8">
          This is an example page to test the feedback-vos widget locally.
          Click the feedback button in the bottom-right corner to test the widget.
        </p>

        <div className="bg-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Features to Test</h2>
          <ul className="list-disc list-inside space-y-2 text-zinc-300">
            <li>Widget button appears in bottom-right corner</li>
            <li>Click to open feedback form</li>
            <li>Select feedback type (Bug, Idea, Other)</li>
            <li>Add comment and optional screenshot</li>
            <li>Submit feedback to Notion (if configured)</li>
          </ul>
        </div>

        <div className="bg-zinc-800 rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Configuration</h2>
          <p className="text-zinc-300 mb-4">
            To test with Notion integration, create a <code className="bg-zinc-900 px-2 py-1 rounded">.env.local</code> file with:
          </p>
          <pre className="bg-zinc-900 p-4 rounded overflow-x-auto">
            <code className="text-sm">
{`NEXT_PUBLIC_NOTION_API_KEY=your_notion_api_key
NEXT_PUBLIC_NOTION_DATABASE_ID=your_database_id`}
            </code>
          </pre>
          <p className="text-zinc-400 text-sm mt-4">
            See the main README.md for instructions on setting up Notion integration.
          </p>
        </div>
      </div>
    </main>
  )
}

