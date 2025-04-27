"use client"

export function CodeEditor() {
  // In a real implementation, this would use Monaco Editor or a similar component
  return (
    <div className="h-full w-full overflow-auto bg-background p-4 font-mono text-sm">
      <pre className="text-sm">
        <code className="language-tsx">
          {`import { useState } from "react";

export default function Page() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">Welcome to CodeMind</h1>
      <p className="mt-4 text-xl">
        The intelligent AI coding assistant for your projects
      </p>
      
      <div className="mt-8">
        <button
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
          onClick={() => setCount(count + 1)}
        >
          Count: {count}
        </button>
      </div>
    </div>
  );
}`}
        </code>
      </pre>
    </div>
  )
}
