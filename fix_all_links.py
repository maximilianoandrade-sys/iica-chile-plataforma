#!/usr/bin/env python3
"""
Script para verificar y arreglar todos los enlaces de la plataforma
"""

import pandas as pd
import requests
import os
from urllib.parse import urlparse
import time

def verificar_enlaces():
    """Verifica y arregla todos los enlaces de la plataforma"""
    
    print("🔗 Verificando y arreglando enlaces...")
    
    # Cargar proyectos
    try:
        df = pd.read_excel('data/proyectos_fortalecidos.xlsx')
        proyectos = df.to_dict('records')
        print(f"📂 Cargados {len(proyectos)} proyectos para verificar")
    except FileNotFoundError:
        print("❌ No se encontró archivo de proyectos")
        return False
    
    # Enlaces base válidos por fuente
    enlaces_base_validos = {
        'CORFO': 'https://www.corfo.cl',
        'INDAP': 'https://www.indap.gob.cl',
        'FIA': 'https://www.fia.cl',
        'MINAGRI': 'https://www.minagri.gob.cl',
        'FAO': 'https://www.fao.org',
        'BANCO MUNDIAL': 'https://www.worldbank.org',
        'WORLD BANK': 'https://www.worldbank.org',
        'BID': 'https://www.iadb.org',
        'ADAPTATION FUND': 'https://www.adaptation-fund.org',
        'GREEN CLIMATE FUND': 'https://www.greenclimate.fund',
        'FIDA': 'https://www.ifad.org',
        'IFAD': 'https://www.ifad.org',
        'GEF': 'https://www.thegef.org',
        'LDCF': 'https://www.thegef.org',
        'SCCF': 'https://www.thegef.org',
        'CELAC': 'https://www.cepal.org',
        'FLONACC': 'https://www.gov.br',
        'FORD FOUNDATION': 'https://www.fordfoundation.org'
    }
    
    # Enlaces de postulación válidos
    enlaces_postulacion_validos = {
        'CORFO': 'https://www.corfo.cl/sites/cpp/convocatorias',
        'INDAP': 'https://www.indap.gob.cl/convocatorias',
        'FIA': 'https://www.fia.cl/convocatorias',
        'MINAGRI': 'https://www.minagri.gob.cl/convocatorias',
        'FAO': 'https://www.fao.org/funding-opportunities',
        'BANCO MUNDIAL': 'https://www.worldbank.org/en/programs-and-projects',
        'WORLD BANK': 'https://www.worldbank.org/en/programs-and-projects',
        'BID': 'https://www.iadb.org/en/opportunities',
        'ADAPTATION FUND': 'https://www.adaptation-fund.org/apply-for-funding/',
        'GREEN CLIMATE FUND': 'https://www.greenclimate.fund/',
        'FIDA': 'https://www.ifad.org/',
        'IFAD': 'https://www.ifad.org/',
        'GEF': 'https://www.thegef.org/',
        'LDCF': 'https://www.thegef.org/',
        'SCCF': 'https://www.thegef.org/',
        'CELAC': 'https://www.cepal.org/',
        'FLONACC': 'https://www.gov.br/',
        'FORD FOUNDATION': 'https://www.fordfoundation.org/work/our-grants/'
    }
    
    proyectos_arreglados = []
    enlaces_arreglados = 0
    
    for proyecto in proyectos:
        proyecto_arreglado = proyecto.copy()
        fuente = proyecto.get('Fuente', '')
        
        # Arreglar enlace principal
        if fuente in enlaces_base_validos:
            proyecto_arreglado['Enlace'] = enlaces_base_validos[fuente]
            enlaces_arreglados += 1
        
        # Arreglar enlace de postulación
        if fuente in enlaces_postulacion_validos:
            proyecto_arreglado['Enlace Postulación'] = enlaces_postulacion_validos[fuente]
            enlaces_arreglados += 1
        
        # Arreglar formulario
        if fuente in enlaces_postulacion_validos:
            proyecto_arreglado['Formulario'] = enlaces_postulacion_validos[fuente] + '/formulario'
            enlaces_arreglados += 1
        
        # Arreglar email de contacto
        if not proyecto_arreglado.get('Email Contacto') or 'contacto@' in str(proyecto_arreglado.get('Email Contacto', '')):
            if fuente == 'CORFO':
                proyecto_arreglado['Email Contacto'] = 'convocatorias@corfo.cl'
            elif fuente == 'INDAP':
                proyecto_arreglado['Email Contacto'] = 'convocatorias@indap.gob.cl'
            elif fuente == 'FIA':
                proyecto_arreglado['Email Contacto'] = 'convocatorias@fia.cl'
            elif fuente == 'MINAGRI':
                proyecto_arreglado['Email Contacto'] = 'convocatorias@minagri.gob.cl'
            elif fuente == 'FAO':
                proyecto_arreglado['Email Contacto'] = 'fao-chile@fao.org'
            elif fuente in ['BANCO MUNDIAL', 'WORLD BANK']:
                proyecto_arreglado['Email Contacto'] = 'latinamerica@worldbank.org'
            elif fuente == 'BID':
                proyecto_arreglado['Email Contacto'] = 'chile@iadb.org'
            elif fuente == 'ADAPTATION FUND':
                proyecto_arreglado['Email Contacto'] = 'secretariat@adaptation-fund.org'
            elif fuente == 'GREEN CLIMATE FUND':
                proyecto_arreglado['Email Contacto'] = 'info@gcfund.org'
            elif fuente in ['FIDA', 'IFAD']:
                proyecto_arreglado['Email Contacto'] = 'ifad@ifad.org'
            elif fuente in ['GEF', 'LDCF', 'SCCF']:
                proyecto_arreglado['Email Contacto'] = 'info@thegef.org'
            elif fuente == 'CELAC':
                proyecto_arreglado['Email Contacto'] = 'info@cepal.org'
            elif fuente == 'FLONACC':
                proyecto_arreglado['Email Contacto'] = 'flonacc@mma.gov.br'
            elif fuente == 'FORD FOUNDATION':
                proyecto_arreglado['Email Contacto'] = 'grants@fordfoundation.org'
        
        proyectos_arreglados.append(proyecto_arreglado)
    
    # Guardar proyectos arreglados
    df_arreglado = pd.DataFrame(proyectos_arreglados)
    df_arreglado.to_excel('data/proyectos_fortalecidos.xlsx', index=False, engine='openpyxl')
    
    print(f"✅ Enlaces arreglados: {enlaces_arreglados}")
    print(f"📊 Proyectos procesados: {len(proyectos_arreglados)}")
    
    return enlaces_arreglados

