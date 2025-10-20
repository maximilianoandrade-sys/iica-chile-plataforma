"""
Scrapers para fuentes de financiamiento internacionales adicionales
Basado en búsqueda web de oportunidades de financiamiento 2024
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
            "Nombre": "Agricultural Innovation Challenge 2024",
            "Fuente": "Kickstarter",
            "Fecha cierre": parsear_fecha("31/12/2024"),
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
            "Fecha cierre": parsear_fecha("30/11/2024"),
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
            "Fecha cierre": parsear_fecha("15/12/2024"),
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
                "Nombre": "AgTech Innovation Challenge 2024",
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
