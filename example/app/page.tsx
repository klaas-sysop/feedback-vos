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
            <li>Submit feedback to GitHub Issues</li>
          </ul>
        </div>

        <div className="bg-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Configuration</h2>
          <p className="text-zinc-300 mb-4">
            To test with GitHub integration, create a <code className="bg-zinc-900 px-2 py-1 rounded">.env.local</code> file with:
          </p>
          <pre className="bg-zinc-900 p-4 rounded overflow-x-auto">
            <code className="text-sm">
{`NEXT_PUBLIC_GITHUB_TOKEN=your_github_token
NEXT_PUBLIC_GITHUB_OWNER=your-username
NEXT_PUBLIC_GITHUB_REPO=your-repo-name`}
            </code>
          </pre>
          <p className="text-zinc-400 text-sm mt-4">
            See the main README.md for instructions on setting up GitHub integration.
          </p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Section 1: Introduction</h2>
          <p className="text-zinc-300 mb-4">
            This is a longer example page to test scrolling behavior. When you take a screenshot,
            it should only capture what's visible in the viewport, not the entire page.
          </p>
          <p className="text-zinc-300 mb-4">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt
            ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation
            ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Section 2: Features</h2>
          <p className="text-zinc-300 mb-4">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat
            nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia
            deserunt mollit anim id est laborum.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="bg-zinc-900 p-4 rounded">
              <h3 className="text-lg font-semibold mb-2">Feature A</h3>
              <p className="text-zinc-400 text-sm">Description of feature A goes here.</p>
            </div>
            <div className="bg-zinc-900 p-4 rounded">
              <h3 className="text-lg font-semibold mb-2">Feature B</h3>
              <p className="text-zinc-400 text-sm">Description of feature B goes here.</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Section 3: Details</h2>
          <p className="text-zinc-300 mb-4">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque
            laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi
            architecto beatae vitae dicta sunt explicabo.
          </p>
          <ul className="list-disc list-inside space-y-2 text-zinc-300">
            <li>First important detail</li>
            <li>Second important detail</li>
            <li>Third important detail</li>
            <li>Fourth important detail</li>
          </ul>
        </div>

        <div className="bg-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Section 4: More Content</h2>
          <p className="text-zinc-300 mb-4">
            Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia
            consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.
          </p>
          <p className="text-zinc-300 mb-4">
            Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci
            velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam
            aliquam quaerat voluptatem.
          </p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Section 5: Examples</h2>
          <p className="text-zinc-300 mb-4">
            Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam,
            nisi ut aliquid ex ea commodi consequatur.
          </p>
          <div className="space-y-4 mt-4">
            <div className="bg-zinc-900 p-4 rounded">
              <h3 className="text-lg font-semibold mb-2">Example 1</h3>
              <p className="text-zinc-400">This is an example of content that extends the page.</p>
            </div>
            <div className="bg-zinc-900 p-4 rounded">
              <h3 className="text-lg font-semibold mb-2">Example 2</h3>
              <p className="text-zinc-400">More example content to make the page scrollable.</p>
            </div>
            <div className="bg-zinc-900 p-4 rounded">
              <h3 className="text-lg font-semibold mb-2">Example 3</h3>
              <p className="text-zinc-400">Even more content to ensure scrolling is needed.</p>
            </div>
          </div>
        </div>

        <div className="bg-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Section 6: Additional Information</h2>
          <p className="text-zinc-300 mb-4">
            Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil
            molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur.
          </p>
          <p className="text-zinc-300 mb-4">
            At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium
            voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint
            occaecati cupiditate non provident.
          </p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Section 7: Final Thoughts</h2>
          <p className="text-zinc-300 mb-4">
            Similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum
            fuga. Et harum quidem rerum facilis est et expedita distinctio.
          </p>
          <p className="text-zinc-300 mb-4">
            Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus
            id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor
            repellendus.
          </p>
        </div>

        <div className="bg-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">Section 8: Conclusion</h2>
          <p className="text-zinc-300 mb-4">
            Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe
            eveniet ut et voluptates repudiandae sint et molestiae non recusandae.
          </p>
          <p className="text-zinc-300 mb-4">
            Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus
            maiores alias consequatur aut perferendis doloribus asperiores repellat.
          </p>
          <p className="text-zinc-400 text-sm mt-4">
            Scroll up and down to test the screenshot functionality. The screenshot should only
            capture what's visible in your viewport, not the entire page.
          </p>
        </div>
      </div>
    </main>
  )
}