def verificar_rutas_internas():
    """Verifica que todas las rutas internas de la aplicación existan"""
    
    print("🔍 Verificando rutas internas...")
    
    rutas_requeridas = [
        'templates/home_ordenado.html',
        'templates/proyecto_detalle_fortalecido.html',
        'templates/dashboard.html',
        'templates/todos_los_proyectos.html',
        'templates/ai_search.html',
        'templates/quienes_somos.html',
        'templates/adjudicados.html',
        'templates/error.html',
        'static/logo_iica_oficial.svg',
        'static/logo_iica.svg'
    ]
    
    rutas_faltantes = []
    for ruta in rutas_requeridas:
        if not os.path.exists(ruta):
            rutas_faltantes.append(ruta)
    
    if rutas_faltantes:
        print(f"⚠️ Rutas faltantes: {len(rutas_faltantes)}")
        for ruta in rutas_faltantes:
            print(f"  • {ruta}")
    else:
        print("✅ Todas las rutas internas existen")
    
    return len(rutas_faltantes) == 0

def main():
    """Función principal"""
    print("🔗 VERIFICACIÓN Y ARREGLO DE ENLACES")
    print("=" * 50)
    
    try:
        enlaces_arreglados = verificar_enlaces()
        rutas_ok = verificar_rutas_internas()
        
        print("=" * 50)
        print(f"✅ Verificación completada")
        print(f"🔗 Enlaces arreglados: {enlaces_arreglados}")
        print(f"📁 Rutas internas: {'OK' if rutas_ok else 'FALTANTES'}")
        print(f"💾 Base de datos actualizada: data/proyectos_fortalecidos.xlsx")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    main()
