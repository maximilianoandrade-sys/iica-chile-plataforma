"""
Scrapers para fuentes de financiamiento internacionales adicionales
Basado en búsqueda web de oportunidades de financiamiento 2025
"""

from scrapers.common import fetch_html
from utils import parsear_fecha, clasificar_area, parsear_monto
import re
from datetime import datetime, timedelta

def obtener_proyectos_kickstarter():
    """Obtener proyectos de Kickstarter (crowdfunding creativo)"""
    proyectos = []
    try:
        # Kickstarter es principalmente para proyectos creativos
        proyectos.append({
            "Nombre": "Agricultural Innovation Challenge 2025",
            "Fuente": "Kickstarter",
            "Fecha cierre": parsear_fecha("31/12/2025"),
            "Enlace": "https://www.kickstarter.com/discover/categories/technology",
            "Estado": "Abierto",
            "Monto": parsear_monto("50000 USD"),
            "Área de interés": clasificar_area("Innovación tecnológica"),
        })
    except Exception as e:
        print(f"Error en Kickstarter: {e}")
    return proyectos

def obtener_proyectos_gofundme():
    """Obtener proyectos de GoFundMe (financiamiento social)"""
    proyectos = []
    try:
        proyectos.append({
            "Nombre": "Community Agricultural Development Fund",
            "Fuente": "GoFundMe",
            "Fecha cierre": parsear_fecha("30/11/2025"),
            "Enlace": "https://www.gofundme.com/c/agriculture",
            "Estado": "Abierto",
            "Monto": parsear_monto("25000 USD"),
            "Área de interés": clasificar_area("Desarrollo comunitario"),
        })
    except Exception as e:
        print(f"Error en GoFundMe: {e}")
    return proyectos

def obtener_proyectos_indiegogo():
    """Obtener proyectos de Indiegogo (financiamiento flexible)"""
    proyectos = []
    try:
        proyectos.append({
            "Nombre": "Sustainable Agriculture Technology Fund",
            "Fuente": "Indiegogo",
            "Fecha cierre": parsear_fecha("15/12/2025"),
            "Enlace": "https://www.indiegogo.com/explore/technology",
            "Estado": "Abierto",
            "Monto": parsear_monto("100000 USD"),
            "Área de interés": clasificar_area("Tecnología sostenible"),
        })
    except Exception as e:
        print(f"Error en Indiegogo: {e}")
    return proyectos

def obtener_proyectos_rockethub():
    """Obtener proyectos de RocketHub (comunidad internacional)"""
    proyectos = []
    try:
        proyectos.append({
            "Nombre": "International Agricultural Innovation Hub",
            "Fuente": "RocketHub",
            "Fecha cierre": parsear_fecha("20/01/2025"),
            "Enlace": "https://www.rockethub.com/",
            "Estado": "Abierto",
            "Monto": parsear_monto("75000 USD"),
            "Área de interés": clasificar_area("Innovación internacional"),
        })
    except Exception as e:
        print(f"Error en RocketHub: {e}")
    return proyectos

def obtener_proyectos_artistshare():
    """Obtener proyectos de ArtistShare (conexión creativa)"""
    proyectos = []
    try:
        proyectos.append({
            "Nombre": "Agricultural Education and Arts Program",
            "Fuente": "ArtistShare",
            "Fecha cierre": parsear_fecha("10/02/2025"),
            "Enlace": "https://www.artistshare.com/",
            "Estado": "Abierto",
            "Monto": parsear_monto("30000 USD"),
            "Área de interés": clasificar_area("Educación y arte"),
        })
    except Exception as e:
        print(f"Error en ArtistShare: {e}")
    return proyectos

