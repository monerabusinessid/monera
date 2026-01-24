'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center p-24">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
            <p className="text-gray-600 mb-4">{error.message}</p>
            <button
              onClick={reset}
              className="bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
