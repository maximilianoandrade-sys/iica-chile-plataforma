"""
Buscador Semántico de Proyectos IICA Chile
Usa SentenceTransformers para filtrar proyectos por relevancia semántica
"""

import requests
from bs4 import BeautifulSoup
import sqlite3
import os
import logging
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

# Intentar importar sentence_transformers (opcional)
try:
    from sentence_transformers import SentenceTransformer, util
    SEMANTIC_AVAILABLE = True
except ImportError:
    SEMANTIC_AVAILABLE = False
    logger.warning("⚠️ sentence_transformers no disponible. El filtrado semántico estará deshabilitado.")

# Prioridades de IICA Chile
PRIORIDADES_IICA = [
    "Desarrollo agrícola sostenible",
    "Innovación tecnológica en agricultura",
    "Cambio climático y adaptación agrícola",
    "Seguridad alimentaria y nutricional",
    "Cooperación internacional en agricultura"
]

# Inicializar modelo semántico (lazy loading)
_model = None
_embeddings_prioridades = None

def get_semantic_model():
    """Obtener o inicializar el modelo semántico"""
    global _model, _embeddings_prioridades
    
    if not SEMANTIC_AVAILABLE:
        return None, None
    
    if _model is None:
        try:
            logger.info("🔄 Cargando modelo semántico...")
            _model = SentenceTransformer('all-MiniLM-L6-v2')
            _embeddings_prioridades = _model.encode(PRIORIDADES_IICA, convert_to_tensor=True)
            logger.info("✅ Modelo semántico cargado")
        except Exception as e:
            logger.error(f"❌ Error cargando modelo semántico: {e}")
            return None, None
    
    return _model, _embeddings_prioridades

# Base de datos SQLite
DB_PATH = 'data/proyectos_semanticos.db'

def init_db():
    """Inicializar base de datos SQLite"""
    os.makedirs('data', exist_ok=True)
    conn = sqlite3.connect(DB_PATH, check_same_thread=False)
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS proyectos_semanticos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fuente TEXT,
        titulo TEXT UNIQUE,
        resumen TEXT,
        similitud REAL,
        fecha_agregado TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    conn.commit()
    return conn, cursor

# Conexión global a la DB
_db_conn, _db_cursor = init_db()