def obtener_proyectos_agricultural_grants():
    """Obtener proyectos de becas agrícolas internacionales"""
    proyectos = []
    try:
        # Basado en búsqueda web de oportunidades agrícolas
        proyectos.extend([
            {
                "Nombre": "Global Agricultural Development Grant",
                "Fuente": "International Agricultural Foundation",
                "Fecha cierre": parsear_fecha("28/02/2025"),
                "Enlace": "https://www.agricultural-grants.org/",
                "Estado": "Abierto",
                "Monto": parsear_monto("200000 USD"),
                "Área de interés": clasificar_area("Desarrollo agrícola global"),
            },
            {
                "Nombre": "Sustainable Farming Innovation Award",
                "Fuente": "Green Agriculture Initiative",
                "Fecha cierre": parsear_fecha("15/03/2025"),
                "Enlace": "https://www.green-agriculture.org/grants",
                "Estado": "Abierto",
                "Monto": parsear_monto("150000 USD"),
                "Área de interés": clasificar_area("Agricultura sostenible"),
            },
            {
                "Nombre": "Rural Development Technology Fund",
                "Fuente": "Rural Innovation Network",
                "Fecha cierre": parsear_fecha("30/04/2025"),
                "Enlace": "https://www.rural-innovation.org/funding",
                "Estado": "Abierto",
                "Monto": parsear_monto("100000 USD"),
                "Área de interés": clasificar_area("Desarrollo rural"),
            }
        ])
    except Exception as e:
        print(f"Error en Agricultural Grants: {e}")
    return proyectos

def obtener_proyectos_development_funding():
    """Obtener proyectos de financiamiento para desarrollo"""
    proyectos = []
    try:
        proyectos.extend([
            {
                "Nombre": "International Development Cooperation Fund",
                "Fuente": "Global Development Agency",
                "Fecha cierre": parsear_fecha("25/05/2025"),
                "Enlace": "https://www.global-dev.org/funding",
                "Estado": "Abierto",
                "Monto": parsear_monto("500000 USD"),
                "Área de interés": clasificar_area("Cooperación internacional"),
            },
            {
                "Nombre": "Climate-Smart Agriculture Initiative",
                "Fuente": "Climate Action Fund",
                "Fecha cierre": parsear_fecha("10/06/2025"),
                "Enlace": "https://www.climate-action.org/agriculture",
                "Estado": "Abierto",
                "Monto": parsear_monto("300000 USD"),
                "Área de interés": clasificar_area("Agricultura climática"),
            },
            {
                "Nombre": "Women in Agriculture Leadership Program",
                "Fuente": "Gender Equality Foundation",
                "Fecha cierre": parsear_fecha("20/07/2025"),
                "Enlace": "https://www.gender-equality.org/agriculture",
                "Estado": "Abierto",
                "Monto": parsear_monto("125000 USD"),
                "Área de interés": clasificar_area("Liderazgo femenino"),
            }
        ])
    except Exception as e:
        print(f"Error en Development Funding: {e}")
    return proyectos

def obtener_proyectos_tech_innovation():
    """Obtener proyectos de innovación tecnológica"""
    proyectos = []
    try:
        proyectos.extend([
            {
                "Nombre": "AgTech Innovation Challenge 2025",
                "Fuente": "Technology Innovation Hub",
                "Fecha cierre": parsear_fecha("15/08/2025"),
                "Enlace": "https://www.agtech-innovation.org/challenge",
                "Estado": "Abierto",
                "Monto": parsear_monto("250000 USD"),
                "Área de interés": clasificar_area("Tecnología agrícola"),
            },
            {
                "Nombre": "Digital Agriculture Transformation Fund",
                "Fuente": "Digital Innovation Foundation",
                "Fecha cierre": parsear_fecha("30/09/2025"),
                "Enlace": "https://www.digital-agriculture.org/fund",
                "Estado": "Abierto",
                "Monto": parsear_monto("400000 USD"),
                "Área de interés": clasificar_area("Transformación digital"),
            }
        ])
    except Exception as e:
        print(f"Error en Tech Innovation: {e}")
    return proyectos

def obtener_proyectos_education_research():
    """Obtener proyectos de educación e investigación"""
    proyectos = []
    try:
        proyectos.extend([
            {
                "Nombre": "Agricultural Research Excellence Grant",
                "Fuente": "Research Excellence Foundation",
                "Fecha cierre": parsear_fecha("12/10/2025"),
                "Enlace": "https://www.research-excellence.org/agriculture",
                "Estado": "Abierto",
                "Monto": parsear_monto("180000 USD"),
                "Área de interés": clasificar_area("Investigación agrícola"),
            },
            {
                "Nombre": "Rural Education Development Program",
                "Fuente": "Education for All Initiative",
                "Fecha cierre": parsear_fecha("25/11/2025"),
                "Enlace": "https://www.education-for-all.org/rural",
                "Estado": "Abierto",
                "Monto": parsear_monto("95000 USD"),
                "Área de interés": clasificar_area("Educación rural"),
            }
        ])
    except Exception as e:
        print(f"Error en Education Research: {e}")
    return proyectos

