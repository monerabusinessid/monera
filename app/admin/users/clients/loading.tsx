export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-56 bg-gray-200 rounded mb-4" />
      <div className="h-4 w-80 bg-gray-200 rounded mb-8" />
      <div className="space-y-3">
        <div className="h-10 bg-gray-100 rounded" />
        <div className="h-10 bg-gray-100 rounded" />
        <div className="h-10 bg-gray-100 rounded" />
      </div>
    </div>
  )
}
