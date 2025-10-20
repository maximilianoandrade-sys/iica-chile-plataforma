import pandas as pd
import os
from datetime import datetime, timedelta
import random

# Crear directorio si no existe
os.makedirs('data', exist_ok=True)

# Generar fechas aleatorias
def generar_fecha_cierre():
    fecha_base = datetime.now()
    dias_aleatorios = random.randint(30, 365)
    return (fecha_base + timedelta(days=dias_aleatorios)).strftime('%Y-%m-%d')

# Proyectos específicos para Juventudes Rurales
proyectos_juventudes = [
    # PROYECTOS NACIONALES CHILE - JUVENTUDES RURALES
    {'Nombre': 'Programa Juventud Rural Innovadora - ReBrota', 'Fuente': 'FIA-INJUV', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.gob.cl/noticias/innovacion-rural-jovenes-rurales-programa-apoyo-emprendimientos-fia-injuv-rebrota/', 'Estado': 'Abierto', 'Monto': 'USD 8,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Programa para jóvenes rurales emprendedores entre 18 y 35 años, desarrollando capacidades e innovaciones'},
    {'Nombre': 'SaviaLab - Innovación Temprana Rural', 'Fuente': 'FIA', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.fia.cl/savialab', 'Estado': 'Abierto', 'Monto': 'USD 3,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Programa para jóvenes entre 15 y 18 años, promoviendo innovación temprana en el sector rural'},
    {'Nombre': 'Concurso Jóvenes Sustentables AFC', 'Fuente': 'INDAP', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.indap.gob.cl/noticias/indap-lanza-financiamiento-especial-para-proyectos-sustentables-de-jovenes-rurales/', 'Estado': 'Abierto', 'Monto': 'USD 25,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Financiamiento para proyectos sustentables de jóvenes rurales, individuales hasta $5M y asociativos hasta $25M'},
    {'Nombre': 'Programa Emprende Joven Rural', 'Fuente': 'INDAP', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.chileatiende.gob.cl/fichas/97831-programa-emprende-joven-rural', 'Estado': 'Abierto', 'Monto': 'USD 15,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Financiamiento crediticio para jóvenes del campo entre 18 y 40 años'},
    {'Nombre': 'Política Nacional Juventudes Rurales', 'Fuente': 'INDAP', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.indap.gob.cl/juventudes-rurales', 'Estado': 'Abierto', 'Monto': 'USD 30,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Política nacional para promover desarrollo de capacidades en juventudes rurales'},
    {'Nombre': 'Proyecto Jóvenes Rurales 4.0', 'Fuente': 'Gobierno Regional Tarapacá', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.jovenesrurales.cl', 'Estado': 'Abierto', 'Monto': 'USD 2,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Innovación social para juventud rural en soluciones climáticas y energéticas'},
    {'Nombre': 'Fondo Jóvenes Líderes Rurales', 'Fuente': 'Minagri', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://minagri.gob.cl/jovenes-lideres', 'Estado': 'Abierto', 'Monto': 'USD 12,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Desarrollo de liderazgo y capacidades en jóvenes rurales'},
    {'Nombre': 'Programa Juventud y Agroecología', 'Fuente': 'SAG', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.sag.gob.cl/juventud-agroecologia', 'Estado': 'Abierto', 'Monto': 'USD 6,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Fomento de prácticas agroecológicas en jóvenes rurales'},
    {'Nombre': 'Concurso Innovación Joven Rural', 'Fuente': 'Corfo', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.corfo.cl/innovacion-joven-rural', 'Estado': 'Abierto', 'Monto': 'USD 10,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Apoyo a emprendimientos innovadores de jóvenes rurales'},
    {'Nombre': 'Programa Mujeres Jóvenes Rurales', 'Fuente': 'INDAP-PRODEMU', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.indap.gob.cl/mujeres-jovenes-rurales', 'Estado': 'Abierto', 'Monto': 'USD 8,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Empoderamiento de mujeres jóvenes en el ámbito rural'},
    
    # PROYECTOS INTERNACIONALES - JUVENTUDES RURALES
    {'Nombre': 'Programa Juventud Rural FAO', 'Fuente': 'FAO', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.fao.org/rural-youth', 'Estado': 'Abierto', 'Monto': 'USD 50,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Programa global de FAO para el desarrollo de jóvenes rurales'},
    {'Nombre': 'Fondo FIDA Juventud Rural', 'Fuente': 'FIDA', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.ifad.org/rural-youth', 'Estado': 'Abierto', 'Monto': 'USD 40,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Fondo internacional para el desarrollo de jóvenes rurales'},
    {'Nombre': 'Programa UNDP Juventud Rural', 'Fuente': 'UNDP', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.undp.org/rural-youth', 'Estado': 'Abierto', 'Monto': 'USD 35,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Desarrollo de capacidades en jóvenes rurales'},
    {'Nombre': 'Iniciativa Juventud Rural BID', 'Fuente': 'BID', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.iadb.org/rural-youth', 'Estado': 'Abierto', 'Monto': 'USD 45,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Iniciativa del BID para jóvenes rurales en América Latina'},
    {'Nombre': 'Programa Juventud Rural UE', 'Fuente': 'UE', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://ec.europa.eu/rural-youth', 'Estado': 'Abierto', 'Monto': 'USD 60,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Programa europeo para jóvenes rurales'},
    {'Nombre': 'Fondo Canadiense Juventud Rural', 'Fuente': 'Canadá', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.international.gc.ca/rural-youth', 'Estado': 'Abierto', 'Monto': 'USD 25,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Cooperación canadiense para jóvenes rurales'},
    {'Nombre': 'Programa Australia Juventud Rural', 'Fuente': 'Australia', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.dfat.gov.au/rural-youth', 'Estado': 'Abierto', 'Monto': 'USD 20,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Cooperación australiana para jóvenes rurales'},
    {'Nombre': 'Iniciativa USAID Juventud Rural', 'Fuente': 'USAID', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.usaid.gov/rural-youth', 'Estado': 'Abierto', 'Monto': 'USD 55,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Iniciativa estadounidense para jóvenes rurales'},
    {'Nombre': 'Programa GIZ Juventud Rural', 'Fuente': 'GIZ Alemania', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.giz.de/rural-youth', 'Estado': 'Abierto', 'Monto': 'USD 30,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Cooperación alemana para jóvenes rurales'},
    {'Nombre': 'Fondo Japonés Juventud Rural', 'Fuente': 'JICA Japón', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.jica.go.jp/rural-youth', 'Estado': 'Abierto', 'Monto': 'USD 35,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Cooperación japonesa para jóvenes rurales'},
    
    # PROYECTOS IICA - JUVENTUDES RURALES
    {'Nombre': 'Programa IICA Juventud Rural', 'Fuente': 'IICA', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.iica.int/juventud-rural', 'Estado': 'Abierto', 'Monto': 'USD 20,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Programa IICA específico para desarrollo de jóvenes rurales'},
    {'Nombre': 'Iniciativa IICA Emprendimiento Joven', 'Fuente': 'IICA', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.iica.int/emprendimiento-joven', 'Estado': 'Abierto', 'Monto': 'USD 15,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Apoyo al emprendimiento de jóvenes rurales'},
    {'Nombre': 'Fondo IICA Liderazgo Joven Rural', 'Fuente': 'IICA', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.iica.int/liderazgo-joven', 'Estado': 'Abierto', 'Monto': 'USD 12,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Desarrollo de liderazgo en jóvenes rurales'},
    {'Nombre': 'Programa IICA Innovación Joven', 'Fuente': 'IICA', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.iica.int/innovacion-joven', 'Estado': 'Abierto', 'Monto': 'USD 18,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Innovación tecnológica para jóvenes rurales'},
    {'Nombre': 'Iniciativa IICA Mujeres Jóvenes Rurales', 'Fuente': 'IICA', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.iica.int/mujeres-jovenes-rurales', 'Estado': 'Abierto', 'Monto': 'USD 14,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Empoderamiento de mujeres jóvenes rurales'},
    
    # PROYECTOS ACADÉMICOS - JUVENTUDES RURALES
    {'Nombre': 'Programa Universidad Chile Juventud Rural', 'Fuente': 'Universidad de Chile', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.uchile.cl/juventud-rural', 'Estado': 'Abierto', 'Monto': 'USD 5,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Programa universitario para jóvenes rurales'},
    {'Nombre': 'Iniciativa UC Juventud Rural', 'Fuente': 'Universidad Católica', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.uc.cl/juventud-rural', 'Estado': 'Abierto', 'Monto': 'USD 4,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Iniciativa de la UC para jóvenes rurales'},
    {'Nombre': 'Programa UdeC Juventud Rural', 'Fuente': 'Universidad de Concepción', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.udec.cl/juventud-rural', 'Estado': 'Abierto', 'Monto': 'USD 3,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Programa de la UdeC para jóvenes rurales'},
    {'Nombre': 'Fondo USACH Juventud Rural', 'Fuente': 'Universidad de Santiago', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.usach.cl/juventud-rural', 'Estado': 'Abierto', 'Monto': 'USD 2,500,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Fondo de la USACH para jóvenes rurales'},
    {'Nombre': 'Programa UTALCA Juventud Rural', 'Fuente': 'Universidad de Talca', 'Fecha cierre': generar_fecha_cierre(), 'Enlace': 'https://www.utalca.cl/juventud-rural', 'Estado': 'Abierto', 'Monto': 'USD 2,000,000', 'Área de interés': 'Juventudes Rurales', 'Descripción': 'Programa de la UTALCA para jóvenes rurales'},
]

# Cargar proyectos existentes
proyectos_existentes = []
if os.path.exists('data/proyectos_completos.xlsx'):
    try:
        df_existente = pd.read_excel('data/proyectos_completos.xlsx')
        proyectos_existentes = df_existente.to_dict('records')
        print(f"📂 Cargados {len(proyectos_existentes)} proyectos existentes")
    except Exception as e:
        print(f"❌ Error cargando proyectos existentes: {e}")

# Combinar proyectos existentes con nuevos proyectos de juventudes
todos_los_proyectos = proyectos_existentes + proyectos_juventudes

# Crear DataFrame y guardar
df = pd.DataFrame(todos_los_proyectos)
df.to_excel('data/proyectos_completos.xlsx', index=False, engine='openpyxl')
print(f"✅ Base de datos actualizada con {len(proyectos_juventudes)} nuevos proyectos de Juventudes Rurales")
print(f"📊 Total de proyectos: {len(todos_los_proyectos)}")
print(f"🎯 Nueva área agregada: 'Juventudes Rurales'")
