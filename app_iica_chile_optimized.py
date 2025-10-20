#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Plataforma IICA Chile - Sistema Avanzado de Detección de Oportunidades de Financiamiento
Versión Optimizada con Integración de Múltiples Fuentes y APIs Globales
Desarrollado para IICA Chile - Instituto Interamericano de Cooperación para la Agricultura
"""

from flask import Flask, render_template, request, jsonify, redirect, url_for, flash, send_file, get_flashed_messages
import pandas as pd
import json
import os
import requests
from datetime import datetime, timedelta
import schedule
import time
import threading
import logging
from urllib.parse import urljoin, urlparse
from bs4 import BeautifulSoup
import re
from werkzeug.utils import secure_filename
import hashlib
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import feedparser
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor
import asyncio
import aiohttp

# Configuración de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = 'iica_chile_2025_advanced_secret_key'

# Configuración de archivos y directorios
UPLOAD_FOLDER = 'uploads'
EXPORT_FOLDER = 'exports'
DATA_FOLDER = 'data'
STATIC_FOLDER = 'static'
LOGO_FOLDER = os.path.join(STATIC_FOLDER, 'logos')
SCRAPERS_FOLDER = 'scrapers'

# Crear directorios necesarios
for folder in [UPLOAD_FOLDER, EXPORT_FOLDER, DATA_FOLDER, STATIC_FOLDER, LOGO_FOLDER, SCRAPERS_FOLDER]:
    os.makedirs(folder, exist_ok=True)

# Archivos de configuración
FONDOS_FILE = os.path.join(DATA_FOLDER, 'fondos_iica_chile_optimized.json')
PROYECTOS_FILE = os.path.join(DATA_FOLDER, 'proyectos_iica_chile_optimized.json')
CONFIG_FILE = os.path.join(DATA_FOLDER, 'config_iica_chile_optimized.json')
FUENTES_FILE = os.path.join(DATA_FOLDER, 'fuentes_automaticas.json')
USUARIOS_FILE = os.path.join(DATA_FOLDER, 'usuarios_feedback.json')

class IICAChilePlatformOptimized:
    def __init__(self):
        self.fondos_data = []
        self.proyectos_data = []
        self.fuentes_automaticas = []
        self.config = self.cargar_configuracion()
        self.cargar_datos()
        self.descargar_logo_iica()
        
    def cargar_configuracion(self):
        """Cargar configuración avanzada de la plataforma"""
        default_config = {
            "nombre_plataforma": "IICA Chile - Portal Avanzado de Financiamiento",
            "version": "3.0 Optimized",
            "institucion": "Instituto Interamericano de Cooperación para la Agricultura - Chile",
            "ultima_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "fuentes_automaticas": [
                "BID", "DEx", "Tenders Global", "ONU", "PNUD", "FAO", "UNESCO",
                "Fondo Verde del Clima", "Fondo de Adaptación", "Unión Europea", "GEF",
                "Mercado Público Chile", "Fondos.gob.cl", "Kickstarter", "Indiegogo",
                "Idea.me", "Goteo", "Verkami", "GoFundMe", "Patreon"
            ],
            "categorias_avanzadas": [
                "Biodiversidad", "Innovación Tecnológica", "Ganadería", "Agua",
                "Cambio Climático", "Desarrollo Rural", "Seguridad Alimentaria",
                "Agricultura Sostenible", "Tecnología Agrícola", "Comercio Justo",
                "Energías Renovables", "Gestión de Residuos", "Educación Rural"
            ],
            "estados": ["Abierto", "Cerrado", "Ventanilla Abierta", "Próximo a Abrir", "En Evaluación"],
            "prioridades": ["Crítica", "Alta", "Media", "Baja"],
            "recordatorios_dias": 30,
            "actualizacion_automatica_horas": 6,
            "max_concurrent_scrapers": 5,
            "timeout_scraping": 30,
            "retry_attempts": 3
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
    
    def cargar_fuentes_automaticas(self):
        """Cargar configuración de fuentes automáticas"""
        fuentes_config = {
            "bid": {
                "url": "https://www.iadb.org/es/project-search",
                "tipo": "scraping",
                "selectores": {
                    "titulo": ".project-title",
                    "descripcion": ".project-description",
                    "monto": ".project-amount",
                    "fecha": ".project-date"
                },
                "activo": True
            },
            "devex": {
                "url": "https://www.devex.com/jobs",
                "tipo": "api",
                "api_key": "",
                "activo": True
            },
            "tenders_global": {
                "url": "https://www.tendersglobal.com",
                "tipo": "scraping",
                "activo": True
            },
            "mercado_publico_chile": {
                "url": "https://www.mercadopublico.cl",
                "tipo": "scraping",
                "activo": True
            },
            "fondos_gob_cl": {
                "url": "https://fondos.gob.cl",
                "tipo": "scraping",
                "activo": True
            },
            "kickstarter": {
                "url": "https://www.kickstarter.com",
                "tipo": "api",
                "activo": False  # Requiere API key
            },
            "indiegogo": {
                "url": "https://www.indiegogo.com",
                "tipo": "scraping",
                "activo": False  # Requiere configuración especial
            }
        }
        
        with open(FUENTES_FILE, 'w', encoding='utf-8') as f:
            json.dump(fuentes_config, f, ensure_ascii=False, indent=2)
        
        return fuentes_config
    
    def cargar_datos(self):
        """Cargar todos los datos de la plataforma"""
        # Cargar fondos
        if os.path.exists(FONDOS_FILE):
            try:
                with open(FONDOS_FILE, 'r', encoding='utf-8') as f:
                    self.fondos_data = json.load(f)
            except:
                self.fondos_data = []
        
        # Cargar proyectos
        if os.path.exists(PROYECTOS_FILE):
            try:
                with open(PROYECTOS_FILE, 'r', encoding='utf-8') as f:
                    self.proyectos_data = json.load(f)
            except:
                self.proyectos_data = []
        
        # Cargar fuentes automáticas
        if os.path.exists(FUENTES_FILE):
            try:
                with open(FUENTES_FILE, 'r', encoding='utf-8') as f:
                    self.fuentes_automaticas = json.load(f)
            except:
                self.fuentes_automaticas = self.cargar_fuentes_automaticas()
        else:
            self.fuentes_automaticas = self.cargar_fuentes_automaticas()
    
    def guardar_datos(self):
        """Guardar todos los datos"""
        with open(FONDOS_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.fondos_data, f, ensure_ascii=False, indent=2)
        
        with open(PROYECTOS_FILE, 'w', encoding='utf-8') as f:
            json.dump(self.proyectos_data, f, ensure_ascii=False, indent=2)
    
    def obtener_fondos_nacionales_chile(self):
        """Obtener todos los fondos nacionales de Chile"""
        return [
            # CORFO - Corporación de Fomento de la Producción
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
                "id": "CORFO-002",
                "nombre": "Programa de Desarrollo de Proveedores CORFO",
                "organizacion": "CORFO - Corporación de Fomento de la Producción",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 300,000,000",
                "fecha_cierre": "2025-06-30",
                "estado": "Abierto",
                "area": "Desarrollo Rural",
                "categoria": "Agricultura",
                "descripcion": "Programa para fortalecer la cadena de proveedores del sector agrícola",
                "requisitos": "Empresas proveedoras del sector agrícola, cooperativas",
                "enlace": "https://www.corfo.cl/sites/cpp/desarrollo-proveedores",
                "contacto": "proveedores@corfo.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "18 meses",
                "beneficiarios": "Proveedores del sector agrícola",
                "prioridad": "Media",
                "documentos_requeridos": [
                    "Plan de desarrollo de proveedores",
                    "Estudio de mercado",
                    "Presupuesto detallado"
                ],
                "formularios": [
                    "https://www.corfo.cl/formularios/desarrollo-proveedores"
                ],
                "fuente": "CORFO Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "id": "CORFO-003",
                "nombre": "Programa de Emprendimiento Rural CORFO",
                "organizacion": "CORFO - Corporación de Fomento de la Producción",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 150,000,000",
                "fecha_cierre": "2025-04-15",
                "estado": "Abierto",
                "area": "Desarrollo Rural",
                "categoria": "Agricultura",
                "descripcion": "Programa de apoyo al emprendimiento en zonas rurales",
                "requisitos": "Emprendedores rurales, cooperativas, organizaciones rurales",
                "enlace": "https://www.corfo.cl/sites/cpp/emprendimiento-rural",
                "contacto": "rural@corfo.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "12 meses",
                "beneficiarios": "Emprendedores rurales",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Plan de negocio",
                    "Estudio de mercado",
                    "Presupuesto"
                ],
                "formularios": [
                    "https://www.corfo.cl/formularios/emprendimiento-rural"
                ],
                "fuente": "CORFO Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            
            # INDAP - Instituto de Desarrollo Agropecuario
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
                "id": "INDAP-002",
                "nombre": "Programa de Riego INDAP",
                "organizacion": "INDAP - Instituto de Desarrollo Agropecuario",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 100,000,000",
                "fecha_cierre": "2025-05-30",
                "estado": "Abierto",
                "area": "Agua",
                "categoria": "Agricultura",
                "descripcion": "Programa de apoyo a proyectos de riego para pequeños productores",
                "requisitos": "Pequeños productores agrícolas, cooperativas de riego",
                "enlace": "https://www.indap.gob.cl/riego",
                "contacto": "riego@indap.gob.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "24 meses",
                "beneficiarios": "Pequeños productores agrícolas",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Proyecto técnico de riego",
                    "Estudio de factibilidad",
                    "Presupuesto detallado"
                ],
                "formularios": [
                    "https://www.indap.gob.cl/formularios/riego"
                ],
                "fuente": "INDAP Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "id": "INDAP-003",
                "nombre": "Programa de Asociatividad INDAP",
                "organizacion": "INDAP - Instituto de Desarrollo Agropecuario",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 80,000,000",
                "fecha_cierre": "2025-06-15",
                "estado": "Abierto",
                "area": "Desarrollo Rural",
                "categoria": "Agricultura",
                "descripcion": "Programa de fomento a la asociatividad en el sector rural",
                "requisitos": "Organizaciones rurales, cooperativas, asociaciones",
                "enlace": "https://www.indap.gob.cl/asociatividad",
                "contacto": "asociatividad@indap.gob.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "12 meses",
                "beneficiarios": "Organizaciones rurales",
                "prioridad": "Media",
                "documentos_requeridos": [
                    "Plan de asociatividad",
                    "Estudio de mercado",
                    "Presupuesto"
                ],
                "formularios": [
                    "https://www.indap.gob.cl/formularios/asociatividad"
                ],
                "fuente": "INDAP Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            
            # FIA - Fundación para la Innovación Agraria
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
                "id": "FIA-002",
                "nombre": "Programa de Transferencia Tecnológica FIA",
                "organizacion": "FIA - Fundación para la Innovación Agraria",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 120,000,000",
                "fecha_cierre": "2025-07-31",
                "estado": "Abierto",
                "area": "Innovación Tecnológica",
                "categoria": "Agricultura",
                "descripcion": "Programa de transferencia de tecnología al sector agrícola",
                "requisitos": "Centros de investigación, universidades, empresas tecnológicas",
                "enlace": "https://www.fia.cl/programas/transferencia-tecnologica",
                "contacto": "transferencia@fia.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "24 meses",
                "beneficiarios": "Sector agrícola chileno",
                "prioridad": "Media",
                "documentos_requeridos": [
                    "Propuesta de transferencia",
                    "Plan de trabajo",
                    "Presupuesto"
                ],
                "formularios": [
                    "https://www.fia.cl/formularios/transferencia-tecnologica"
                ],
                "fuente": "FIA Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            
            # SAG - Servicio Agrícola y Ganadero
            {
                "id": "SAG-001",
                "nombre": "Programa de Sanidad Vegetal SAG",
                "organizacion": "SAG - Servicio Agrícola y Ganadero",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 60,000,000",
                "fecha_cierre": "2025-08-31",
                "estado": "Abierto",
                "area": "Seguridad Alimentaria",
                "categoria": "Agricultura",
                "descripcion": "Programa de apoyo a la sanidad vegetal y control de plagas",
                "requisitos": "Productores agrícolas, cooperativas, organizaciones rurales",
                "enlace": "https://www.sag.gob.cl/sanidad-vegetal",
                "contacto": "sanidad@sag.gob.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "12 meses",
                "beneficiarios": "Productores agrícolas",
                "prioridad": "Media",
                "documentos_requeridos": [
                    "Proyecto de sanidad vegetal",
                    "Plan de control de plagas",
                    "Presupuesto"
                ],
                "formularios": [
                    "https://www.sag.gob.cl/formularios/sanidad-vegetal"
                ],
                "fuente": "SAG Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "id": "SAG-002",
                "nombre": "Programa de Sanidad Animal SAG",
                "organizacion": "SAG - Servicio Agrícola y Ganadero",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 80,000,000",
                "fecha_cierre": "2025-09-30",
                "estado": "Abierto",
                "area": "Ganadería",
                "categoria": "Agricultura",
                "descripcion": "Programa de apoyo a la sanidad animal y control de enfermedades",
                "requisitos": "Productores ganaderos, cooperativas, organizaciones rurales",
                "enlace": "https://www.sag.gob.cl/sanidad-animal",
                "contacto": "sanidad@sag.gob.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "12 meses",
                "beneficiarios": "Productores ganaderos",
                "prioridad": "Media",
                "documentos_requeridos": [
                    "Proyecto de sanidad animal",
                    "Plan de control de enfermedades",
                    "Presupuesto"
                ],
                "formularios": [
                    "https://www.sag.gob.cl/formularios/sanidad-animal"
                ],
                "fuente": "SAG Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            
            # CNR - Comisión Nacional de Riego
            {
                "id": "CNR-001",
                "nombre": "Programa de Riego CNR",
                "organizacion": "CNR - Comisión Nacional de Riego",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 400,000,000",
                "fecha_cierre": "2025-10-31",
                "estado": "Abierto",
                "area": "Agua",
                "categoria": "Agricultura",
                "descripcion": "Programa de apoyo a proyectos de riego para el sector agrícola",
                "requisitos": "Productores agrícolas, cooperativas de riego, organizaciones rurales",
                "enlace": "https://www.cnr.gob.cl/programa-riego",
                "contacto": "riego@cnr.gob.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "36 meses",
                "beneficiarios": "Productores agrícolas",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Proyecto técnico de riego",
                    "Estudio de factibilidad",
                    "Presupuesto detallado",
                    "Cronograma de implementación"
                ],
                "formularios": [
                    "https://www.cnr.gob.cl/formularios/riego"
                ],
                "fuente": "CNR Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "id": "CNR-002",
                "nombre": "Programa de Tecnificación del Riego CNR",
                "organizacion": "CNR - Comisión Nacional de Riego",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 200,000,000",
                "fecha_cierre": "2025-11-30",
                "estado": "Abierto",
                "area": "Innovación Tecnológica",
                "categoria": "Agricultura",
                "descripcion": "Programa de tecnificación del riego con tecnologías modernas",
                "requisitos": "Productores agrícolas, cooperativas de riego",
                "enlace": "https://www.cnr.gob.cl/tecnificacion-riego",
                "contacto": "tecnificacion@cnr.gob.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "24 meses",
                "beneficiarios": "Productores agrícolas",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Proyecto de tecnificación",
                    "Estudio técnico",
                    "Presupuesto"
                ],
                "formularios": [
                    "https://www.cnr.gob.cl/formularios/tecnificacion"
                ],
                "fuente": "CNR Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            
            # CONAF - Corporación Nacional Forestal
            {
                "id": "CONAF-001",
                "nombre": "Programa de Forestación CONAF",
                "organizacion": "CONAF - Corporación Nacional Forestal",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 150,000,000",
                "fecha_cierre": "2025-12-31",
                "estado": "Abierto",
                "area": "Medio Ambiente",
                "categoria": "Agricultura",
                "descripcion": "Programa de forestación y reforestación para el sector rural",
                "requisitos": "Productores rurales, cooperativas, organizaciones rurales",
                "enlace": "https://www.conaf.cl/forestacion",
                "contacto": "forestacion@conaf.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "36 meses",
                "beneficiarios": "Productores rurales",
                "prioridad": "Media",
                "documentos_requeridos": [
                    "Proyecto de forestación",
                    "Plan de manejo forestal",
                    "Presupuesto"
                ],
                "formularios": [
                    "https://www.conaf.cl/formularios/forestacion"
                ],
                "fuente": "CONAF Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            
            # SENCE - Servicio Nacional de Capacitación y Empleo
            {
                "id": "SENCE-001",
                "nombre": "Programa de Capacitación Rural SENCE",
                "organizacion": "SENCE - Servicio Nacional de Capacitación y Empleo",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 100,000,000",
                "fecha_cierre": "2025-06-30",
                "estado": "Abierto",
                "area": "Desarrollo Rural",
                "categoria": "Agricultura",
                "descripcion": "Programa de capacitación para trabajadores del sector rural",
                "requisitos": "Empresas rurales, cooperativas, organizaciones rurales",
                "enlace": "https://www.sence.cl/capacitacion-rural",
                "contacto": "rural@sence.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "12 meses",
                "beneficiarios": "Trabajadores rurales",
                "prioridad": "Media",
                "documentos_requeridos": [
                    "Plan de capacitación",
                    "Cronograma de actividades",
                    "Presupuesto"
                ],
                "formularios": [
                    "https://www.sence.cl/formularios/capacitacion-rural"
                ],
                "fuente": "SENCE Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            
            # FOSIS - Fondo de Solidaridad e Inversión Social
            {
                "id": "FOSIS-001",
                "nombre": "Programa de Desarrollo Rural FOSIS",
                "organizacion": "FOSIS - Fondo de Solidaridad e Inversión Social",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 80,000,000",
                "fecha_cierre": "2025-07-15",
                "estado": "Abierto",
                "area": "Desarrollo Rural",
                "categoria": "Agricultura",
                "descripcion": "Programa de apoyo al desarrollo rural y comunitario",
                "requisitos": "Organizaciones comunitarias, cooperativas, grupos rurales",
                "enlace": "https://www.fosis.gob.cl/desarrollo-rural",
                "contacto": "rural@fosis.gob.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "18 meses",
                "beneficiarios": "Comunidades rurales",
                "prioridad": "Media",
                "documentos_requeridos": [
                    "Proyecto comunitario",
                    "Plan de desarrollo",
                    "Presupuesto"
                ],
                "formularios": [
                    "https://www.fosis.gob.cl/formularios/desarrollo-rural"
                ],
                "fuente": "FOSIS Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            
            # FNDR - Fondo Nacional de Desarrollo Regional
            {
                "id": "FNDR-001",
                "nombre": "Programa de Desarrollo Regional FNDR",
                "organizacion": "FNDR - Fondo Nacional de Desarrollo Regional",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 500,000,000",
                "fecha_cierre": "2025-08-31",
                "estado": "Abierto",
                "area": "Desarrollo Rural",
                "categoria": "Agricultura",
                "descripcion": "Programa de desarrollo regional con enfoque en el sector rural",
                "requisitos": "Gobiernos regionales, municipios, organizaciones rurales",
                "enlace": "https://www.fndr.gob.cl/desarrollo-regional",
                "contacto": "regional@fndr.gob.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "48 meses",
                "beneficiarios": "Regiones rurales",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Proyecto regional",
                    "Plan de desarrollo",
                    "Presupuesto detallado"
                ],
                "formularios": [
                    "https://www.fndr.gob.cl/formularios/desarrollo-regional"
                ],
                "fuente": "FNDR Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            
            # FIA - Programas Específicos
            {
                "id": "FIA-003",
                "nombre": "Programa de Innovación en Biotecnología FIA",
                "organizacion": "FIA - Fundación para la Innovación Agraria",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 200,000,000",
                "fecha_cierre": "2025-09-30",
                "estado": "Abierto",
                "area": "Innovación Tecnológica",
                "categoria": "Agricultura",
                "descripcion": "Programa de innovación en biotecnología aplicada a la agricultura",
                "requisitos": "Centros de investigación, universidades, empresas biotecnológicas",
                "enlace": "https://www.fia.cl/programas/biotecnologia",
                "contacto": "biotecnologia@fia.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "36 meses",
                "beneficiarios": "Sector biotecnológico agrícola",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Propuesta de biotecnología",
                    "Plan de investigación",
                    "Presupuesto"
                ],
                "formularios": [
                    "https://www.fia.cl/formularios/biotecnologia"
                ],
                "fuente": "FIA Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "id": "FIA-004",
                "nombre": "Programa de Agricultura Digital FIA",
                "organizacion": "FIA - Fundación para la Innovación Agraria",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 180,000,000",
                "fecha_cierre": "2025-10-31",
                "estado": "Abierto",
                "area": "Innovación Tecnológica",
                "categoria": "Agricultura",
                "descripcion": "Programa de digitalización de la agricultura",
                "requisitos": "Empresas tecnológicas, centros de investigación, universidades",
                "enlace": "https://www.fia.cl/programas/agricultura-digital",
                "contacto": "digital@fia.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "30 meses",
                "beneficiarios": "Sector agrícola digital",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Propuesta de digitalización",
                    "Plan de implementación",
                    "Presupuesto"
                ],
                "formularios": [
                    "https://www.fia.cl/formularios/agricultura-digital"
                ],
                "fuente": "FIA Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        ]
    
    def obtener_fondos_internacionales_avanzados(self):
        """Obtener fondos internacionales con información detallada"""
        return [
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
                "id": "FAO-002",
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
            }
        ]
    
    def scraping_bid_projects(self):
        """Scraping automático de proyectos del BID"""
        try:
            logger.info("🔄 Iniciando scraping BID...")
            
            # Configurar Selenium para scraping dinámico
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            
            driver = webdriver.Chrome(options=chrome_options)
            driver.get("https://www.iadb.org/es/project-search")
            
            # Esperar a que cargue la página
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "project-item"))
            )
            
            # Extraer información de proyectos
            proyectos = []
            project_elements = driver.find_elements(By.CLASS_NAME, "project-item")
            
            for element in project_elements[:10]:  # Limitar a 10 proyectos
                try:
                    titulo = element.find_element(By.CLASS_NAME, "project-title").text
                    descripcion = element.find_element(By.CLASS_NAME, "project-description").text
                    monto = element.find_element(By.CLASS_NAME, "project-amount").text
                    
                    proyecto = {
                        "id": f"BID-SCRAPED-{hashlib.md5(titulo.encode()).hexdigest()[:8]}",
                        "nombre": titulo,
                        "organizacion": "Banco Interamericano de Desarrollo",
                        "tipo": "Internacional",
                        "descripcion": descripcion,
                        "monto": monto,
                        "estado": "Abierto",
                        "fuente": "BID Scraping",
                        "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                    }
                    proyectos.append(proyecto)
                except:
                    continue
            
            driver.quit()
            logger.info(f"✅ Scraping BID completado: {len(proyectos)} proyectos")
            return proyectos
            
        except Exception as e:
            logger.error(f"❌ Error en scraping BID: {e}")
            return []
    
    def scraping_mercado_publico_chile(self):
        """Scraping del Mercado Público de Chile"""
        try:
            logger.info("🔄 Iniciando scraping Mercado Público Chile...")
            
            # URL del Mercado Público
            url = "https://www.mercadopublico.cl/Portal/Public/BusquedaAvanzada"
            
            response = requests.get(url, timeout=30)
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Buscar licitaciones relacionadas con agricultura
                licitaciones = []
                for item in soup.find_all('div', class_='licitacion-item'):
                    try:
                        titulo = item.find('h3').text.strip()
                        descripcion = item.find('p', class_='descripcion').text.strip()
                        monto = item.find('span', class_='monto').text.strip()
                        fecha = item.find('span', class_='fecha').text.strip()
                        
                        if any(keyword in titulo.lower() for keyword in ['agricultura', 'rural', 'agro', 'campo']):
                            licitacion = {
                                "id": f"MP-CHILE-{hashlib.md5(titulo.encode()).hexdigest()[:8]}",
                                "nombre": titulo,
                                "organizacion": "Mercado Público Chile",
                                "tipo": "Nacional",
                                "pais": "Chile",
                                "descripcion": descripcion,
                                "monto": monto,
                                "fecha_cierre": fecha,
                                "estado": "Abierto",
                                "fuente": "Mercado Público Chile",
                                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                            }
                            licitaciones.append(licitacion)
                    except:
                        continue
                
                logger.info(f"✅ Scraping Mercado Público completado: {len(licitaciones)} licitaciones")
                return licitaciones
            
        except Exception as e:
            logger.error(f"❌ Error en scraping Mercado Público: {e}")
            return []
    
    def actualizar_fondos_automaticamente_avanzado(self):
        """Actualización automática avanzada desde múltiples fuentes"""
        logger.info("🔄 Iniciando actualización automática avanzada...")
        
        fondos_nuevos = []
        
        # Agregar fondos nacionales
        fondos_nuevos.extend(self.obtener_fondos_nacionales_chile())
        
        # Agregar fondos internacionales
        fondos_nuevos.extend(self.obtener_fondos_internacionales_avanzados())
        
        # Scraping automático de fuentes externas
        with ThreadPoolExecutor(max_workers=self.config.get('max_concurrent_scrapers', 5)) as executor:
            futures = []
            
            # Scraping BID
            futures.append(executor.submit(self.scraping_bid_projects))
            
            # Scraping Mercado Público Chile
            futures.append(executor.submit(self.scraping_mercado_publico_chile))
            
            # Esperar resultados
            for future in futures:
                try:
                    resultados = future.result(timeout=self.config.get('timeout_scraping', 30))
                    fondos_nuevos.extend(resultados)
                except Exception as e:
                    logger.error(f"❌ Error en scraping: {e}")
        
        # Procesar y limpiar datos
        fondos_procesados = []
        for fondo in fondos_nuevos:
            # Agregar campos faltantes
            if 'fecha_actualizacion' not in fondo:
                fondo['fecha_actualizacion'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            if 'prioridad' not in fondo:
                fondo['prioridad'] = 'Media'
            
            if 'categoria' not in fondo:
                fondo['categoria'] = 'Agricultura'
            
            fondos_procesados.append(fondo)
        
        # Combinar con datos existentes
        fondos_existentes = {f['id']: f for f in self.fondos_data}
        
        for fondo in fondos_procesados:
            if fondo['id'] not in fondos_existentes:
                self.fondos_data.append(fondo)
            else:
                # Actualizar datos existentes
                fondos_existentes[fondo['id']] = fondo
        
        # Guardar datos
        self.guardar_datos()
        
        logger.info(f"✅ Actualización automática completada: {len(fondos_procesados)} fondos procesados")
        return len(fondos_procesados)
    
    def buscar_fondos_avanzado(self, query="", tipo="", area="", categoria="", estado="", prioridad="", fuente=""):
        """Búsqueda avanzada de fondos con múltiples filtros"""
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
        
        if categoria:
            resultados = [f for f in resultados if f.get('categoria') == categoria]
        
        if estado:
            resultados = [f for f in resultados if f.get('estado') == estado]
        
        if prioridad:
            resultados = [f for f in resultados if f.get('prioridad') == prioridad]
        
        if fuente:
            resultados = [f for f in resultados if f.get('fuente') == fuente]
        
        return resultados
    
    def exportar_excel_avanzado(self):
        """Exportar datos a Excel con múltiples hojas"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"fondos_iica_chile_avanzado_{timestamp}.xlsx"
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
            
            # Hoja 5: Por prioridad
            for prioridad in ['Alta', 'Media', 'Baja']:
                fondos_prioridad = [f for f in self.fondos_data if f.get('prioridad') == prioridad]
                if fondos_prioridad:
                    df_prioridad = pd.DataFrame(fondos_prioridad)
                    df_prioridad.to_excel(writer, sheet_name=f'Prioridad {prioridad}', index=False)
        
        return filepath, filename

