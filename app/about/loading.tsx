import { Skeleton } from "@/components/ui/Skeleton";

export default function AboutLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8" aria-busy="true" aria-label="Cargando información institucional">
      {/* Hero */}
      <div className="text-center space-y-4">
        <Skeleton variant="text" className="h-10 w-80 mx-auto" />
        <Skeleton variant="text" className="h-5 w-64 mx-auto" />
      </div>
      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="text-center space-y-2">
            <Skeleton variant="text" className="h-8 w-16 mx-auto" />
            <Skeleton variant="text" className="h-4 w-24 mx-auto" />
          </div>
        ))}
      </div>
      {/* Content sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-48 w-full" />
        <div className="space-y-3">
          <Skeleton variant="text" className="h-6 w-40" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
