export function LivePreview() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-white p-4">
      <div className="flex min-h-[80%] w-full flex-col items-center justify-center rounded-lg border p-8 shadow-sm">
        <h1 className="text-4xl font-bold">Welcome to CodeMind</h1>
        <p className="mt-4 text-xl">The intelligent AI coding assistant for your projects</p>

        <div className="mt-8">
          <button className="rounded-md bg-black px-4 py-2 text-white">Count: 0</button>
        </div>
      </div>
    </div>
  )
}
