export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h2 className="text-4xl font-bold mb-4">404</h2>
        <p className="text-xl mb-4">This page could not be found.</p>
        <a
          href="/"
          className="inline-block bg-brand-purple text-white px-6 py-3 rounded-md hover:bg-purple-700"
        >
          Go back home
        </a>
      </div>
    </div>
  )
}
