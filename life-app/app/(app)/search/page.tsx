import { Suspense } from 'react'
import { SearchResults } from './search-results'

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8">Search Results</h1>
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  )
}

function SearchResultsSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="h-3 sm:h-4 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-2 sm:h-3 bg-muted rounded w-1/2 mb-2"></div>
          <div className="h-2 sm:h-3 bg-muted rounded w-2/3"></div>
        </div>
      ))}
    </div>
  )
} 