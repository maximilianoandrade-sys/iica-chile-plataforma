/**
 * Curated counterparts list for IICA Chile platform.
 * IDs correspond to ASP.NET dropdown value attributes from the legacy system.
 */

export type CounterpartCategory = "chilean" | "regional" | "multilateral" | "bilateral" | "un" | "research" | "other";

export interface Counterpart {
  id: string;
  name: string;
  abbrev: string;
  category: CounterpartCategory;
}

export const COUNTERPARTS_IICA_CHILE: Counterpart[] = [
  // ─── Chilean institutions ───────────────────────────────────────────
  { id: "179", name: "Fundación para la Innovación Agraria", abbrev: "FIA", category: "chilean" },
  { id: "230", name: "Instituto de Desarrollo Agropecuario", abbrev: "INDAP", category: "chilean" },
  { id: "183", name: "Instituto de Investigaciones Agropecuarias", abbrev: "INIA", category: "chilean" },
  { id: "2558", name: "Servicio Agrícola y Ganadero de Chile", abbrev: "SAG", category: "chilean" },
  { id: "252", name: "Ministerio de Agricultura de Chile", abbrev: "MINAGRI", category: "chilean" },
  { id: "2338", name: "Subsecretaría de Agricultura", abbrev: "SUBAGRI", category: "chilean" },
  { id: "2382", name: "Subsecretaría de Agricultura de Chile", abbrev: "SUBAGRI-CL", category: "chilean" },
  { id: "216", name: "Corporación Consorcio Lechero de Chile", abbrev: "CCL", category: "chilean" },
  { id: "2345", name: "Chileprunes Association AG", abbrev: "Chileprunes", category: "chilean" },
  { id: "249", name: "Pontificia Universidad Católica de Valparaíso", abbrev: "PUCV", category: "chilean" },
  { id: "1278", name: "Facultad de Ciencias Agronómicas de la Universidad de Chile", abbrev: "UChile-Agro", category: "chilean" },
  { id: "1306", name: "Universidad Tecnológica Metropolitana", abbrev: "UTEM", category: "chilean" },
  { id: "2628", name: "Cooperativa Campesina Cuncumén", abbrev: "Cuncumén", category: "chilean" },
  { id: "2613", name: "Corporación para el Desarrollo del Tiltil", abbrev: "Corp-Tiltil", category: "chilean" },
  { id: "1304", name: "Municipalidad de Renaico", abbrev: "Mun-Renaico", category: "chilean" },

  // ─── Regional programs ─────────────────────────────────────────────
  { id: "159", name: "Programa Cooperativo para el Desarrollo Tecnológico Agroalimentario y Agroindustrial del Cono Sur", abbrev: "PROCISUR", category: "regional" },
  { id: "2645", name: "Consejo Agropecuario del Sur", abbrev: "CAS", category: "regional" },
  { id: "156", name: "Comité de Sanidad Vegetal", abbrev: "COSAVE", category: "regional" },
  { id: "2368", name: "Fondo Regional de Tecnología Agropecuaria", abbrev: "FONTAGRO", category: "regional" },
  { id: "137", name: "Organización de Información de Mercados de las Américas", abbrev: "OIMA", category: "regional" },
  { id: "17", name: "Consejo Agropecuario Centroamericano", abbrev: "CAC", category: "regional" },

  // ─── Multilateral financial institutions ────────────────────────────
  { id: "7", name: "Inter-American Development Bank", abbrev: "IDB", category: "multilateral" },
  { id: "9", name: "World Bank Group", abbrev: "WB", category: "multilateral" },
  { id: "6", name: "Banco de Desarrollo de América Latina y el Caribe", abbrev: "CAF", category: "multilateral" },
  { id: "8", name: "Banco Internacional de Reconstrucción y Fomento", abbrev: "BIRF", category: "multilateral" },
  { id: "37", name: "Global Environment Facility", abbrev: "GEF", category: "multilateral" },
  { id: "44", name: "Green Climate Fund", abbrev: "GCF", category: "multilateral" },
  { id: "50", name: "International Fund for Agricultural Development", abbrev: "IFAD", category: "multilateral" },
  { id: "2324", name: "Fondo Financiero para el Desarrollo de la Cuenca del Plata", abbrev: "FONPLATA", category: "multilateral" },

  // ─── Bilateral cooperation ─────────────────────────────────────────
  { id: "29", name: "European Union", abbrev: "EU", category: "bilateral" },
  { id: "97", name: "Deutsche Gesellschaft für Internationale Zusammenarbeit", abbrev: "GIZ", category: "bilateral" },
  { id: "3", name: "Agencia Española de Cooperación Internacional para el Desarrollo", abbrev: "AECID", category: "bilateral" },
  { id: "88", name: "United States Agency for International Development", abbrev: "USAID", category: "bilateral" },
  { id: "89", name: "United States Department of Agriculture", abbrev: "USDA", category: "bilateral" },
  { id: "214", name: "Kreditanstalt für Wiederaufbau", abbrev: "KfW", category: "bilateral" },
  { id: "1274", name: "Japan International Cooperation Agency", abbrev: "JICA", category: "bilateral" },
  { id: "218", name: "Korean International Cooperation Agency", abbrev: "KOICA", category: "bilateral" },
  { id: "240", name: "New Zealand Embassy to Chile", abbrev: "NZ-CL", category: "bilateral" },
  { id: "135", name: "Swiss Agency for Development and Cooperation", abbrev: "SDC", category: "bilateral" },
  { id: "232", name: "Swiss Association for the Development of Agriculture and Rural Areas", abbrev: "AGRIDEA", category: "bilateral" },
  { id: "38", name: "Internationale Klimaschutzinitiative", abbrev: "IKI", category: "bilateral" },
  { id: "247", name: "Bundesministerium für Umwelt, Naturschutz, nukleare Sicherheit und Verbraucherschutz", abbrev: "BMUV", category: "bilateral" },
  { id: "2319", name: "Global Affairs Canada/Affaires Mondiales Canada", abbrev: "GAC", category: "bilateral" },
  { id: "139", name: "Agriculture and Agri-Food Canada", abbrev: "AAFC", category: "bilateral" },
  { id: "2714", name: "Ministry of Primary Industries of New Zealand", abbrev: "MPI-NZ", category: "bilateral" },

  // ─── United Nations system ─────────────────────────────────────────
  { id: "33", name: "Food and Agriculture Organization of the United Nations", abbrev: "FAO", category: "un" },
  { id: "1257", name: "United Nations Development Programme", abbrev: "UNDP", category: "un" },
  { id: "75", name: "United Nations Environment Programme", abbrev: "UNEP", category: "un" },
  { id: "2544", name: "International Labour Organization", abbrev: "ILO", category: "un" },
  { id: "2577", name: "UN Women", abbrev: "UN-Women", category: "un" },

  // ─── Research institutions ─────────────────────────────────────────
  { id: "117", name: "Centro Internacional de Agricultura Tropical", abbrev: "CIAT", category: "research" },
  { id: "222", name: "Centro Internacional de la Papa", abbrev: "CIP", category: "research" },
  { id: "2691", name: "Centro Internacional de Mejoramiento de Maíz y Trigo", abbrev: "CIMMYT", category: "research" },
  { id: "2747", name: "Consultative Group for International Agricultural Research", abbrev: "CGIAR", category: "research" },
  { id: "131", name: "Centro Agronómico Tropical de Investigación y Enseñanza", abbrev: "CATIE", category: "research" },
  { id: "132", name: "Centre de Coopération Internationale en Recherche Agronomique pour le Développement", abbrev: "CIRAD", category: "research" },
  { id: "142", name: "Empresa Brasileira de Pesquisa Agropecuária", abbrev: "EMBRAPA", category: "research" },
  { id: "235", name: "Instituto Nacional de Tecnología Agropecuaria", abbrev: "INTA", category: "research" },
  { id: "2730", name: "Corporación Colombiana de Investigación Agropecuaria", abbrev: "AGROSAVIA", category: "research" },
  { id: "2329", name: "Centre for Agriculture and Bioscience International", abbrev: "CABI", category: "research" },

  // ─── Other organizations ───────────────────────────────────────────
  { id: "2424", name: "Comisión Económica para América Latina y el Caribe", abbrev: "CEPAL", category: "other" },
  { id: "2326", name: "Organización de los Estados Americanos", abbrev: "OEA", category: "other" },
  { id: "116", name: "World Resources Institute", abbrev: "WRI", category: "other" },
  { id: "2823", name: "World Wildlife Fund", abbrev: "WWF", category: "other" },
  { id: "2638", name: "International Union for Conservation of Nature", abbrev: "IUCN", category: "other" },
  { id: "2639", name: "Global Methane Hub", abbrev: "GMH", category: "other" },
  { id: "238", name: "Microsoft Corporation", abbrev: "Microsoft", category: "other" },
  { id: "2719", name: "Bezos Earth Fund", abbrev: "Bezos-EF", category: "other" },
  { id: "2717", name: "Gordon and Betty Moore Foundation", abbrev: "Moore", category: "other" },
  { id: "168", name: "Croplife Latin America", abbrev: "Croplife", category: "other" },
  { id: "237", name: "CORTEVA Agriscience", abbrev: "CORTEVA", category: "other" },
  { id: "2937", name: "New Zealand Institute for Bioeconomy Science Limited", abbrev: "BSI-NZ", category: "other" },
  { id: "127", name: "Instituto Nacional de Investigaciones Forestales, Agrícolas y Pecuarias", abbrev: "INIFAP", category: "other" },
  { id: "2615", name: "World Organisation for Animal Health", abbrev: "WOAH", category: "other" },
  { id: "2665", name: "World Food Prize Foundation", abbrev: "WFP-Found", category: "other" },
];

/** Total number of counterparts in the curated list */
export const TOTAL_COUNTERPARTS = COUNTERPARTS_IICA_CHILE.length;

/** Filter counterparts by category */
export function getByCategory(cat: CounterpartCategory): Counterpart[] {
  return COUNTERPARTS_IICA_CHILE.filter((c) => c.category === cat);
}
