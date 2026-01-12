"""
Script para poblar la base de datos con fondos y proyectos REALES de IICA Chile, FIA e INDAP (2025).
"""
from app_mvp import app
from models import db, Fondo
from datetime import datetime

def seed_real_data():
    with app.app_context():
        print("🌱 Iniciando migración de datos reales 2025...")
        
        # Eliminar datos de prueba anteriores (opcional, comentada para no borrar todo lo del usuario)
        # Fondo.query.delete()
        
        proyectos_reales = [
            {
                "nombre": "Convocatoria Nacional de Innovación 2025-2026",
                "descripcion": "Apoyo al desarrollo de innovaciones en productos y/o procesos del sector silvoagropecuario. Financiamiento para proyectos de Bienes Públicos y de Interés Privado. Dirigido a personas jurídicas.",
                "fuente": "FIA",
                "monto_texto": "Hasta $150.000.000 (90% co-financiamiento)",
                "fecha_cierre": datetime(2025, 7, 22),
                "estado": "Próximamente",
                "area_interes": "Innovación",
                "enlace": "https://www.fia.cl",
                "region": "Nacional",
                "criterios_elegibilidad": "Personas jurídicas constituidas en Chile, con o sin fines de lucro. Vinculadas al sector agroalimentario.",
                "beneficiarios": "Empresas, cooperativas, universidades, centros de investigación.",
                "palabras_clave": "innovación, silvoagropecuario, tecnología, fia"
            },
            {
                "nombre": "Programa Mi Primer Negocio Rural 2025",
                "descripcion": "Fondo concursable para jóvenes rurales (18-40 años) que deseen iniciar un emprendimiento silvoagropecuario o conexo. Incluye inversión y asesoría técnica.",
                "fuente": "INDAP",
                "monto_texto": "Monto variable + Asesoría",
                "fecha_cierre": datetime(2025, 12, 31), # Abierto todo el año por regiones
                "estado": "Abierto",
                "area_interes": "Emprendimiento Joven",
                "enlace": "https://www.indap.gob.cl",
                "region": "Nacional",
                "criterios_elegibilidad": "Usuario INDAP acreditado, 18-40 años, sin inicio de actividades en primera categoría (salvo excepciones).",
                "beneficiarios": "Jóvenes rurales emprendedores.",
                "palabras_clave": "jóvenes, emprendimiento, rural, indap"
            },
            {
                "nombre": "Proyecto Readiness – Recuperación Verde",
                "descripcion": "Iniciativa del IICA para fortalecer capacidades en recuperación post-pandemia con enfoque climático y sostenibilidad ambiental.",
                "fuente": "IICA Chile",
                "monto_texto": "Cooperación Técnica",
                "fecha_cierre": datetime(2025, 2, 28),
                "estado": "Abierto",
                "area_interes": "Sustentabilidad",
                "enlace": "https://iica.int",
                "region": "Nacional",
                "criterios_elegibilidad": "Organizaciones vinculadas al sector agropecuario y gestión ambiental.",
                "beneficiarios": "Ministerio de Agricultura, servicios públicos, productores.",
                "palabras_clave": "clima, verde, recuperación, iica"
            },
            {
                "nombre": "FOCAL 2025 - Desarrollo Productivo",
                "descripcion": "Cofinanciamiento para mejorar la productividad y competitividad de empresas agrícolas mediante implementación y certificación de normas técnicas.",
                "fuente": "CORFO",
                "monto_texto": "Hasta $3.500.000",
                "fecha_cierre": datetime(2025, 11, 30),
                "estado": "Abierto",
                "area_interes": "Productividad",
                "enlace": "https://www.corfo.cl",
                "region": "Nacional",
                "criterios_elegibilidad": "Empresas con ventas netas anuales inferiores a 100.000 UF.",
                "beneficiarios": "PYMES agrícolas y ganaderas.",
                "palabras_clave": "calidad, certificación, corfo, pyme"
            },
            {
                "nombre": "Arroz Sustentable de las Américas",
                "descripcion": "Proyecto regional (Chile, Brasil, Uruguay) para desarrollar variedades de arroz resistentes a sequía y reducir emisiones de metano.",
                "fuente": "IICA Regional",
                "monto_texto": "Investigación y Desarrollo",
                "fecha_cierre": datetime(2025, 8, 30),
                "estado": "En Ejecución",
                "area_interes": "Investigación",
                "enlace": "https://iica.int",
                "region": "Maule, Ñuble",
                "criterios_elegibilidad": "Productores arroceros asociados a programas de innovación.",
                "beneficiarios": "Productores de arroz",
                "palabras_clave": "arroz, clima, agua, investigación"
            },
            {
                "nombre": "Capacitación e Inversiones Los Lagos 2025",
                "descripcion": "Convenio INDAP-GORE para infraestructura menor y maquinaria. Prioridad mujeres y jóvenes.",
                "fuente": "INDAP / GORE",
                "monto_texto": "Hasta $2.000.000 (90% bonificación)",
                "fecha_cierre": datetime(2025, 5, 15),
                "estado": "Próximamente",
                "area_interes": "Inversión",
                "enlace": "https://www.indap.gob.cl",
                "region": "Los Lagos",
                "criterios_elegibilidad": "Usuarios INDAP de Región de Los Lagos. Acreditar tenencia de tierra.",
                "beneficiarios": "Pequeños agricultores Los Lagos",
                "palabras_clave": "inversión, mujeres, gore, los lagos"
            }
        ]
        
        count = 0
        for p in proyectos_reales:
            # Verificar si ya existe
            exists = Fondo.query.filter_by(nombre=p['nombre']).first()
            if not exists:
                nuevo_fondo = Fondo(
                    nombre=p['nombre'],
                    descripcion=p['descripcion'],
                    fuente=p['fuente'],
                    monto_texto=p['monto_texto'],
                    fecha_cierre=p['fecha_cierre'],
                    estado=p['estado'],
                    area_interes=p['area_interes'],
                    enlace=p['enlace'],
                    region=p['region'],
                    criterios_elegibilidad=p.get('criterios_elegibilidad', ''),
                    beneficiarios=p.get('beneficiarios', ''),
                    palabras_clave=p.get('palabras_clave', ''),
                    activo=True
                )
                db.session.add(nuevo_fondo)
                count += 1
                
        db.session.commit()
        print(f"✅ Se agregaron {count} proyectos reales a la base de datos.")

if __name__ == '__main__':
    seed_real_data()
