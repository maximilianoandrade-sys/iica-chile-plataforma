import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Falta ANTHROPIC_API_KEY" }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey });
    const { project } = await req.json();

    if (!project) {
      return NextResponse.json({ error: "Falta información del proyecto" }, { status: 400 });
    }

    const prompt = `
Eres un consultor experto en formulación de proyectos internacionales de desarrollo agrícola y rural para el IICA (Instituto Interamericano de Cooperación para la Agricultura).
Tu objetivo es escribir un borrador de Concept Note (Propuesta de Proyecto) altamente persuasiva, profesional y estructurada basada en los siguientes datos de la convocatoria:

Nombre del Proyecto/Fondo: ${project.nombre || project.title}
Institución Financiadora: ${project.institucion || project.institution}
Presupuesto/Monto: ${project.monto || project.budget || 'A definir'}
Categoría/Ámbito: ${project.categoria || project.scope}
Descripción/Requisitos: ${JSON.stringify(project.resumen || project.description || '')}

Por favor, redacta un borrador de propuesta que contenga estrictamente las siguientes secciones en formato Markdown:
1. **Título del Proyecto Propuesto** (Invéntalo basado en el fondo, que suene atractivo y enfocado en Chile).
2. **Justificación y Relevancia** (Por qué IICA Chile es el socio ideal y cuál es el problema a resolver, 2 párrafos).
3. **Objetivo General y 3 Objetivos Específicos** (Usando verbos infinitivos).
4. **Metodología y Actividades Principales** (Lista de 4 fases de ejecución).
5. **Presupuesto Estimado y Cofinanciamiento** (Una lista aproximada de asignación porcentual).
6. **Resultados Esperados e Impacto** (Métricas de éxito claras).

La propuesta debe sonar técnica, convincente y lista para que el equipo técnico del IICA la revise y envíe. Usa un tono formal, persuasivo e innovador.
Mantenlo conciso (peso máximo de 1200 palabras).
`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2500,
      system: "Eres un redactor experto de proyectos de cooperación internacional para el IICA Chile.",
      messages: [{ role: "user", content: prompt }]
    });

    const content = (message.content[0] as any).text;
    
    return NextResponse.json({ proposal: content });

  } catch (error: any) {
    console.error("[Generate Proposal Error]", error);
    return NextResponse.json({ error: error.message || "Error generando propuesta" }, { status: 500 });
  }
}
