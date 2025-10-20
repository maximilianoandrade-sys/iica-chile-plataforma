#!/usr/bin/env python3
"""
Script para verificar y corregir todos los links de la plataforma
Especialmente optimizado para Render
"""

import pandas as pd
import requests
from urllib.parse import urlparse
import time
import re
from datetime import datetime

def verificar_url(url, timeout=10):
    """Verifica si una URL es accesible"""
    try:
        if not url or pd.isna(url) or url.strip() == '':
            return False, "URL vacía"
        
        # Limpiar URL
        url = url.strip()
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        response = requests.get(url, timeout=timeout, allow_redirects=True)
        return response.status_code == 200, f"Status: {response.status_code}"
    except requests.exceptions.Timeout:
        return False, "Timeout"
    except requests.exceptions.ConnectionError:
        return False, "Error de conexión"
    except Exception as e:
        return False, f"Error: {str(e)}"

def corregir_url(url):
    """Corrige URLs comunes"""
    if not url or pd.isna(url) or url.strip() == '':
        return url
    
    url = url.strip()
    
    # Agregar https si no tiene protocolo
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url
    
    # Correcciones específicas para sitios conocidos
    if 'corfo.cl' in url and not url.startswith('http'):
        url = 'https://www.corfo.cl' + url
    elif 'fia.cl' in url and not url.startswith('http'):
        url = 'https://www.fia.cl' + url
    elif 'sag.gob.cl' in url and not url.startswith('http'):
        url = 'https://www.sag.gob.cl' + url
    elif 'indap.gob.cl' in url and not url.startswith('http'):
        url = 'https://www.indap.gob.cl' + url
    
    return url

def generar_enlaces_alternativos(fuente, nombre_proyecto):
    """Genera enlaces alternativos basados en la fuente"""
    enlaces = []
    
    if 'CORFO' in fuente.upper():
        enlaces.append({
            'tipo': 'Sitio Oficial CORFO',
            'url': 'https://www.corfo.cl/sites/cpp/convocatorias',
            'descripcion': 'Convocatorias CORFO'
        })
        enlaces.append({
            'tipo': 'Búsqueda CORFO',
            'url': f'https://www.corfo.cl/sites/cpp/convocatorias?search={nombre_proyecto[:20]}',
            'descripcion': f'Buscar: {nombre_proyecto[:30]}...'
        })
    
    elif 'FIA' in fuente.upper():
        enlaces.append({
            'tipo': 'Sitio Oficial FIA',
            'url': 'https://www.fia.cl/convocatorias/',
            'descripcion': 'Convocatorias FIA'
        })
    
    elif 'SAG' in fuente.upper():
        enlaces.append({
            'tipo': 'Sitio Oficial SAG',
            'url': 'https://www.sag.gob.cl/noticias/convocatorias',
            'descripcion': 'Convocatorias SAG'
        })
    
    elif 'INDAP' in fuente.upper():
        enlaces.append({
            'tipo': 'Sitio Oficial INDAP',
            'url': 'https://www.indap.gob.cl/convocatorias',
            'descripcion': 'Convocatorias INDAP'
        })
    
    # Enlaces genéricos útiles
    enlaces.extend([
        {
            'tipo': 'IICA Chile',
            'url': 'https://www.iica.int/es/paises/chile',
            'descripcion': 'Oficina IICA Chile'
        },
        {
            'tipo': 'Ministerio de Agricultura',
            'url': 'https://www.minagri.gob.cl/',
            'descripcion': 'Minagri Chile'
        }
    ])
    
    return enlaces

