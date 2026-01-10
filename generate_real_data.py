import pandas as pd
import os

# Datos reales obtenidos de la investigación (FIA, INDAP, CORFO, Internacionales)
data = [
    {
        "Nombre": "Convocatoria Nacional de Proyectos de Innovación: Bienes Públicos 2025-2026",
        "Fuente": "FIA",
        "Fecha cierre": "2025-07-22",
        "Monto": "150000000",
        "Estado": "Abierto",
        "Área de interés": "Agricultura",
        "Descripción": "Apoya el desarrollo de innovaciones de libre disposición y uso para solucionar problemas comunes del sector silvoagropecuario. Financiamiento máximo de $150.000.000 (90% del costo).",
        "Enlace": "https://www.fia.cl"
    },
    {
        "Nombre": "Convocatoria Nacional de Proyectos de Innovación: Interés Privado 2025-2026",
        "Fuente": "FIA",
        "Fecha cierre": "2025-07-08",
        "Monto": "120000000",
        "Estado": "Abierto",
        "Área de interés": "Agricultura",
        "Descripción": "Apoya innovaciones en productos y/o procesos con potencial de comercialización. Financiamiento máximo de $120.000.000 (80% del costo). Para personas jurídicas.",
        "Enlace": "https://www.fia.cl"
    },
    {
        "Nombre": "Giras Nacionales de Innovación para Mujeres Agroinnovadoras 2025",
        "Fuente": "FIA",
        "Fecha cierre": "2025-10-07",
        "Monto": "Valorizable",
        "Estado": "Abierto",
        "Área de interés": "Agricultura",
        "Descripción": "Instrumento de ventanilla abierta para difundir información y experiencias innovadoras, enfocado en mujeres agroinnovadoras.",
        "Enlace": "https://www.fia.cl"
    },
    {
        "Nombre": "Sistema de Incentivos para la Sustentabilidad Agroambiental (SIRSD-S) 2025",
        "Fuente": "INDAP",
        "Fecha cierre": "2025-07-25",
        "Monto": "Variado",
        "Estado": "Abierto",
        "Área de interés": "Medio Ambiente",
        "Descripción": "Incentivos para prácticas sustentables en suelos agropecuarios. Concurso abierto para recuperación de suelos degradados.",
        "Enlace": "https://www.indap.gob.cl"
    },
    {
        "Nombre": "Programa de Desarrollo de Inversiones (PDI) - GORE O'Higgins 2025",
        "Fuente": "INDAP",
        "Fecha cierre": "2025-12-31",
        "Monto": "50000000",
        "Estado": "Abierto",
        "Área de interés": "Infraestructura",
        "Descripción": "Cofinaciamiento de inversiones para mejorar procesos productivos. Hasta $7.5M para individuales y $50M para asociativos.",
        "Enlace": "https://www.indap.gob.cl"
    },
    {
        "Nombre": "Call for Proposals 2026: Sustainable Agricultural Productivity",
        "Fuente": "FONTAGRO",
        "Fecha cierre": "2026-03-30",
        "Monto": "180000000",
        "Estado": "Próximamente",
        "Área de interés": "Innovación",
        "Descripción": "Financiamiento para innovaciones en productividad agrícola sostenible y cambio climático en América Latina. Hasta US$200,000.",
        "Enlace": "https://www.fontagro.org"
    },
    {
        "Nombre": "Fondo de Investigación en Agricultura – Escasez Hídrica 2025",
        "Fuente": "ANID",
        "Fecha cierre": "2025-11-12",
        "Monto": "Variado",
        "Estado": "Abierto",
        "Área de interés": "Recursos Hídricos",
        "Descripción": "Fondo destinado a la investigación aplicada para enfrentar la escasez hídrica en la agricultura.",
        "Enlace": "https://www.anid.cl"
    },
    {
        "Nombre": "Uso y adopción de IA en la industria chilena (Programas Tecnológicos)",
        "Fuente": "CORFO",
        "Fecha cierre": "2025-07-24",
        "Monto": "Variado",
        "Estado": "Abierto",
        "Área de interés": "ICT & Telecom",
        "Descripción": "Programa para fomentar la adopción de IA en la industria, con potencial aplicación en agrotech.",
        "Enlace": "https://www.corfo.cl"
    },
    {
        "Nombre": "FO4IMPACT: Fortalecimiento de Organizaciones de Agricultores",
        "Fuente": "IFAD",
        "Fecha cierre": "2025-11-14",
        "Monto": "Variado",
        "Estado": "Abierto",
        "Área de interés": "Agricultura",
        "Descripción": "Llamado para el fortalecimiento institucional, acceso a mercados y transformación política de organizaciones de agricultores.",
        "Enlace": "https://www.ifad.org"
    },
    {
        "Nombre": "Concurso Operación Temprana SIRSD-S 2026 (Arica y Parinacota)",
        "Fuente": "INDAP",
        "Fecha cierre": "2026-02-27",
        "Monto": "Variado",
        "Estado": "Próximamente",
        "Área de interés": "Medio Ambiente",
        "Descripción": "Recuperación de suelos degradados para la temporada 2026. Inicio de postulaciones: Enero 2026.",
        "Enlace": "https://www.indap.gob.cl"
    }
]

# Crear DataFrame y guardar excel
df = pd.DataFrame(data)

# Asegurar que el directorio data existe
os.makedirs("data", exist_ok=True)

# Guardar con el nombre que usará la app (reemplazando al anterior o como nuevo principal)
output_path = "data/proyectos_reales_2026.xlsx"
df.to_excel(output_path, index=False)

print(f"✅ Archivo creado exitosamente: {output_path}")
print(df)
