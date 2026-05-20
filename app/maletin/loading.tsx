import { Skeleton } from "@/components/ui/Skeleton";

export default function MaletinLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6" aria-busy="true" aria-label="Cargando maletín técnico">
      {/* Header */}
      <Skeleton variant="text" className="h-8 w-48" />
      {/* Tabs */}
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="text" className="h-10 w-24 rounded-full" />
        ))}
      </div>
      {/* Search */}
      <Skeleton className="h-12 w-full max-w-sm" />
      {/* File grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-4 space-y-3">
            <Skeleton variant="rectangular" className="h-24 w-full" />
            <Skeleton variant="text" className="h-4 w-3/4" />
            <Skeleton variant="text" className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
