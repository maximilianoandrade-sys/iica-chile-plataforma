import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminLoading() {
  return (
    <div className="p-6 space-y-6" aria-busy="true" aria-label="Cargando panel de administración">
      <Skeleton variant="text" className="h-8 w-64" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border p-4 space-y-3">
            <Skeleton variant="text" className="h-4 w-24" />
            <Skeleton variant="text" className="h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border">
        <div className="p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
