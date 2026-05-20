import { Skeleton } from "@/components/ui/Skeleton";

export default function ProjectLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6" aria-busy="true" aria-label="Cargando proyecto">
      {/* Breadcrumb */}
      <Skeleton variant="text" className="h-4 w-48" />
      {/* Hero card */}
      <div className="bg-white rounded-2xl border p-6 space-y-4">
        <Skeleton variant="text" className="h-6 w-32" />
        <Skeleton variant="text" className="h-10 w-3/4" />
        <Skeleton variant="text" className="h-5 w-48" />
      </div>
      {/* Metrics grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-4 space-y-2">
            <Skeleton variant="text" className="h-4 w-20" />
            <Skeleton variant="text" className="h-6 w-28" />
          </div>
        ))}
      </div>
      {/* Content sections */}
      <div className="bg-white rounded-2xl border p-6 space-y-4">
        <Skeleton variant="text" className="h-6 w-40" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
