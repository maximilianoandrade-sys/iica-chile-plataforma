import { redirect } from "next/navigation";

/**
 * Página índice del panel admin.
 * Redirige a /admin/sources (dashboard de salud de fuentes) como página por
 * defecto. Si /admin/sources cambia o se quiere otro landing, ajustar acá.
 *
 * El middleware ya cubre el caso unauthed (redirige a /admin/login antes
 * de llegar a este componente).
 */
export default function AdminIndexPage() {
  redirect("/admin/sources");
}
