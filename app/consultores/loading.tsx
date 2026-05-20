import { Skeleton } from "@/components/ui/Skeleton";

export default function ConsultoresLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6" aria-busy="true" aria-label="Cargando directorio de consultores">
      {/* Hero stats */}
      <div className="text-center space-y-4">
        <Skeleton variant="text" className="h-10 w-64 mx-auto" />
        <Skeleton variant="text" className="h-5 w-96 mx-auto" />
      </div>
      {/* Search + filters */}
      <Skeleton className="h-12 w-full max-w-md mx-auto" />
      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" className="h-12 w-12" />
              <div className="space-y-2 flex-1">
                <Skeleton variant="text" className="h-5 w-32" />
                <Skeleton variant="text" className="h-3 w-24" />
              </div>
            </div>
            <Skeleton className="h-16 w-full" />
            <div className="flex gap-2">
              <Skeleton variant="text" className="h-6 w-16 rounded-full" />
              <Skeleton variant="text" className="h-6 w-20 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
