import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { getLogger } from "@/lib/utils/logger";
import { GenerateProposalSchema, formatZodError } from "@/lib/utils/validation";
import { createSuccessResponse, createErrorResponse } from "@/lib/utils/api-response";
import { getEnv } from '@/lib/utils/env';

const logger = getLogger("GenerateProposal");
const PROPOSAL_RATE_LIMIT = { maxRequests: 5, windowSizeSeconds: 60 };

export async function GET() {
  return NextResponse.json({
    route: "/api/generate-proposal",
    method: "POST",
    description:
      "Genera un borrador de propuesta de financiamiento para un proyecto agrícola usando Gemini AI",
    requiredBody: {
      projectId: "number (required)",
      applicantInfo: {
        name: "string (optional)",
        organization: "string (optional)",
        region: "string (optional)",
      },
    },
  });
}

export async function POST(request: Request) {
  try {
    let env: ReturnType<typeof getEnv>;
    try {
      env = getEnv();
    } catch (error) {
      logger.error('Invalid environment for generate-proposal', error as Error);
      return createErrorResponse('Error de configuración del servidor', 500);
    }

    // Rate limiting
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`generate-proposal:${clientIp}`, PROPOSAL_RATE_LIMIT);
    if (!rateCheck.allowed) {
      return createErrorResponse(
        "Demasiadas solicitudes. Intente de nuevo en un momento.",
        429,
        {
          "Retry-After": String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
          "X-RateLimit-Remaining": "0",
        }
      );
    }

    const body = await request.json();
    const parsed = GenerateProposalSchema.safeParse(body);
    if (!parsed.success) {
      return createErrorResponse(formatZodError(parsed.error), 400);
    }
    const { projectId, applicantInfo } = parsed.data;

    if (!env.GEMINI_API_KEY) {
      return createErrorResponse("Servicio de generación no disponible. GEMINI_API_KEY no configurada.", 503);
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return createErrorResponse(`Proyecto con id ${projectId} no encontrado`, 404);
    }

    const SYSTEM_INSTRUCTION = `Eres un experto en redacción de propuestas de financiamiento para proyectos agrícolas en Chile. Genera un borrador de propuesta en español para el proyecto proporcionado. La propuesta debe ser profesional, clara y no exceder 1500 palabras.

Estructura la propuesta con las siguientes secciones:
1. **Resumen Ejecutivo** - Síntesis del proyecto y su impacto esperado
2. **Objetivos** - Objetivo general y objetivos específicos alineados con el fondo
3. **Metodología** - Enfoque metodológico y actividades principales
4. **Presupuesto Estimado** - Desglose presupuestario acorde al monto disponible
5. **Cronograma Tentativo** - Planificación temporal de las actividades

Genera únicamente el contenido de la propuesta, sin comentarios adicionales.`;

    const applicantContext = applicantInfo
      ? `\nInformación del solicitante:\n- Nombre: ${applicantInfo.name || "No especificado"}\n- Organización: ${applicantInfo.organization || "No especificada"}\n- Región: ${applicantInfo.region || "No especificada"}`
      : "";

    const userContent = `Información del proyecto:
- Nombre: ${project.nombre}
- Institución: ${project.institucion || "No especificada"}
- Objetivo: ${project.objetivo || "No especificado"}
- Descripción IICA: ${project.descripcionIICA || "No especificada"}
- Categoría: ${project.categoria || "No especificada"}
- Ámbito: ${project.ambito || "No especificado"}
- Monto disponible: ${project.monto || "No especificado"}
- Región: ${project.region || "No especificada"}
- Fecha de cierre: ${project.fecha_cierre || "No especificada"}
${applicantContext}`;

    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: [{ role: "user", parts: [{ text: userContent }] }],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
      },
    });

    const proposal = response.text;

    if (!proposal) {
      return createErrorResponse("No se pudo generar la propuesta", 500);
    }

    return createSuccessResponse({
      proposal,
      projectName: project.nombre,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Proposal generation failed", error as Error);
    return createErrorResponse("Error interno al generar la propuesta", 500);
  }
}