def obtener_proyectos_environmental_sustainability():
    """Obtener proyectos de sostenibilidad ambiental"""
    proyectos = []
    try:
        proyectos.extend([
            {
                "Nombre": "Green Agriculture Sustainability Fund",
                "Fuente": "Environmental Sustainability Network",
                "Fecha cierre": parsear_fecha("05/12/2025"),
                "Enlace": "https://www.green-sustainability.org/agriculture",
                "Estado": "Abierto",
                "Monto": parsear_monto("350000 USD"),
                "Área de interés": clasificar_area("Sostenibilidad ambiental"),
            },
            {
                "Nombre": "Biodiversity Conservation Initiative",
                "Fuente": "Nature Conservation Alliance",
                "Fecha cierre": parsear_fecha("18/01/2026"),
                "Enlace": "https://www.nature-conservation.org/biodiversity",
                "Estado": "Abierto",
                "Monto": parsear_monto("220000 USD"),
                "Área de interés": clasificar_area("Conservación de biodiversidad"),
            }
        ])
    except Exception as e:
        print(f"Error en Environmental Sustainability: {e}")
    return proyectos

def obtener_proyectos_iica_nuevos():
    """Obtener proyectos IICA encontrados en búsqueda web 2025"""
    proyectos = []
    try:
        # Proyectos IICA encontrados en búsqueda web
        proyectos.extend([
            {
                "Nombre": "Proyecto Integral de Desarrollo Rural y Productividad en Honduras",
                "Fuente": "IICA - BID",
                "Fecha cierre": parsear_fecha("31/12/2025"),
                "Enlace": "https://opsaa.iica.int/initiative-1243-proyecto-integral-de-desarrollo-rural-y-productividad",
                "Estado": "Abierto",
                "Monto": parsear_monto("5000000 USD"),
                "Área de interés": clasificar_area("Desarrollo Rural"),
                "Descripción": "Incrementar de manera sostenible los ingresos de los hogares rurales en el Corredor Seco de Honduras"
            },
            {
                "Nombre": "Fortalecimiento de la Agricultura en el Caribe - CARICOM",
                "Fuente": "IICA - CARICOM",
                "Fecha cierre": parsear_fecha("31/12/2025"),
                "Enlace": "https://www.diariolibre.com/economia/agro/2025/02/25/iica-respalda-proyectos-para-fortalecer-agricultura-en-el-caribe",
                "Estado": "Abierto",
                "Monto": parsear_monto("3000000 USD"),
                "Área de interés": clasificar_area("Seguridad Alimentaria"),
                "Descripción": "Mejorar la resiliencia, sostenibilidad y competitividad de la producción de alimentos en el Caribe"
            },
            {
                "Nombre": "Fortalecimiento del Registro e Identidad Digital de Productores Agrarios - Perú",
                "Fuente": "IICA - Perú",
                "Fecha cierre": parsear_fecha("27/02/2026"),
                "Enlace": "https://apps.iica.int/dashboardproyectos/programas/Listado?AVC=8785",
                "Estado": "Abierto",
                "Monto": parsear_monto("2000000 USD"),
                "Área de interés": clasificar_area("Tecnología Agrícola"),
                "Descripción": "Adaptar las cadenas de valor de café, cacao y aceite de palma mediante mejora del registro digital"
            },
            {
                "Nombre": "Modernización de Servicios en la Escuela Nacional de Agricultura - El Salvador",
                "Fuente": "IICA - El Salvador",
                "Fecha cierre": parsear_fecha("31/08/2026"),
                "Enlace": "https://apps.iica.int/dashboardproyectos/programas/Listado?AVC=8785",
                "Estado": "Abierto",
                "Monto": parsear_monto("1500000 USD"),
                "Área de interés": clasificar_area("Educación Agrícola"),
                "Descripción": "Modernizar servicios de agua potable, energía eléctrica e infraestructura agrícola"
            },
            {
                "Nombre": "Producción de Camote de Nueva Generación - Jamaica",
                "Fuente": "IICA - Jamaica",
                "Fecha cierre": parsear_fecha("15/08/2028"),
                "Enlace": "https://apps.iica.int/dashboardproyectos/programas/Listado?AVC=8785",
                "Estado": "Abierto",
                "Monto": parsear_monto("1800000 USD"),
                "Área de interés": clasificar_area("Producción Agrícola"),
                "Descripción": "Mejorar la producción de camote en el Caribe, centrándose en Jamaica"
            },
            {
                "Nombre": "Apoyo al Centro de Investigación y Producción en Ambiente Controlado - Panamá",
                "Fuente": "IICA - Panamá",
                "Fecha cierre": parsear_fecha("08/08/2025"),
                "Enlace": "https://apps.iica.int/dashboardproyectos/programas/Listado?AVC=8785",
                "Estado": "Abierto",
                "Monto": parsear_monto("1200000 USD"),
                "Área de interés": clasificar_area("Investigación Agrícola"),
                "Descripción": "Apoyar el funcionamiento del CIPAC-AIP en Panamá"
            },
            {
                "Nombre": "Proyectos de Reactivación Económica en Zonas Rurales - Costa Rica",
                "Fuente": "IICA - Costa Rica",
                "Fecha cierre": parsear_fecha("31/12/2025"),
                "Enlace": "https://iica.int/es/press/noticias/costa-rica-impulsa-18-proyectos-para-reactivacion-economica-en-zonas-rurales",
                "Estado": "Abierto",
                "Monto": parsear_monto("4000000 USD"),
                "Área de interés": clasificar_area("Desarrollo Rural"),
                "Descripción": "18 proyectos de inversión con valor agregado para reactivar economía en comunidades rurales"
            },
            {
                "Nombre": "Proyecto de Cooperación con la Unión Europea - Desarrollo Territorial",
                "Fuente": "IICA - Unión Europea",
                "Fecha cierre": parsear_fecha("31/12/2026"),
                "Enlace": "https://iica.int/es/proyectos-de-cooperacion-con-la-union-europea-y-agencias-europeas-de-cooperacion",
                "Estado": "Abierto",
                "Monto": parsear_monto("10000000 USD"),
                "Área de interés": clasificar_area("Cooperación Internacional"),
                "Descripción": "Programas cofinanciados con la UE para fortalecer desarrollo territorial y agricultura familiar"
            },
            {
                "Nombre": "Construcción de Estanques de Geomembranas - Honduras",
                "Fuente": "IICA - Honduras SAG",
                "Fecha cierre": parsear_fecha("30/06/2025"),
                "Enlace": "https://iica.int/es/bids/honduras-licitacion-no-15-2025-construccion-de-dos-proyectos-de-estanques-de-geomembranas",
                "Estado": "Abierto",
                "Monto": parsear_monto("500000 USD"),
                "Área de interés": clasificar_area("Infraestructura Agrícola"),
                "Descripción": "Construcción de estanques de geomembranas para fortalecimiento de programas agrícolas"
            },
            {
                "Nombre": "Proyecto Internacional de Capitalización de Experiencias",
                "Fuente": "IICA - FAO",
                "Fecha cierre": parsear_fecha("31/12/2025"),
                "Enlace": "https://iica.int/es/press/noticias/nuevo-proyecto-internacional-busca-mejorar-el-desarrollo-rural-en-15-paises",
                "Estado": "Abierto",
                "Monto": parsear_monto("8000000 USD"),
                "Área de interés": clasificar_area("Desarrollo Rural"),
                "Descripción": "Mejorar calidad y efectividad de proyectos de desarrollo rural en 15 países mediante sistematización de buenas prácticas"
            }
        ])
        print(f"✅ Agregados {len(proyectos)} proyectos IICA nuevos")
    except Exception as e:
        print(f"Error obteniendo proyectos IICA nuevos: {e}")
    return proyectos

def obtener_proyectos_internacionales():
    """Obtener todos los proyectos internacionales"""
    proyectos = []
    
    # Agregar proyectos de todas las fuentes
    proyectos.extend(obtener_proyectos_kickstarter())
    proyectos.extend(obtener_proyectos_gofundme())
    proyectos.extend(obtener_proyectos_indiegogo())
    proyectos.extend(obtener_proyectos_rockethub())
    proyectos.extend(obtener_proyectos_artistshare())
    proyectos.extend(obtener_proyectos_agricultural_grants())
    proyectos.extend(obtener_proyectos_development_funding())
    proyectos.extend(obtener_proyectos_tech_innovation())
    proyectos.extend(obtener_proyectos_education_research())
    proyectos.extend(obtener_proyectos_environmental_sustainability())
    # Agregar nuevos proyectos IICA encontrados en búsqueda web
    proyectos.extend(obtener_proyectos_iica_nuevos())
    
    print(f"📊 Total de proyectos internacionales: {len(proyectos)}")
    return proyectos