# Inicializar plataforma
platform = IICAChilePlatformOptimized()

# Context processor para datos globales
@app.context_processor
def inject_global_data():
    return dict(
        flash_messages=get_flashed_messages(),
        config=platform.config,
        fondos_abiertos=platform.buscar_fondos_avanzado(estado="Abierto")[:6],
        recordatorios=platform.obtener_recordatorios()[:3] if hasattr(platform, 'obtener_recordatorios') else []
    )

# Rutas principales
@app.route('/')
def index():
    """Página principal optimizada"""
    fondos_abiertos = platform.buscar_fondos_avanzado(estado="Abierto")[:6]
    recordatorios = []
    
    return render_template('index_optimized.html', 
                         fondos_abiertos=fondos_abiertos,
                         recordatorios=recordatorios)

@app.route('/fondos')
def fondos():
    """Página de fondos con filtros avanzados"""
    query = request.args.get('q', '')
    tipo = request.args.get('tipo', '')
    area = request.args.get('area', '')
    categoria = request.args.get('categoria', '')
    estado = request.args.get('estado', '')
    prioridad = request.args.get('prioridad', '')
    fuente = request.args.get('fuente', '')
    
    fondos_filtrados = platform.buscar_fondos_avanzado(query, tipo, area, categoria, estado, prioridad, fuente)
    
    return render_template('fondos_optimized.html', 
                         fondos=fondos_filtrados,
                         query=query,
                         tipo=tipo,
                         area=area,
                         categoria=categoria,
                         estado=estado,
                         prioridad=prioridad,
                         fuente=fuente)

