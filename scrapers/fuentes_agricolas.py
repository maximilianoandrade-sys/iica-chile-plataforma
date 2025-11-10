"""
Scraper para fuentes agrícolas y de desarrollo rural específicas
Incluye CNR, GEF, FIA, INDAP y Fondos.gob.cl
"""
import requests
from bs4 import BeautifulSoup
from utils import clasificar_area, parsear_fecha, parsear_monto

def fetch_html(url):
    """Obtiene el HTML de una URL"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        return response.text
    except Exception as e:
        print(f"Error obteniendo HTML de {url}: {e}")
        return None

def obtener_proyectos_cnr():
    """Obtiene proyectos de la Comisión Nacional de Riego"""
    proyectos = []
    try:
        url = "https://www.cnr.gob.cl/pequena-agricultura/"
        html = fetch_html(url)
        if not html:
            return proyectos
            
        soup = BeautifulSoup(html, 'html.parser')
        
        # Buscar programas y convocatorias
        programas = soup.find_all(['div', 'section'], class_=lambda x: x and any(keyword in x.lower() for keyword in ['programa', 'convocatoria', 'fondo', 'bonificacion']))
        
        for programa in programas:
            try:
                titulo_elem = programa.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
                if not titulo_elem:
                    continue
                    
                titulo = titulo_elem.get_text(strip=True)
                if not titulo or len(titulo) < 10:
                    continue
                
                # Buscar descripción
                descripcion = ""
                desc_elem = programa.find(['p', 'div'], class_=lambda x: x and 'descripcion' in x.lower() if x else False)
                if not desc_elem:
                    desc_elem = programa.find('p')
                if desc_elem:
                    descripcion = desc_elem.get_text(strip=True)[:200]
                
                # Buscar enlaces
                enlace = url
                link_elem = programa.find('a', href=True)
                if link_elem:
                    href = link_elem['href']
                    if href.startswith('http'):
                        enlace = href
                    elif href.startswith('/'):
                        enlace = "https://www.cnr.gob.cl" + href
                
                proyectos.append({
                    "Nombre": titulo,
                    "Fuente": "CNR - Comisión Nacional de Riego",
                    "Fecha cierre": "Consultar",
                    "Enlace": enlace,
                    "Estado": "Abierto",
                    "Monto": "Variable",
                    "Área de interés": clasificar_area(titulo + " " + descripcion),
                    "Descripción": descripcion
                })
                
            except Exception as e:
                continue
                
    except Exception as e:
        print(f"Error en scraper CNR: {e}")
    
    return proyectos

def obtener_proyectos_gef():
    """Obtiene proyectos del Fondo para el Medio Ambiente Mundial"""
    proyectos = []
    try:
        url = "https://mma.gob.cl/asuntos-internacionales/el-fondo-para-el-medio-ambiente-mundial-gef/"
        html = fetch_html(url)
        if not html:
            return proyectos
            
        soup = BeautifulSoup(html, 'html.parser')
        
        # Buscar información sobre proyectos GEF
        contenido = soup.find(['div', 'section'], class_=lambda x: x and 'content' in x.lower() if x else False)
        if not contenido:
            contenido = soup.find('main')
        if not contenido:
            contenido = soup
            
        parrafos = contenido.find_all(['p', 'div'], string=lambda text: text and any(keyword in text.lower() for keyword in ['proyecto', 'programa', 'fondo', 'financiamiento']))
        
        for i, parrafo in enumerate(parrafos[:5]):  # Limitar a 5 proyectos
            try:
                texto = parrafo.get_text(strip=True)
                if len(texto) < 50:
                    continue
                    
                # Crear título basado en el contenido
                titulo = f"Proyecto GEF {i+1}: {texto[:50]}..."
                
                proyectos.append({
                    "Nombre": titulo,
                    "Fuente": "GEF - Fondo para el Medio Ambiente Mundial",
                    "Fecha cierre": "Consultar",
                    "Enlace": url,
                    "Estado": "Abierto",
                    "Monto": "Variable",
                    "Área de interés": clasificar_area(texto),
                    "Descripción": texto[:200]
                })
                
            except Exception as e:
                continue
                
    except Exception as e:
        print(f"Error en scraper GEF: {e}")
    
    return proyectos

def obtener_proyectos_fia():
    """Obtiene proyectos de la Fundación para la Innovación Agraria"""
    proyectos = []
    try:
        url = "https://www.fia.cl/"
        html = fetch_html(url)
        if not html:
            return proyectos
            
        soup = BeautifulSoup(html, 'html.parser')
        
        # Buscar programas y convocatorias
        programas = soup.find_all(['div', 'article'], class_=lambda x: x and any(keyword in x.lower() for keyword in ['programa', 'convocatoria', 'proyecto', 'fondo']) if x else False)
        
        for programa in programas[:10]:  # Limitar resultados
            try:
                titulo_elem = programa.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
                if not titulo_elem:
                    continue
                    
                titulo = titulo_elem.get_text(strip=True)
                if not titulo or len(titulo) < 10:
                    continue
                
                # Buscar descripción
                descripcion = ""
                desc_elem = programa.find(['p', 'div'])
                if desc_elem:
                    descripcion = desc_elem.get_text(strip=True)[:200]
                
                # Buscar enlaces
                enlace = url
                link_elem = programa.find('a', href=True)
                if link_elem:
                    href = link_elem['href']
                    if href.startswith('http'):
                        enlace = href
                    elif href.startswith('/'):
                        enlace = "https://www.fia.cl" + href
                
                proyectos.append({
                    "Nombre": titulo,
                    "Fuente": "FIA - Fundación para la Innovación Agraria",
                    "Fecha cierre": "Consultar",
                    "Enlace": enlace,
                    "Estado": "Abierto",
                    "Monto": "Variable",
                    "Área de interés": clasificar_area(titulo + " " + descripcion),
                    "Descripción": descripcion
                })
                
            except Exception as e:
                continue
                
    except Exception as e:
        print(f"Error en scraper FIA: {e}")
    
    return proyectos

def obtener_proyectos_indap():
    """Obtiene proyectos del Instituto de Desarrollo Agropecuario"""
    proyectos = []
    try:
        url = "https://www.indap.gob.cl/"
        html = fetch_html(url)
        if not html:
            return proyectos
            
        soup = BeautifulSoup(html, 'html.parser')
        
        # Buscar programas
        programas = soup.find_all(['div', 'section'], class_=lambda x: x and any(keyword in x.lower() for keyword in ['programa', 'servicio', 'fondo', 'apoyo']) if x else False)
        
        for programa in programas[:8]:  # Limitar resultados
            try:
                titulo_elem = programa.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
                if not titulo_elem:
                    continue
                    
                titulo = titulo_elem.get_text(strip=True)
                if not titulo or len(titulo) < 10:
                    continue
                
                # Buscar descripción
                descripcion = ""
                desc_elem = programa.find(['p', 'div'])
                if desc_elem:
                    descripcion = desc_elem.get_text(strip=True)[:200]
                
                # Buscar enlaces
                enlace = url
                link_elem = programa.find('a', href=True)
                if link_elem:
                    href = link_elem['href']
                    if href.startswith('http'):
                        enlace = href
                    elif href.startswith('/'):
                        enlace = "https://www.indap.gob.cl" + href
                
                proyectos.append({
                    "Nombre": titulo,
                    "Fuente": "INDAP - Instituto de Desarrollo Agropecuario",
                    "Fecha cierre": "Consultar",
                    "Enlace": enlace,
                    "Estado": "Abierto",
                    "Monto": "Variable",
                    "Área de interés": clasificar_area(titulo + " " + descripcion),
                    "Descripción": descripcion
                })
                
            except Exception as e:
                continue
                
    except Exception as e:
        print(f"Error en scraper INDAP: {e}")
    
    return proyectos

def obtener_proyectos_fondos_gob():
    """Obtiene proyectos del Portal Único de Fondos Concursables"""
    proyectos = []
    try:
        url = "https://www.fondos.gob.cl/"
        html = fetch_html(url)
        if not html:
            return proyectos
            
        soup = BeautifulSoup(html, 'html.parser')
        
        # Buscar fondos y programas
        fondos = soup.find_all(['div', 'article'], class_=lambda x: x and any(keyword in x.lower() for keyword in ['fondo', 'programa', 'concurso', 'convocatoria']) if x else False)
        
        for fondo in fondos[:12]:  # Limitar resultados
            try:
                titulo_elem = fondo.find(['h1', 'h2', 'h3', 'h4', 'h5', 'h6'])
                if not titulo_elem:
                    continue
                    
                titulo = titulo_elem.get_text(strip=True)
                if not titulo or len(titulo) < 10:
                    continue
                
                # Buscar descripción
                descripcion = ""
                desc_elem = fondo.find(['p', 'div'])
                if desc_elem:
                    descripcion = desc_elem.get_text(strip=True)[:200]
                
                # Buscar enlaces
                enlace = url
                link_elem = fondo.find('a', href=True)
                if link_elem:
                    href = link_elem['href']
                    if href.startswith('http'):
                        enlace = href
                    elif href.startswith('/'):
                        enlace = "https://www.fondos.gob.cl" + href
                
                proyectos.append({
                    "Nombre": titulo,
                    "Fuente": "Fondos.gob.cl - Portal Único de Fondos",
                    "Fecha cierre": "Consultar",
                    "Enlace": enlace,
                    "Estado": "Abierto",
                    "Monto": "Variable",
                    "Área de interés": clasificar_area(titulo + " " + descripcion),
                    "Descripción": descripcion
                })
                
            except Exception as e:
                continue
                
    except Exception as e:
        print(f"Error en scraper Fondos.gob.cl: {e}")
    
    return proyectos
