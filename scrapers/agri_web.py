from utils import clasificar_area, parsear_fecha, parsear_monto
from scrapers.common import fetch_html, parse_with_bs4
import re
from datetime import datetime, timedelta

def obtener_proyectos_agri_web():
    """
    Ejemplo de scraper real para una página web de agricultura
    """
    proyectos = []
    
    # URL de ejemplo - reemplaza con la URL real
    url = "https://ejemplo-agricultura.com/convocatorias"
    
    try:
        html = fetch_html(url)
        if not html:
            return proyectos
            
        soup = parse_with_bs4(html)
        
        # Buscar contenedores de proyectos (ajusta según la estructura HTML)
        contenedores = soup.find_all('div', class_='proyecto-item')  # Ajusta el selector
        
        for contenedor in contenedores:
            try:
                # Extraer datos (ajusta según la estructura real)
                nombre = contenedor.find('h3', class_='titulo').get_text(strip=True)
                enlace = contenedor.find('a')['href']
                fecha_texto = contenedor.find('span', class_='fecha').get_text(strip=True)
                monto_texto = contenedor.find('span', class_='monto').get_text(strip=True)
                
                # Crear proyecto
                proyecto = {
                    "Nombre": nombre,
                    "Fuente": "AgriWeb",
                    "Fecha cierre": fecha_texto,
                    "Enlace": enlace,
                    "Monto": monto_texto,
                    "Estado": "Abierto"
                }
                
                # Aplicar utilidades
                proyecto['Área de interés'] = clasificar_area(proyecto['Nombre'])
                proyecto['Fecha cierre'] = parsear_fecha(proyecto['Fecha cierre'])
                proyecto['Monto'] = parsear_monto(proyecto['Monto'])
                
                proyectos.append(proyecto)
                
            except Exception as e:
                print(f"Error procesando proyecto: {e}")
                continue
                
    except Exception as e:
        print(f"Error en scraper AgriWeb: {e}")
    
    return proyectos
