import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { GoogleGenAI } from "@google/genai";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";
import { getLogger } from "@/lib/utils/logger";

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
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateCheck = checkRateLimit(`generate-proposal:${clientIp}`, PROPOSAL_RATE_LIMIT);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Demasiadas solicitudes. Intente de nuevo en un momento." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateCheck.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const body = await request.json();
    const { projectId, applicantInfo } = body;

    if (!projectId || typeof projectId !== "number") {
      return NextResponse.json(
        { error: "projectId es requerido y debe ser un número" },
        { status: 400 }
      );
    }

    // Validate applicantInfo fields
    if (applicantInfo) {
      const fields = ["name", "organization", "region"] as const;
      for (const field of fields) {
        const value = applicantInfo[field];
        if (value !== undefined && value !== null) {
          if (typeof value !== "string" || value.length > 200) {
            return NextResponse.json(
              { error: `applicantInfo.${field} debe ser un texto de máximo 200 caracteres.` },
              { status: 400 }
            );
          }
        }
      }
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Servicio de generación no disponible. GEMINI_API_KEY no configurada." },
        { status: 503 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: `Proyecto con id ${projectId} no encontrado` },
        { status: 404 }
      );
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

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

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
      return NextResponse.json(
        { error: "No se pudo generar la propuesta" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      proposal,
      projectName: project.nombre,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    logger.error("Proposal generation failed", error as Error);
    return NextResponse.json(
      { error: "Error interno al generar la propuesta" },
      { status: 500 }
    );
  }
}