def obtener_proyectos_devex_semantic():
    """Extraer proyectos de Devex para búsqueda semántica"""
    proyectos = []
    try:
        url = 'https://www.devex.com/funding'
        response = requests.get(url, timeout=10, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Buscar elementos de proyectos (selectores pueden variar)
        items = soup.select('.search-result-item, .project-item, .funding-item')
        
        for item in items[:20]:  # Limitar a 20
            try:
                titulo_elem = item.select_one('.search-result-title, .title, h3, h4')
                resumen_elem = item.select_one('.search-result-snippet, .snippet, .description, p')
                
                if titulo_elem:
                    titulo = titulo_elem.get_text(strip=True)
                    resumen = resumen_elem.get_text(strip=True) if resumen_elem else ""
                    
                    if titulo and len(titulo) > 10:
                        proyectos.append({
                            'fuente': 'Devex',
                            'titulo': titulo,
                            'resumen': resumen
                        })
            except Exception as e:
                logger.debug(f"Error procesando item Devex: {e}")
                continue
    except Exception as e:
        logger.warning(f"⚠️ Error obteniendo proyectos Devex: {e}")
    
    return proyectos

def obtener_proyectos_bid_semantic():
    """Extraer proyectos del BID para búsqueda semántica"""
    proyectos = []
    try:
        url = 'https://idbdocs.iadb.org/ws/ODL/odsapi/v1/projects/'
        response = requests.get(url, timeout=10)
        data = response.json()
        
        for item in data.get('data', [])[:20]:  # Limitar a 20
            titulo = item.get('project_name', '')
            resumen = item.get('objective', '') or item.get('description', '')
            
            if titulo:
                proyectos.append({
                    'fuente': 'BID',
                    'titulo': titulo,
                    'resumen': resumen
                })
    except Exception as e:
        logger.warning(f"⚠️ Error obteniendo proyectos BID: {e}")
    
    return proyectos

def obtener_proyectos_banco_mundial_semantic():
    """Extraer proyectos del Banco Mundial para búsqueda semántica"""
    proyectos = []
    try:
        url = 'https://api.worldbank.org/v2/projects?format=json&country=CL'
        response = requests.get(url, timeout=10)
        data = response.json()
        
        if isinstance(data, list) and len(data) > 1:
            for item in data[1][:20]:  # Limitar a 20
                titulo = item.get('project_name', '')
                resumen = item.get('project_abstract', '')
                
                if titulo:
                    proyectos.append({
                        'fuente': 'Banco Mundial',
                        'titulo': titulo,
                        'resumen': resumen
                    })
    except Exception as e:
        logger.warning(f"⚠️ Error obteniendo proyectos Banco Mundial: {e}")
    
    return proyectos

def filtrar_proyectos_semanticos(proyectos: List[Dict], umbral: float = 0.6) -> List[Dict]:
    """Filtrar proyectos por similitud semántica"""
    if not SEMANTIC_AVAILABLE:
        logger.warning("⚠️ Filtrado semántico no disponible, retornando todos los proyectos")
        return proyectos
    
    model, embeddings_prioridades = get_semantic_model()
    if model is None:
        return proyectos
    
    proyectos_filtrados = []
    
    for proyecto in proyectos:
        try:
            texto = f"{proyecto['titulo']} {proyecto.get('resumen', '')}"
            embedding = model.encode(texto, convert_to_tensor=True)
            similitud = util.pytorch_cos_sim(embedding, embeddings_prioridades).max().item()
            
            if similitud >= umbral:
                proyecto['similitud'] = similitud
                proyectos_filtrados.append(proyecto)
        except Exception as e:
            logger.debug(f"Error calculando similitud: {e}")
            continue
    
    # Ordenar por similitud descendente
    proyectos_filtrados.sort(key=lambda x: x.get('similitud', 0), reverse=True)
    return proyectos_filtrados

def guardar_proyectos_en_db(proyectos: List[Dict]):
    """Guardar proyectos en la base de datos evitando duplicados"""
    conn, cursor = init_db()
    
    for p in proyectos:
        try:
            cursor.execute('''
                INSERT OR IGNORE INTO proyectos_semanticos 
                (fuente, titulo, resumen, similitud) 
                VALUES (?, ?, ?, ?)
            ''', (p['fuente'], p['titulo'], p.get('resumen', ''), p.get('similitud', 0.0)))
        except Exception as e:
            logger.debug(f"Error guardando proyecto: {e}")
    
    conn.commit()

def buscar_proyectos_db(filtro: Optional[str] = None, limite: int = 100) -> List[tuple]:
    """Buscar proyectos en la base de datos con filtro opcional"""
    conn, cursor = init_db()
    
    if filtro:
        filtro_like = f'%{filtro}%'
        cursor.execute('''
            SELECT fuente, titulo, resumen, similitud 
            FROM proyectos_semanticos 
            WHERE titulo LIKE ? OR resumen LIKE ?
            ORDER BY similitud DESC 
            LIMIT ?
        ''', (filtro_like, filtro_like, limite))
    else:
        cursor.execute('''
            SELECT fuente, titulo, resumen, similitud 
            FROM proyectos_semanticos 
            ORDER BY similitud DESC 
            LIMIT ?
        ''', (limite,))
    
    return cursor.fetchall()

def actualizar_y_guardar_proyectos():
    """Orquestador para extracción, filtrado y guardado"""
    logger.info("🔄 Iniciando actualización de proyectos semánticos...")
    
    proyectos = []
    proyectos.extend(obtener_proyectos_devex_semantic())
    proyectos.extend(obtener_proyectos_bid_semantic())
    proyectos.extend(obtener_proyectos_banco_mundial_semantic())
    
    logger.info(f"📊 Se obtuvieron {len(proyectos)} proyectos totales.")
    
    if SEMANTIC_AVAILABLE:
        proyectos_filtrados = filtrar_proyectos_semanticos(proyectos)
        logger.info(f"✅ {len(proyectos_filtrados)} proyectos relevantes después del filtro semántico.")
    else:
        proyectos_filtrados = proyectos
        logger.info(f"⚠️ Filtrado semántico deshabilitado, guardando todos los proyectos.")
    
    guardar_proyectos_en_db(proyectos_filtrados)
    logger.info("💾 Proyectos guardados en base de datos.")

