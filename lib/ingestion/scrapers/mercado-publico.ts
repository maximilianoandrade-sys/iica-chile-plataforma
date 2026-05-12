import type { RawProject } from "../types";

const VALID_KEYWORDS = [
  "agrícola", "agricola", "rural", "riego", "asistencia técnica", "asistencia tecnica",
  "capacitación", "capacitacion", "estudio", "agro", "campesino", "forestal",
  "sustentable", "cambio climático", "cambio climatico", "agronomía", "agronomia",
  "veterinari", "ganader", "pecuaria", "silvoagropecuario", "indap", "sag", "conaf",
  "fia", "ciren", "innovación", "cooperativa", "apícola", "apicola", "hidrico", "hídrico",
];

const EXCLUDE_KEYWORDS = [
  // Construcción / obras / mantenimiento
  "construcción", "construccion", "obra", "vehículo", "vehiculo", "guardia", "limpieza",
  "catering", "mantención", "mantencion", "arriendo", "pasaje", "hotel", "mobiliario",
  "aseo", "seguridad", "pavimentación", "hormigón", "camioneta", "carpintería",
  // Tecnología no agrícola
  "computador", "software", "licencia office", "impresora", "telefonía", "telefonia",
  // Médico / salud (no aplica al mandato IICA)
  "equipo médico", "equipo medico", "hospital", "mamograf", "ecograf", "radiograf",
  "tomograf", "examen médico", "examen medico", "examen de ", "médico clínico",
  "medico clinico", "clínico", "clinico", "dental", "odontolog", "quirúrgic", "quirurgic",
  "ambulancia", "fármaco", "farmaco", "medicamento", "atención de salud", "atencion de salud",
  // Alimentación institucional (no agrícola)
  "alimentación", "alimentacion", "raciones", "almuerzo escolar", "minuta alimenticia",
];

export interface MercadoPublicoResult extends RawProject {
  codigoExterno: string;
  isLive: true;
}

export async function fetchMercadoPublicoLive(
  ticket: string,
  query: string
): Promise<MercadoPublicoResult[]> {
  if (!ticket) return [];
  try {
    const today = new Date();
    const d = String(today.getDate()).padStart(2, "0");
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const y = today.getFullYear();
    const url = `https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?fecha=${d}${m}${y}&ticket=${ticket}`;

    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.Listado || !Array.isArray(data.Listado)) return [];

    const queryLower = query.toLowerCase().trim();
    const allowed = queryLower ? [...VALID_KEYWORDS, queryLower] : VALID_KEYWORDS;

    const filtered = data.Listado.filter((lic: any) => {
      const text = (lic.Nombre || "").toLowerCase();
      const isAffinity = allowed.some((k) => text.includes(k));
      if (!isAffinity) return false;
      const isExcluded = EXCLUDE_KEYWORDS.some((k) => text.includes(k));
      return !isExcluded;
    });

    return filtered.map((lic: any) => {
      const deadlineISO = lic.FechaCierre ? lic.FechaCierre.split("T")[0] : null;
      const deadline = deadlineISO ? new Date(deadlineISO) : null;
      return {
        codigoExterno: lic.CodigoExterno,
        title: `Mercado Público: ${lic.Nombre}`,
        institution: "Gobierno de Chile / Organismos Públicos",
        url: `https://www.mercadopublico.cl/Procurement/Modules/RFB/DetailsAcquisition.aspx?qs=${lic.CodigoExterno}`,
        deadline,
        description: `Licitación Mercado Público (Cod: ${lic.CodigoExterno}). Alineación detectada con mandato técnico/agrícola.`,
        tags: ["Mercado Público", "Licitación Nacional"],
        ambito: "Nacional" as const,
        isLive: true as const,
      };
    });
  } catch (err) {
    console.error("[mercado-publico] error:", err);
    return [];
  }
}
