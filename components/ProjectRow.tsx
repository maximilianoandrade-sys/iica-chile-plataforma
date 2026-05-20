"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { type Project, daysUntilClose, pluralizeDias } from "@/lib/data";
import { getLogger } from "@/lib/utils/logger";

const logger = getLogger("ProjectRow");

function formatDeadline(project: Project): string {
  const days = daysUntilClose(project);
  if (days === 999) return "Sin fecha definida";
  if (days < 0) return "Cerrada";
  if (days === 0) return "Cierra hoy";
  return `Cierra en ${pluralizeDias(days)}`;
}

function formatMonto(project: Project): string {
  if (project.montoTexto) return project.montoTexto;
  if (project.monto) return `$${Math.round(project.monto / 1_000_000)}M CLP`;
  return "Monto no definido";
}

function badgeVariant(estado: string | undefined) {
  switch (estado) {
    case "Abierta":
      return "open" as const;
    case "Próxima":
      return "info" as const;
    case "Cerrada":
      return "closed" as const;
    default:
      return "neutral" as const;
  }
}

export function ProjectRow({ project }: { project: Project }) {
  const isClosed = project.estadoPostulacion === "Cerrada";
  const deadline = formatDeadline(project);
  const monto = formatMonto(project);

  const meta = [
    project.institucion,
    project.ambito,
    monto,
    deadline,
  ]
    .filter(Boolean)
    .join(" · ");

  logger.debug("Rendering ProjectRow", { id: project.id });

  return (
    <article
      className={`border-b border-iica-border py-4 px-4 min-h-[72px] transition-colors hover:bg-gray-50${isClosed ? " opacity-60" : ""}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Link
            href={`/proyecto/${project.id}`}
            className="text-iica-navy hover:underline font-semibold text-base line-clamp-2 focus-visible:ring-2 focus-visible:ring-iica-yellow focus-visible:outline-none rounded"
          >
            {project.nombre}
          </Link>
          <p className="text-sm text-gray-600 mt-0.5">{meta}</p>
        </div>
        <Badge variant={badgeVariant(project.estadoPostulacion)}>
          {project.estadoPostulacion ?? "Desconocido"}
        </Badge>
      </div>
    </article>
  );
}
