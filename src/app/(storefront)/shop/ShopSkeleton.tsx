/**
 * ShopSkeleton — Skeleton UI displayed while the shop page data is loading.
 * Only used in the /shop route via Suspense boundary.
 */
export default function ShopSkeleton() {
  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Breadcrumb skeleton */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Sidebar skeleton */}
        <aside className="hidden md:block w-60 shrink-0 space-y-4">
          {/* Category filter */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
          {/* Price filter */}
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
            ))}
          </div>
        </aside>

        {/* Main content skeleton */}
        <main className="flex-1 min-w-0 space-y-4">
          {/* Search bar skeleton */}
          <div className="h-12 bg-white border border-gray-200 rounded-xl animate-pulse" />

          {/* Sort bar skeleton */}
          <div className="h-14 bg-white rounded-xl border border-gray-100 shadow-sm animate-pulse" />

          {/* Product grid skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* Image placeholder */}
                <div className="aspect-square bg-gray-200 animate-pulse" />
                {/* Text placeholders */}
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                  <div className="h-8 bg-gray-100 rounded-lg animate-pulse mt-2" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
