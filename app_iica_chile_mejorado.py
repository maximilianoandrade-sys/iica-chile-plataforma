#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Plataforma IICA Chile - Versión Mejorada
Sistema optimizado de gestión de fondos con flujo de usuario simplificado
Desarrollado para IICA Chile - Instituto Interamericano de Cooperación para la Agricultura
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, send_file, get_flashed_messages
import pandas as pd
import json
import os
import requests
from datetime import datetime, timedelta
import logging
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import re
from werkzeug.utils import secure_filename
import hashlib

# Configuración de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = 'iica_chile_2025_mejorado_secret_key'

# Configuración de archivos y directorios
UPLOAD_FOLDER = 'uploads'
EXPORT_FOLDER = 'exports'
DATA_FOLDER = 'data'
STATIC_FOLDER = 'static'
LOGO_FOLDER = os.path.join(STATIC_FOLDER, 'logos')

# Crear directorios necesarios
for folder in [UPLOAD_FOLDER, EXPORT_FOLDER, DATA_FOLDER, STATIC_FOLDER, LOGO_FOLDER]:
    os.makedirs(folder, exist_ok=True)

# Archivos de configuración
FONDOS_FILE = os.path.join(DATA_FOLDER, 'fondos_iica_chile_mejorado.json')
CONFIG_FILE = os.path.join(DATA_FOLDER, 'config_iica_chile_mejorado.json')