def procesar_base_datos():
    """Procesa y corrige la base de datos completa"""
    print("🔍 Iniciando verificación y corrección de base de datos...")
    
    try:
        # Cargar datos
        df = pd.read_excel('data/proyectos_fortalecidos.xlsx')
        print(f"📊 Cargados {len(df)} proyectos")
        
        # Columnas de enlaces a verificar
        columnas_enlaces = ['Enlace', 'Enlace Postulación', 'Enlace Documentos']
        
        # Estadísticas
        stats = {
            'total_proyectos': len(df),
            'enlaces_verificados': 0,
            'enlaces_funcionales': 0,
            'enlaces_corregidos': 0,
            'enlaces_alternativos': 0
        }
        
        # Procesar cada proyecto
        for idx, row in df.iterrows():
            print(f"\n📋 Procesando proyecto {idx + 1}/{len(df)}: {row['Nombre'][:50]}...")
            
            # Verificar y corregir enlaces
            for col in columnas_enlaces:
                if col in df.columns:
                    url_original = row[col]
                    if pd.notna(url_original) and url_original.strip():
                        stats['enlaces_verificados'] += 1
                        
                        # Corregir URL
                        url_corregida = corregir_url(url_original)
                        if url_corregida != url_original:
                            df.at[idx, col] = url_corregida
                            stats['enlaces_corregidos'] += 1
                            print(f"  ✅ Corregido: {url_original} → {url_corregida}")
                        
                        # Verificar URL
                        es_funcional, mensaje = verificar_url(url_corregida)
                        if es_funcional:
                            stats['enlaces_funcionales'] += 1
                            print(f"  ✅ Funcional: {url_corregida}")
                        else:
                            print(f"  ❌ No funcional: {url_corregida} - {mensaje}")
                            
                            # Generar enlaces alternativos
                            enlaces_alt = generar_enlaces_alternativos(row['Fuente'], row['Nombre'])
                            if enlaces_alt:
                                df.at[idx, f'{col}_Alternativos'] = str(enlaces_alt)
                                stats['enlaces_alternativos'] += 1
                                print(f"  🔄 Agregados {len(enlaces_alt)} enlaces alternativos")
            
            # Agregar información de verificación
            df.at[idx, 'Verificado_Fecha'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            df.at[idx, 'Verificado_Status'] = 'Completado'
            
            # Pausa para no sobrecargar servidores
            time.sleep(0.5)
        
        # Guardar base de datos corregida
        df.to_excel('data/proyectos_fortalecidos_corregidos.xlsx', index=False)
        print(f"\n💾 Base de datos corregida guardada: proyectos_fortalecidos_corregidos.xlsx")
        
        # Generar reporte
        generar_reporte_verificacion(stats, df)
        
        return df, stats
        
    except Exception as e:
        print(f"❌ Error procesando base de datos: {e}")
        return None, None

def generar_reporte_verificacion(stats, df):
    """Genera reporte de verificación"""
    reporte = f"""
# REPORTE DE VERIFICACIÓN DE ENLACES
## Fecha: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

## ESTADÍSTICAS GENERALES
- **Total de proyectos:** {stats['total_proyectos']}
- **Enlaces verificados:** {stats['enlaces_verificados']}
- **Enlaces funcionales:** {stats['enlaces_funcionales']}
- **Enlaces corregidos:** {stats['enlaces_corregidos']}
- **Enlaces alternativos agregados:** {stats['enlaces_alternativos']}

## TASA DE ÉXITO
- **Funcionalidad:** {(stats['enlaces_funcionales'] / max(stats['enlaces_verificados'], 1) * 100):.1f}%
- **Correcciones aplicadas:** {(stats['enlaces_corregidos'] / max(stats['enlaces_verificados'], 1) * 100):.1f}%

## PROYECTOS POR FUENTE
"""
    
    # Estadísticas por fuente
    fuentes = df['Fuente'].value_counts()
    for fuente, count in fuentes.items():
        reporte += f"- **{fuente}:** {count} proyectos\n"
    
    # Guardar reporte
    with open('REPORTE_VERIFICACION_ENLACES.md', 'w', encoding='utf-8') as f:
        f.write(reporte)
    
    print(f"\n📄 Reporte guardado: REPORTE_VERIFICACION_ENLACES.md")

def crear_enlaces_render():
    """Crea enlaces específicos para Render"""
    enlaces_render = {
        'corfo': {
            'base': 'https://www.corfo.cl/sites/cpp/convocatorias',
            'busqueda': 'https://www.corfo.cl/sites/cpp/convocatorias?search=',
            'contacto': 'https://www.corfo.cl/contacto'
        },
        'fia': {
            'base': 'https://www.fia.cl/convocatorias/',
            'busqueda': 'https://www.fia.cl/convocatorias/?search=',
            'contacto': 'https://www.fia.cl/contacto'
        },
        'sag': {
            'base': 'https://www.sag.gob.cl/noticias/convocatorias',
            'busqueda': 'https://www.sag.gob.cl/noticias/convocatorias?search=',
            'contacto': 'https://www.sag.gob.cl/contacto'
        },
        'indap': {
            'base': 'https://www.indap.gob.cl/convocatorias',
            'busqueda': 'https://www.indap.gob.cl/convocatorias?search=',
            'contacto': 'https://www.indap.gob.cl/contacto'
        },
        'iica': {
            'base': 'https://www.iica.int/es/paises/chile',
            'busqueda': 'https://www.iica.int/es/paises/chile/proyectos',
            'contacto': 'https://www.iica.int/es/paises/chile/contacto'
        }
    }
    
    # Guardar enlaces para Render
    import json
    with open('static/enlaces_render.json', 'w', encoding='utf-8') as f:
        json.dump(enlaces_render, f, indent=2, ensure_ascii=False)
    
    print("🔗 Enlaces para Render guardados en static/enlaces_render.json")
    return enlaces_render

if __name__ == "__main__":
    print("🚀 INICIANDO REFUERZO DE BASE DE DATOS Y ENLACES")
    print("=" * 60)
    
    # Crear enlaces para Render
    enlaces_render = crear_enlaces_render()
    
    # Procesar base de datos
    df, stats = procesar_base_datos()
    
    if df is not None and stats is not None:
        print("\n✅ REFUERZO COMPLETADO EXITOSAMENTE")
        print("=" * 60)
        print(f"📊 Proyectos procesados: {stats['total_proyectos']}")
        print(f"🔗 Enlaces verificados: {stats['enlaces_verificados']}")
        print(f"✅ Enlaces funcionales: {stats['enlaces_funcionales']}")
        print(f"🔧 Enlaces corregidos: {stats['enlaces_corregidos']}")
        print(f"🔄 Enlaces alternativos: {stats['enlaces_alternativos']}")
        print(f"📄 Reporte: REPORTE_VERIFICACION_ENLACES.md")
        print(f"💾 Base corregida: data/proyectos_fortalecidos_corregidos.xlsx")
    else:
        print("\n❌ ERROR EN EL PROCESAMIENTO")