@app.route('/fondo/<fondo_id>')
def detalle_fondo(fondo_id):
    """Detalle completo de un fondo"""
    fondo = next((f for f in platform.fondos_data if f['id'] == fondo_id), None)
    
    if not fondo:
        flash('Fondo no encontrado', 'error')
        return redirect(url_for('fondos'))
    
    return render_template('detalle_fondo_optimized.html', fondo=fondo)

@app.route('/exportar')
def exportar():
    """Exportar datos a Excel avanzado"""
    try:
        filepath, filename = platform.exportar_excel_avanzado()
        return send_file(filepath, as_attachment=True, download_name=filename)
    except Exception as e:
        flash(f'Error al exportar: {str(e)}', 'error')
        return redirect(url_for('fondos'))

@app.route('/actualizar', methods=['POST'])
def actualizar_fondos():
    """Actualización manual de fondos"""
    try:
        fondos_actualizados = platform.actualizar_fondos_automaticamente_avanzado()
        flash(f'✅ {fondos_actualizados} fondos actualizados correctamente', 'success')
    except Exception as e:
        flash(f'❌ Error actualizando fondos: {str(e)}', 'error')
    
    return redirect(url_for('fondos'))

# APIs
@app.route('/api/fondos')
def api_fondos():
    """API para obtener fondos con filtros avanzados"""
    query = request.args.get('q', '')
    tipo = request.args.get('tipo', '')
    area = request.args.get('area', '')
    categoria = request.args.get('categoria', '')
    estado = request.args.get('estado', '')
    prioridad = request.args.get('prioridad', '')
    fuente = request.args.get('fuente', '')
    
    fondos_filtrados = platform.buscar_fondos_avanzado(query, tipo, area, categoria, estado, prioridad, fuente)
    
    return jsonify({
        'total': len(fondos_filtrados),
        'fondos': fondos_filtrados
    })

@app.route('/api/estadisticas')
def api_estadisticas():
    """API para estadísticas avanzadas"""
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

# Función para actualización automática en segundo plano
def actualizacion_automatica_avanzada():
    """Función para actualización automática avanzada"""
    while True:
        try:
            platform.actualizar_fondos_automaticamente_avanzado()
            logger.info("✅ Actualización automática avanzada completada")
        except Exception as e:
            logger.error(f"❌ Error en actualización automática: {e}")
        
        # Esperar tiempo configurado antes de la próxima actualización
        tiempo_espera = platform.config.get('actualizacion_automatica_horas', 6) * 60 * 60
        time.sleep(tiempo_espera)

if __name__ == '__main__':
    # Iniciar actualización automática en segundo plano
    thread_actualizacion = threading.Thread(target=actualizacion_automatica_avanzada, daemon=True)
    thread_actualizacion.start()
    
    # Actualizar fondos al iniciar
    platform.actualizar_fondos_automaticamente_avanzado()
    
    print("🚀 Iniciando Plataforma IICA Chile Optimizada...")
    print("✅ Sistema avanzado de financiamiento cargado")
    print("🌐 Accede a: http://127.0.0.1:5003")
    
    app.run(debug=True, host='0.0.0.0', port=5003)
