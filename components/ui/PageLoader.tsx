import { Skeleton, DashboardSkeleton, TableSkeleton, FormSkeleton } from './Skeleton'

interface PageLoaderProps {
  variant?: 'dashboard' | 'table' | 'form' | 'card'
}

export default function PageLoader({ variant = 'dashboard' }: PageLoaderProps) {
  if (variant === 'dashboard') {
    return <DashboardSkeleton />
  }

  if (variant === 'table') {
    return <TableSkeleton rows={10} cols={6} />
  }

  if (variant === 'form') {
    return <FormSkeleton />
  }

  if (variant === 'card') {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <Skeleton className="h-6 w-48 mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return null
}
