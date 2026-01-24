export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-gray-200 rounded mb-6" />
      <div className="grid gap-4">
        <div className="h-24 bg-gray-100 rounded" />
        <div className="h-24 bg-gray-100 rounded" />
        <div className="h-24 bg-gray-100 rounded" />
      </div>
    </div>
  )
}