class IICAChilePlatformMejorado:
    def __init__(self):
        self.fondos_data = []
        self.config = self.cargar_configuracion()
        self.cargar_datos()
        self.descargar_logo_iica()
        
    def cargar_configuracion(self):
        """Cargar configuración de la plataforma mejorada"""
        default_config = {
            "nombre_plataforma": "IICA Chile - Portal de Fondos",
            "version": "4.0 Mejorado",
            "institucion": "Instituto Interamericano de Cooperación para la Agricultura - Chile",
            "ultima_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "mision": "Facilitar el acceso a oportunidades de financiamiento para el desarrollo agrícola y rural sostenible en Chile y América Latina",
            "vision": "Ser la plataforma líder en detección automatizada de fondos para el sector agrícola y rural en la región",
            "datos_institucionales": {
                "nombre": "Instituto Interamericano de Cooperación para la Agricultura",
                "sigla": "IICA",
                "pais": "Chile",
                "direccion": "Av. Libertador Bernardo O'Higgins 1234, Santiago, Chile",
                "telefono": "+56 2 2345 6789",
                "email": "info@iica.cl",
                "sitio_web": "https://iica.int/es/countries/chile-es/"
            }
        }
        
        if os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except:
                pass
        
        self.guardar_configuracion(default_config)
        return default_config
    
    def descargar_logo_iica(self):
        """Descargar logo oficial del IICA desde internet"""
        logo_path = os.path.join(LOGO_FOLDER, 'logo_iica_oficial.svg')
        
        if not os.path.exists(logo_path):
            try:
                # URLs del logo oficial del IICA
                logo_urls = [
                    'https://iica.int/wp-content/themes/iica/assets/images/logo.svg',
                    'https://iica.int/wp-content/uploads/2021/03/logo-iica.svg',
                    'https://iica.int/assets/images/logo-iica.svg'
                ]
                
                for url in logo_urls:
                    try:
                        response = requests.get(url, timeout=10)
                        if response.status_code == 200:
                            with open(logo_path, 'wb') as f:
                                f.write(response.content)
                            logger.info(f"✅ Logo IICA descargado desde: {url}")
                            break
                    except:
                        continue
                
                # Si no se puede descargar, crear un logo SVG básico
                if not os.path.exists(logo_path):
                    self.crear_logo_iica_basico(logo_path)
                    
            except Exception as e:
                logger.error(f"❌ Error descargando logo IICA: {e}")
                self.crear_logo_iica_basico(logo_path)
    
    def crear_logo_iica_basico(self, logo_path):
        """Crear logo SVG básico del IICA"""
        logo_svg = '''<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60" width="200" height="60">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#0056b3;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#28a745;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="200" height="60" fill="url(#grad1)" rx="5"/>
  <text x="100" y="25" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle" fill="white">IICA</text>
  <text x="100" y="45" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="white">CHILE</text>
</svg>'''
        
        with open(logo_path, 'w', encoding='utf-8') as f:
            f.write(logo_svg)
        logger.info("✅ Logo IICA básico creado")
    
    def cargar_datos(self):
        """Cargar todos los datos de la plataforma"""
        if os.path.exists(FONDOS_FILE):
            try:
                with open(FONDOS_FILE, 'r', encoding='utf-8') as f:
                    self.fondos_data = json.load(f)
            except:
                self.fondos_data = []
        
        # Si no hay datos, cargar fondos iniciales
        if not self.fondos_data:
            self.fondos_data = self.obtener_fondos_iniciales()
            self.guardar_datos()
    
    def guardar_datos(self):
        """Guardar todos los datos"""
        with open(FONDOS_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.fondos_data, f, ensure_ascii=False, indent=2)
    
    def guardar_configuracion(self, config):
        """Guardar configuración"""
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
    
    def obtener_fondos_iniciales(self):
        """Obtener fondos iniciales de la plataforma"""
        return [
            # FONDOS INTERNACIONALES
            {
                "id": "GEF-001",
                "nombre": "Fondo para el Marco Mundial de Biodiversidad (GBFF)",
                "organizacion": "Fondo para el Medio Ambiente Mundial (GEF)",
                "tipo": "Internacional",
                "pais": "Internacional",
                "monto": "USD 5,000,000",
                "fecha_cierre": "2025-06-30",
                "estado": "Abierto",
                "area": "Biodiversidad",
                "categoria": "Agricultura",
                "descripcion": "Fondo establecido en 2023 para apoyar la implementación del Marco Mundial para la Biodiversidad de Kunming-Montreal. Se centra en fortalecer la gestión, planificación, políticas, gobernanza y financiación de la biodiversidad a nivel nacional.",
                "requisitos": "Gobiernos nacionales, organizaciones internacionales, ONGs ambientales",
                "enlace": "https://www.finanzassostenibles.hacienda.gob.mx/es/finanzassostenibles/fondos",
                "contacto": "info@gef.org",
                "tipo_financiamiento": "Grant",
                "duracion": "36 meses",
                "beneficiarios": "Países en desarrollo",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Propuesta de proyecto completa",
                    "Estudio de factibilidad técnica",
                    "Plan de implementación",
                    "Presupuesto detallado",
                    "Cronograma de actividades",
                    "Estudio de impacto ambiental"
                ],
                "formularios": [
                    "https://www.gef.org/formularios/gbff",
                    "https://www.gef.org/documentos/guia-postulacion"
                ],
                "fuente": "GEF",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "id": "BID-001",
                "nombre": "Programa de Desarrollo Rural Sostenible BID",
                "organizacion": "Banco Interamericano de Desarrollo",
                "tipo": "Internacional",
                "pais": "Internacional",
                "monto": "USD 5,000,000",
                "fecha_cierre": "2025-06-30",
                "estado": "Abierto",
                "area": "Desarrollo Rural",
                "categoria": "Agricultura",
                "descripcion": "Programa de desarrollo rural sostenible en América Latina con enfoque en agricultura familiar",
                "requisitos": "Gobiernos, ONGs, organizaciones internacionales, consorcios",
                "enlace": "https://www.iadb.org/es/desarrollo-rural",
                "contacto": "rural@iadb.org",
                "tipo_financiamiento": "Préstamo",
                "duracion": "48 meses",
                "beneficiarios": "Países de América Latina y el Caribe",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Propuesta de proyecto completa",
                    "Estudio de factibilidad técnica",
                    "Plan de implementación",
                    "Presupuesto detallado",
                    "Cronograma de actividades",
                    "Estudio de impacto ambiental"
                ],
                "formularios": [
                    "https://www.iadb.org/es/formularios/desarrollo-rural",
                    "https://www.iadb.org/es/documentos/guia-postulacion"
                ],
                "fuente": "BID",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "id": "FAO-001",
                "nombre": "Programa de Seguridad Alimentaria y Nutrición FAO",
                "organizacion": "FAO - Organización de las Naciones Unidas",
                "tipo": "Internacional",
                "pais": "Internacional",
                "monto": "USD 2,500,000",
                "fecha_cierre": "2025-04-30",
                "estado": "Abierto",
                "area": "Seguridad Alimentaria",
                "categoria": "Agricultura",
                "descripcion": "Programa para mejorar la seguridad alimentaria y nutrición en América Latina",
                "requisitos": "Organizaciones gubernamentales, ONGs, instituciones de investigación",
                "enlace": "https://www.fao.org/seguridad-alimentaria",
                "contacto": "seguridad@fao.org",
                "tipo_financiamiento": "Grant",
                "duracion": "24 meses",
                "beneficiarios": "Países de América Latina",
                "prioridad": "Media",
                "documentos_requeridos": [
                    "Propuesta técnica",
                    "Presupuesto detallado",
                    "Cronograma de actividades",
                    "Plan de monitoreo y evaluación"
                ],
                "formularios": [
                    "https://www.fao.org/formularios/seguridad-alimentaria",
                    "https://www.fao.org/documentos/guia-postulacion"
                ],
                "fuente": "FAO",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "id": "FONDO-VERDE-001",
                "nombre": "Fondo Verde del Clima - Adaptación",
                "organizacion": "Fondo Verde del Clima",
                "tipo": "Internacional",
                "pais": "Internacional",
                "monto": "USD 10,000,000",
                "fecha_cierre": "2025-08-31",
                "estado": "Abierto",
                "area": "Cambio Climático",
                "categoria": "Agricultura",
                "descripcion": "Fondo para proyectos de adaptación al cambio climático en el sector agrícola",
                "requisitos": "Gobiernos, instituciones financieras, organizaciones internacionales",
                "enlace": "https://www.greenclimate.fund/adaptation",
                "contacto": "adaptation@gcfund.org",
                "tipo_financiamiento": "Grant",
                "duracion": "60 meses",
                "beneficiarios": "Países en desarrollo",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Propuesta de adaptación",
                    "Estudio de vulnerabilidad",
                    "Plan de implementación",
                    "Presupuesto detallado"
                ],
                "formularios": [
                    "https://www.gcfund.org/formularios/adaptacion",
                    "https://www.gcfund.org/documentos/guia-postulacion"
                ],
                "fuente": "Fondo Verde",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "id": "UE-001",
                "nombre": "Programa Horizonte Europa - Agricultura",
                "organizacion": "Unión Europea",
                "tipo": "Internacional",
                "pais": "Internacional",
                "monto": "EUR 3,000,000",
                "fecha_cierre": "2025-05-15",
                "estado": "Abierto",
                "area": "Innovación Tecnológica",
                "categoria": "Agricultura",
                "descripcion": "Programa de investigación e innovación en agricultura sostenible",
                "requisitos": "Consorcios de investigación, universidades, empresas",
                "enlace": "https://ec.europa.eu/info/horizon-europe",
                "contacto": "horizon@ec.europa.eu",
                "tipo_financiamiento": "Grant",
                "duracion": "36 meses",
                "beneficiarios": "Organizaciones de investigación",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Propuesta de investigación",
                    "Plan de trabajo",
                    "Presupuesto detallado",
                    "Cronograma de actividades"
                ],
                "formularios": [
                    "https://ec.europa.eu/formularios/horizon-europa",
                    "https://ec.europa.eu/documentos/guia-postulacion"
                ],
                "fuente": "UE",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            
            # FONDOS NACIONALES
            {
                "id": "CORFO-001",
                "nombre": "Programa de Innovación Agraria CORFO",
                "organizacion": "CORFO - Corporación de Fomento de la Producción",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 500,000,000",
                "fecha_cierre": "2025-03-31",
                "estado": "Abierto",
                "area": "Innovación Tecnológica",
                "categoria": "Agricultura",
                "descripcion": "Programa de apoyo a la innovación en el sector agrario chileno con enfoque en tecnología y sostenibilidad",
                "requisitos": "Empresas agrícolas, cooperativas, centros de investigación, universidades",
                "enlace": "https://www.corfo.cl/sites/cpp/innovacion/innovacion-agraria",
                "contacto": "innovacion@corfo.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "24 meses",
                "beneficiarios": "Sector agrícola chileno",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Formulario de postulación CORFO",
                    "Plan de negocio detallado",
                    "Presupuesto desglosado",
                    "Cronograma de actividades",
                    "Estudio de mercado"
                ],
                "formularios": [
                    "https://www.corfo.cl/formularios/innovacion-agraria",
                    "https://www.corfo.cl/documentos/guia-postulacion"
                ],
                "fuente": "CORFO Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "id": "INDAP-001",
                "nombre": "Fondo de Desarrollo Rural Sostenible INDAP",
                "organizacion": "INDAP - Instituto de Desarrollo Agropecuario",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 200,000,000",
                "fecha_cierre": "2025-04-15",
                "estado": "Abierto",
                "area": "Desarrollo Rural",
                "categoria": "Agricultura",
                "descripcion": "Fondo para el desarrollo de proyectos rurales sostenibles con enfoque en comunidades locales",
                "requisitos": "Organizaciones rurales, cooperativas, pequeños productores, comunidades indígenas",
                "enlace": "https://www.indap.gob.cl/desarrollo-rural",
                "contacto": "desarrollo@indap.gob.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "18 meses",
                "beneficiarios": "Comunidades rurales de Chile",
                "prioridad": "Media",
                "documentos_requeridos": [
                    "Proyecto técnico detallado",
                    "Estudio de mercado y demanda",
                    "Plan de sostenibilidad",
                    "Cronograma de implementación",
                    "Presupuesto justificado"
                ],
                "formularios": [
                    "https://www.indap.gob.cl/formularios/desarrollo-rural",
                    "https://www.indap.gob.cl/documentos/guia-proyectos"
                ],
                "fuente": "INDAP Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "id": "FIA-001",
                "nombre": "Programa de Innovación Agroalimentaria FIA",
                "organizacion": "FIA - Fundación para la Innovación Agraria",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 300,000,000",
                "fecha_cierre": "2025-05-30",
                "estado": "Abierto",
                "area": "Innovación Tecnológica",
                "categoria": "Agricultura",
                "descripcion": "Programa de innovación para el sector agroalimentario con énfasis en tecnología y competitividad",
                "requisitos": "Empresas, centros de investigación, universidades, consorcios tecnológicos",
                "enlace": "https://www.fia.cl/programas/innovacion",
                "contacto": "innovacion@fia.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "36 meses",
                "beneficiarios": "Sector agroalimentario chileno",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Propuesta técnica de innovación",
                    "Plan de trabajo detallado",
                    "Presupuesto justificado",
                    "Cronograma de actividades",
                    "Estudio de impacto"
                ],
                "formularios": [
                    "https://www.fia.cl/formularios/innovacion",
                    "https://www.fia.cl/documentos/guia-postulacion"
                ],
                "fuente": "FIA Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "id": "MERCADO-PUBLICO-001",
                "nombre": "Licitación Pública - Servicios Agrícolas",
                "organizacion": "Mercado Público Chile",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 150,000,000",
                "fecha_cierre": "2025-03-15",
                "estado": "Abierto",
                "area": "Desarrollo Rural",
                "categoria": "Agricultura",
                "descripcion": "Licitación para servicios de consultoría en desarrollo rural",
                "requisitos": "Empresas consultoras, profesionales independientes",
                "enlace": "https://www.mercadopublico.cl/licitacion/12345",
                "contacto": "licitaciones@mercadopublico.cl",
                "tipo_financiamiento": "Contrato",
                "duracion": "12 meses",
                "beneficiarios": "Sector público",
                "prioridad": "Media",
                "documentos_requeridos": [
                    "Propuesta técnica",
                    "Presupuesto detallado",
                    "Certificados y acreditaciones",
                    "Referencias comerciales"
                ],
                "formularios": [
                    "https://www.mercadopublico.cl/formularios/licitacion-12345",
                    "https://www.mercadopublico.cl/documentos/bases-licitacion"
                ],
                "fuente": "Mercado Público Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        ]
    
    def obtener_fondos_abiertos(self):
        """Obtener solo fondos abiertos"""
        return [f for f in self.fondos_data if f.get('estado') == 'Abierto']
    
    def obtener_fondos_por_tipo(self, tipo):
        """Obtener fondos por tipo (Nacional/Internacional)"""
        return [f for f in self.fondos_data if f.get('tipo') == tipo]
    
    def obtener_fondos_abiertos_por_tipo(self, tipo):
        """Obtener fondos abiertos por tipo"""
        return [f for f in self.fondos_data if f.get('estado') == 'Abierto' and f.get('tipo') == tipo]
    
    def buscar_fondos(self, query="", tipo="", area="", estado=""):
        """Búsqueda de fondos con filtros"""
        resultados = self.fondos_data.copy()
        
        if query:
            resultados = [f for f in resultados if 
                         query.lower() in f.get('nombre', '').lower() or
                         query.lower() in f.get('descripcion', '').lower() or
                         query.lower() in f.get('organizacion', '').lower()]
        
        if tipo:
            resultados = [f for f in resultados if f.get('tipo') == tipo]
        
        if area:
            resultados = [f for f in resultados if f.get('area') == area]
        
        if estado:
            resultados = [f for f in resultados if f.get('estado') == estado]
        
        return resultados
    
    def agregar_fondo(self, datos_fondo):
        """Agregar nuevo fondo a la base de datos"""
        try:
            # Generar ID único
            nuevo_id = f"{datos_fondo['fuente'].upper().replace(' ', '-')}-{len(self.fondos_data) + 1:03d}"
            
            # Crear estructura del fondo
            nuevo_fondo = {
                "id": nuevo_id,
                "nombre": datos_fondo['nombre'],
                "organizacion": datos_fondo['organizacion'],
                "tipo": datos_fondo['tipo'],
                "pais": datos_fondo.get('pais', 'Chile' if datos_fondo['tipo'] == 'Nacional' else 'Internacional'),
                "monto": datos_fondo['monto'],
                "fecha_cierre": datos_fondo['fecha_cierre'],
                "estado": datos_fondo['estado'],
                "area": datos_fondo['area'],
                "categoria": datos_fondo.get('categoria', 'Agricultura'),
                "descripcion": datos_fondo['descripcion'],
                "requisitos": datos_fondo.get('requisitos', 'Consultar con la organización'),
                "enlace": datos_fondo.get('enlace', ''),
                "contacto": datos_fondo.get('contacto', ''),
                "tipo_financiamiento": datos_fondo.get('tipo_financiamiento', 'Subsidio'),
                "duracion": datos_fondo.get('duracion', '12 meses'),
                "beneficiarios": datos_fondo.get('beneficiarios', 'Sector agrícola'),
                "prioridad": datos_fondo.get('prioridad', 'Media'),
                "documentos_requeridos": datos_fondo.get('documentos_requeridos', []),
                "formularios": datos_fondo.get('formularios', []),
                "fuente": datos_fondo['fuente'],
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            
            # Agregar a la lista
            self.fondos_data.append(nuevo_fondo)
            
            # Guardar datos
            self.guardar_datos()
            
            logger.info(f"✅ Nuevo fondo agregado: {nuevo_fondo['nombre']}")
            return True, "Fondo agregado exitosamente"
            
        except Exception as e:
            logger.error(f"❌ Error agregando fondo: {e}")
            return False, f"Error agregando fondo: {str(e)}"
    
    def exportar_excel(self):
        """Exportar datos a Excel"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"fondos_iica_chile_{timestamp}.xlsx"
        filepath = os.path.join(EXPORT_FOLDER, filename)
        
        # Crear Excel con múltiples hojas
        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            # Hoja 1: Todos los fondos
            df_todos = pd.DataFrame(self.fondos_data)
            df_todos.to_excel(writer, sheet_name='Todos los Fondos', index=False)
            
            # Hoja 2: Fondos abiertos
            fondos_abiertos = [f for f in self.fondos_data if f.get('estado') == 'Abierto']
            if fondos_abiertos:
                df_abiertos = pd.DataFrame(fondos_abiertos)
                df_abiertos.to_excel(writer, sheet_name='Fondos Abiertos', index=False)
            
            # Hoja 3: Fondos nacionales
            fondos_nacionales = [f for f in self.fondos_data if f.get('tipo') == 'Nacional']
            if fondos_nacionales:
                df_nacionales = pd.DataFrame(fondos_nacionales)
                df_nacionales.to_excel(writer, sheet_name='Fondos Nacionales', index=False)
            
            # Hoja 4: Fondos internacionales
            fondos_internacionales = [f for f in self.fondos_data if f.get('tipo') == 'Internacional']
            if fondos_internacionales:
                df_internacionales = pd.DataFrame(fondos_internacionales)
                df_internacionales.to_excel(writer, sheet_name='Fondos Internacionales', index=False)
        
        return filepath, filename

# Inicializar plataforma
platform = IICAChilePlatformMejorado()

# Context processor para datos globales
@app.context_processor
def inject_global_data():
    return dict(
        flash_messages=get_flashed_messages(),
        config=platform.config,
        fondos_abiertos_nacionales=platform.obtener_fondos_abiertos_por_tipo('Nacional')[:6],
        fondos_abiertos_internacionales=platform.obtener_fondos_abiertos_por_tipo('Internacional')[:6]
    )

# Rutas principales
@app.route('/')
def index():
    """Página principal con FONDOS ABIERTOS como elemento principal"""
    fondos_abiertos_nacionales = platform.obtener_fondos_abiertos_por_tipo('Nacional')
    fondos_abiertos_internacionales = platform.obtener_fondos_abiertos_por_tipo('Internacional')
    
    return render_template('index_mejorado.html', 
                         fondos_abiertos_nacionales=fondos_abiertos_nacionales,
                         fondos_abiertos_internacionales=fondos_abiertos_internacionales)

@app.route('/fondos-disponibles')
def fondos_disponibles():
    """Página de todos los fondos disponibles"""
    query = request.args.get('q', '')
    tipo = request.args.get('tipo', '')
    area = request.args.get('area', '')
    estado = request.args.get('estado', '')
    
    fondos_filtrados = platform.buscar_fondos(query, tipo, area, estado)
    
    return render_template('fondos_disponibles.html', 
                         fondos=fondos_filtrados,
                         query=query,
                         tipo=tipo,
                         area=area,
                         estado=estado)

@app.route('/fondo/<fondo_id>')
def detalle_fondo(fondo_id):
    """Detalle completo de un fondo con documentos integrados"""
    fondo = next((f for f in platform.fondos_data if f['id'] == fondo_id), None)
    
    if not fondo:
        flash('Fondo no encontrado', 'error')
        return redirect(url_for('index'))
    
    return render_template('detalle_fondo_mejorado.html', fondo=fondo)

@app.route('/agregar-fondo', methods=['GET', 'POST'])
def agregar_fondo():
    """Formulario para agregar nuevo fondo"""
    if request.method == 'POST':
        datos_fondo = {
            'nombre': request.form['nombre'],
            'organizacion': request.form['organizacion'],
            'tipo': request.form['tipo'],
            'monto': request.form['monto'],
            'fecha_cierre': request.form['fecha_cierre'],
            'estado': request.form['estado'],
            'area': request.form['area'],
            'descripcion': request.form['descripcion'],
            'requisitos': request.form.get('requisitos', ''),
            'enlace': request.form.get('enlace', ''),
            'contacto': request.form.get('contacto', ''),
            'tipo_financiamiento': request.form.get('tipo_financiamiento', 'Subsidio'),
            'duracion': request.form.get('duracion', '12 meses'),
            'beneficiarios': request.form.get('beneficiarios', 'Sector agrícola'),
            'prioridad': request.form.get('prioridad', 'Media'),
            'fuente': request.form['fuente']
        }
        
        # Procesar documentos requeridos
        documentos = request.form.get('documentos_requeridos', '')
        if documentos:
            datos_fondo['documentos_requeridos'] = [doc.strip() for doc in documentos.split('\n') if doc.strip()]
        else:
            datos_fondo['documentos_requeridos'] = []
        
        # Procesar formularios
        formularios = request.form.get('formularios', '')
        if formularios:
            datos_fondo['formularios'] = [form.strip() for form in formularios.split('\n') if form.strip()]
        else:
            datos_fondo['formularios'] = []
        
        success, message = platform.agregar_fondo(datos_fondo)
        
        if success:
            flash(message, 'success')
            return redirect(url_for('index'))
        else:
            flash(message, 'error')
    
    return render_template('agregar_fondo.html')

@app.route('/exportar')
def exportar():
    """Exportar datos a Excel"""
    try:
        filepath, filename = platform.exportar_excel()
        return send_file(filepath, as_attachment=True, download_name=filename)
    except Exception as e:
        flash(f'Error al exportar: {str(e)}', 'error')
        return redirect(url_for('index'))

# APIs
@app.route('/api/fondos')
def api_fondos():
    """API para obtener fondos con filtros"""
    query = request.args.get('q', '')
    tipo = request.args.get('tipo', '')
    area = request.args.get('area', '')
    estado = request.args.get('estado', '')
    
    fondos_filtrados = platform.buscar_fondos(query, tipo, area, estado)
    
    return jsonify({
        'total': len(fondos_filtrados),
        'fondos': fondos_filtrados
    })

@app.route('/api/estadisticas')
def api_estadisticas():
    """API para estadísticas"""
    fondos_abiertos = len([f for f in platform.fondos_data if f.get('estado') == 'Abierto'])
    fondos_nacionales = len([f for f in platform.fondos_data if f.get('tipo') == 'Nacional'])
    fondos_internacionales = len([f for f in platform.fondos_data if f.get('tipo') == 'Internacional'])
    fondos_alta_prioridad = len([f for f in platform.fondos_data if f.get('prioridad') == 'Alta'])
    
    return jsonify({
        'fondos_abiertos': fondos_abiertos,
        'fondos_nacionales': fondos_nacionales,
        'fondos_internacionales': fondos_internacionales,
        'fondos_alta_prioridad': fondos_alta_prioridad,
        'total_fondos': len(platform.fondos_data)
    })

if __name__ == '__main__':
    print("🚀 Iniciando Plataforma IICA Chile Mejorada...")
    print("✅ Sistema optimizado de financiamiento cargado")
    print("🌐 Accede a: http://127.0.0.1:5004")
    
    app.run(debug=True, host='0.0.0.0', port=5004)
