#!/usr/bin/env python3
"""
Módulo para gestión inteligente de enlaces
Optimizado para Render y producción
"""

import json
import requests
from urllib.parse import urlparse, quote
import time
from datetime import datetime, timedelta
import pandas as pd

class LinkManager:
    def __init__(self):
        self.enlaces_render = self.cargar_enlaces_render()
        self.cache_enlaces = {}
        self.timeout = 10
        
    def cargar_enlaces_render(self):
        """Carga enlaces específicos para Render"""
        try:
            with open('static/enlaces_render.json', 'r', encoding='utf-8') as f:
                return json.load(f)
        except FileNotFoundError:
            return self.enlaces_render_default()
    
    def enlaces_render_default(self):
        """Enlaces por defecto si no existe el archivo"""
        return {
            "corfo": {
                "base": "https://www.corfo.cl/sites/cpp/convocatorias",
                "busqueda": "https://www.corfo.cl/sites/cpp/convocatorias?search=",
                "contacto": "https://www.corfo.cl/contacto"
            },
            "fia": {
                "base": "https://www.fia.cl/convocatorias/",
                "busqueda": "https://www.fia.cl/convocatorias/?search=",
                "contacto": "https://www.fia.cl/contacto"
            },
            "iica": {
                "base": "https://www.iica.int/es/paises/chile",
                "busqueda": "https://www.iica.int/es/paises/chile/proyectos",
                "contacto": "https://www.iica.int/es/paises/chile/contacto"
            }
        }
    
    def verificar_enlace(self, url, usar_cache=True):
        """Verifica si un enlace es funcional"""
        if not url or pd.isna(url) or url.strip() == '':
            return False, "URL vacía"
        
        # Verificar cache
        if usar_cache and url in self.cache_enlaces:
            cache_data = self.cache_enlaces[url]
            if datetime.now() - cache_data['timestamp'] < timedelta(hours=24):
                return cache_data['funcional'], cache_data['mensaje']
        
        # Limpiar URL
        url_limpia = self.limpiar_url(url)
        
        try:
            response = requests.get(url_limpia, timeout=self.timeout, allow_redirects=True)
            es_funcional = response.status_code == 200
            
            # Guardar en cache
            self.cache_enlaces[url] = {
                'funcional': es_funcional,
                'mensaje': f"Status: {response.status_code}",
                'timestamp': datetime.now()
            }
            
            return es_funcional, f"Status: {response.status_code}"
            
        except requests.exceptions.Timeout:
            return False, "Timeout"
        except requests.exceptions.ConnectionError:
            return False, "Error de conexión"
        except Exception as e:
            return False, f"Error: {str(e)}"
    
    def limpiar_url(self, url):
        """Limpia y normaliza una URL"""
        if not url or pd.isna(url) or url.strip() == '':
            return url
        
        url = url.strip()
        
        # Agregar https si no tiene protocolo
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        return url
    
    def generar_enlace_alternativo(self, fuente, nombre_proyecto, tipo='busqueda'):
        """Genera enlace alternativo basado en la fuente"""
        fuente_lower = fuente.lower()
        
        # Buscar en enlaces de Render
        for key, enlaces in self.enlaces_render.items():
            if key in fuente_lower or fuente_lower in key:
                if tipo in enlaces:
                    if tipo == 'busqueda':
                        return enlaces[tipo] + quote(nombre_proyecto[:30])
                    return enlaces[tipo]
        
        # Enlaces genéricos por fuente
        if 'corfo' in fuente_lower:
            if tipo == 'busqueda':
                return f"https://www.corfo.cl/sites/cpp/convocatorias?search={quote(nombre_proyecto[:30])}"
            return "https://www.corfo.cl/sites/cpp/convocatorias"
        
        elif 'fia' in fuente_lower:
            if tipo == 'busqueda':
                return f"https://www.fia.cl/convocatorias/?search={quote(nombre_proyecto[:30])}"
            return "https://www.fia.cl/convocatorias/"
        
        elif 'sag' in fuente_lower:
            if tipo == 'busqueda':
                return f"https://www.sag.gob.cl/noticias/convocatorias?search={quote(nombre_proyecto[:30])}"
            return "https://www.sag.gob.cl/noticias/convocatorias"
        
        elif 'indap' in fuente_lower:
            if tipo == 'busqueda':
                return f"https://www.indap.gob.cl/convocatorias?search={quote(nombre_proyecto[:30])}"
            return "https://www.indap.gob.cl/convocatorias"
        
        # Enlace genérico IICA
        return "https://www.iica.int/es/paises/chile"
    
    def obtener_enlaces_proyecto(self, proyecto):
        """Obtiene todos los enlaces relevantes para un proyecto"""
        enlaces = {
            'principal': None,
            'postulacion': None,
            'documentos': None,
            'contacto': None,
            'alternativos': []
        }
        
        # Enlace principal
        if 'Enlace' in proyecto and pd.notna(proyecto['Enlace']):
            enlaces['principal'] = self.limpiar_url(proyecto['Enlace'])
        
        # Enlace de postulación
        if 'Enlace Postulación' in proyecto and pd.notna(proyecto['Enlace Postulación']):
            enlaces['postulacion'] = self.limpiar_url(proyecto['Enlace Postulación'])
        
        # Enlace de documentos
        if 'Enlace Documentos' in proyecto and pd.notna(proyecto['Enlace Documentos']):
            enlaces['documentos'] = self.limpiar_url(proyecto['Enlace Documentos'])
        
        # Enlace de contacto
        if 'Contacto' in proyecto and pd.notna(proyecto['Contacto']):
            enlaces['contacto'] = proyecto['Contacto']
        
        # Generar enlaces alternativos
        enlaces['alternativos'] = [
            {
                'tipo': 'Búsqueda en sitio oficial',
                'url': self.generar_enlace_alternativo(proyecto['Fuente'], proyecto['Nombre'], 'busqueda'),
                'descripcion': f'Buscar "{proyecto["Nombre"][:30]}..." en {proyecto["Fuente"]}'
            },
            {
                'tipo': 'Sitio oficial',
                'url': self.generar_enlace_alternativo(proyecto['Fuente'], proyecto['Nombre'], 'base'),
                'descripcion': f'Sitio oficial de {proyecto["Fuente"]}'
            },
            {
                'tipo': 'Contacto',
                'url': self.generar_enlace_alternativo(proyecto['Fuente'], proyecto['Nombre'], 'contacto'),
                'descripcion': f'Contactar a {proyecto["Fuente"]}'
            }
        ]
        
        return enlaces
    
    def verificar_todos_enlaces(self, proyectos):
        """Verifica todos los enlaces de una lista de proyectos"""
        resultados = {
            'total': len(proyectos),
            'funcionales': 0,
            'no_funcionales': 0,
            'sin_enlaces': 0,
            'detalles': []
        }
        
        for idx, proyecto in enumerate(proyectos):
            print(f"🔍 Verificando proyecto {idx + 1}/{len(proyectos)}: {proyecto['Nombre'][:50]}...")
            
            enlaces = self.obtener_enlaces_proyecto(proyecto)
            proyecto_resultado = {
                'nombre': proyecto['Nombre'],
                'fuente': proyecto['Fuente'],
                'enlaces': enlaces,
                'estado': 'sin_enlaces'
            }
            
            # Verificar enlaces principales
            enlaces_verificados = 0
            enlaces_funcionales = 0
            
            for tipo, url in enlaces.items():
                if tipo != 'alternativos' and url:
                    enlaces_verificados += 1
                    es_funcional, mensaje = self.verificar_enlace(url)
                    if es_funcional:
                        enlaces_funcionales += 1
            
            if enlaces_verificados == 0:
                proyecto_resultado['estado'] = 'sin_enlaces'
                resultados['sin_enlaces'] += 1
            elif enlaces_funcionales > 0:
                proyecto_resultado['estado'] = 'funcional'
                resultados['funcionales'] += 1
            else:
                proyecto_resultado['estado'] = 'no_funcional'
                resultados['no_funcionales'] += 1
            
            resultados['detalles'].append(proyecto_resultado)
            
            # Pausa para no sobrecargar
            time.sleep(0.3)
        
        return resultados
    
    def generar_reporte_enlaces(self, resultados):
        """Genera reporte de verificación de enlaces"""
        reporte = f"""
# REPORTE DE VERIFICACIÓN DE ENLACES
## Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## RESUMEN EJECUTIVO
- **Total de proyectos:** {resultados['total']}
- **Proyectos con enlaces funcionales:** {resultados['funcionales']}
- **Proyectos con enlaces no funcionales:** {resultados['no_funcionales']}
- **Proyectos sin enlaces:** {resultados['sin_enlaces']}

## TASA DE ÉXITO
- **Funcionalidad:** {(resultados['funcionales'] / max(resultados['total'], 1) * 100):.1f}%
- **Cobertura de enlaces:** {((resultados['funcionales'] + resultados['no_funcionales']) / max(resultados['total'], 1) * 100):.1f}%

## DETALLES POR PROYECTO
"""
        
        for detalle in resultados['detalles']:
            reporte += f"\n### {detalle['nombre']}\n"
            reporte += f"- **Fuente:** {detalle['fuente']}\n"
            reporte += f"- **Estado:** {detalle['estado']}\n"
            
            if detalle['enlaces']['principal']:
                reporte += f"- **Enlace principal:** {detalle['enlaces']['principal']}\n"
            if detalle['enlaces']['postulacion']:
                reporte += f"- **Enlace postulación:** {detalle['enlaces']['postulacion']}\n"
            if detalle['enlaces']['documentos']:
                reporte += f"- **Enlace documentos:** {detalle['enlaces']['documentos']}\n"
        
        # Guardar reporte
        with open('REPORTE_ENLACES_DETALLADO.md', 'w', encoding='utf-8') as f:
            f.write(reporte)
        
        print(f"📄 Reporte detallado guardado: REPORTE_ENLACES_DETALLADO.md")
        return reporte

# Instancia global para usar en la aplicación
link_manager = LinkManager()
