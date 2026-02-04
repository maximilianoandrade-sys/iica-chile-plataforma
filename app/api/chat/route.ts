import { google } from '@ai-sdk/google';
import { streamText, tool } from 'ai';
import { z } from 'zod';
import { getProjects } from '@/lib/data';
import { semanticSearch } from '@/lib/semanticSearch';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    return streamText({
        model: google('gemini-1.5-flash'),
        messages,
        system: `Eres un asistente experto en agricultura y financiamiento agrícola para IICA Chile. 
    Tu misión es ayudar a agricultores a encontrar fondos, subsidios y créditos, y responder dudas técnicas agrícolas.
    
    Reglas:
    1. Si te preguntan por financiamiento, fondos o dinero, USA SIEMPRE la herramienta 'searchProjects'.
    2. Responde de manera empática, simple y directa (lenguaje claro).
    3. Si el usuario menciona su ubicación o rubro (ej. "soy uvero de Elqui"), úsalo para filtrar.
    4. Cita siempre la fuente (ej. "Según las bases de INDAP...").
    5. Si te preguntan cosas técnicas (ej. "riego en arcilla"), responde con base científica resumida y sugiere buscar financiamiento para eso.`,
        tools: {
            searchProjects: tool({
                description: 'Buscar proyectos de financiamiento, subsidios o créditos agrícolas.',
                parameters: z.object({
                    query: z.string().describe('Términos de búsqueda (ej: "riego", "mujer", "coquimbo")'),
                }),
                execute: async ({ query }) => {
                    const projects = await getProjects();
                    // Convert project object to string for search
                    const getSearchableText = (p: any) =>
                        `${p.nombre} ${p.institucion} ${p.categoria} ${p.regiones.join(' ')} ${p.beneficiarios.join(' ')} ${p.resumen?.observaciones || ''}`;

                    const results = semanticSearch(query, projects, getSearchableText, 0.1);
                    return results.slice(0, 5).map(r => ({
                        nombre: r.item.nombre,
                        institucion: r.item.institucion,
                        beneficiarios: r.item.beneficiarios,
                        cierre: r.item.fecha_cierre,
                        url: r.item.url_bases
                    }));
                },
            }),
        },
    });
}
