#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Plataforma IICA Chile - Versión Dinámica y Mejorada
Sistema de gestión de fondos nacionales e internacionales
"""

import os
import json
import logging
from datetime import datetime, timedelta
from flask import Flask, render_template, request, jsonify, redirect, url_for, flash
import requests
from pathlib import Path

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = 'iica_chile_2024_dinamico'

class IICAPlatformDinamico:
    def __init__(self):
        self.data_dir = Path("data")
        self.data_dir.mkdir(exist_ok=True)
        self.fondos_file = self.data_dir / "fondos_dinamicos.json"
        self.postulaciones_file = self.data_dir / "postulaciones_dinamicas.json"
        self.fondos_data = []
        self.postulaciones_data = []
        self.cargar_datos()
        self.descargar_logo_iica()
    
    def descargar_logo_iica(self):
        """Descargar logo oficial de IICA"""
        try:
            logo_dir = Path("static/logos")
            logo_dir.mkdir(exist_ok=True)
            logo_path = logo_dir / "logo_iica_oficial.svg"
            
            if not logo_path.exists():
                # Logo básico de IICA
                logo_svg = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60">
                    <rect width="200" height="60" fill="#1e3a8a"/>
                    <text x="100" y="35" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="18" font-weight="bold">IICA CHILE</text>
                </svg>'''
                with open(logo_path, 'w', encoding='utf-8') as f:
                    f.write(logo_svg)
                logger.info("✅ Logo IICA dinámico creado")
        except Exception as e:
            logger.error(f"Error descargando logo: {e}")
    
    def cargar_datos(self):
        """Cargar datos existentes"""
        try:
            if self.fondos_file.exists():
                with open(self.fondos_file, 'r', encoding='utf-8') as f:
                    self.fondos_data = json.load(f)
            
            if self.postulaciones_file.exists():
                with open(self.postulaciones_file, 'r', encoding='utf-8') as f:
                    self.postulaciones_data = json.load(f)
            
            # Si no hay datos, inicializar con fondos base
            if not self.fondos_data:
                self.inicializar_fondos_base()
                self.guardar_datos()
                
        except Exception as e:
            logger.error(f"Error cargando datos: {e}")
            self.inicializar_fondos_base()
    
    def inicializar_fondos_base(self):
        """Inicializar con fondos base expandidos"""
        self.fondos_data = []
        
        # Fondos Nacionales Expandidos
        fondos_nacionales = self.obtener_fondos_nacionales_expandidos()
        
        # Fondos Internacionales Expandidos  
        fondos_internacionales = self.obtener_fondos_internacionales_expandidos()
        
        # Fondos de Innovación y Tecnología
        fondos_innovacion = self.obtener_fondos_innovacion()
        
        # Fondos de Sostenibilidad
        fondos_sostenibilidad = self.obtener_fondos_sostenibilidad()
        
        self.fondos_data = fondos_nacionales + fondos_internacionales + fondos_innovacion + fondos_sostenibilidad
    
    def obtener_fondos_nacionales_expandidos(self):
        """Fondos nacionales expandidos de Chile"""
        return [
            # CORFO - Programas expandidos
            {
                "id": "CORFO-001",
                "nombre": "Programa de Innovación Agraria CORFO",
                "organizacion": "CORFO Chile",
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
                "nombre": "Programa de Emprendimiento Rural CORFO",
                "organizacion": "CORFO Chile",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 300,000,000",
                "fecha_cierre": "2025-02-28",
                "estado": "Abierto",
                "area": "Emprendimiento Rural",
                "categoria": "Desarrollo Rural",
                "descripcion": "Apoyo a emprendimientos rurales innovadores con potencial de crecimiento",
                "requisitos": "Emprendedores rurales, cooperativas, asociaciones",
                "enlace": "https://www.corfo.cl/emprendimiento-rural",
                "contacto": "rural@corfo.cl",
                "tipo_financiamiento": "Subsidio + Crédito",
                "duracion": "18 meses",
                "beneficiarios": "Emprendedores rurales",
                "prioridad": "Media",
                "documentos_requeridos": [
                    "Formulario de postulación",
                    "Plan de negocio",
                    "Presupuesto",
                    "Cronograma"
                ],
                "formularios": [
                    "https://www.corfo.cl/formularios/emprendimiento-rural"
                ],
                "fuente": "CORFO Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            # INDAP - Programas expandidos
            {
                "id": "INDAP-001",
                "nombre": "Programa de Desarrollo de Inversiones (PDI) INDAP",
                "organizacion": "INDAP Chile",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 15,000,000",
                "fecha_cierre": "2025-04-30",
                "estado": "Abierto",
                "area": "Desarrollo Rural",
                "categoria": "Agricultura Familiar",
                "descripcion": "Financiamiento para inversiones en infraestructura y equipamiento agrícola",
                "requisitos": "Usuarios INDAP, agricultores familiares",
                "enlace": "https://www.indap.gob.cl/pdi",
                "contacto": "pdi@indap.gob.cl",
                "tipo_financiamiento": "Crédito",
                "duracion": "10 años",
                "beneficiarios": "Agricultores familiares",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Formulario PDI",
                    "Proyecto técnico",
                    "Presupuesto detallado",
                    "Certificados de propiedad"
                ],
                "formularios": [
                    "https://www.indap.gob.cl/formularios/pdi"
                ],
                "fuente": "INDAP Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "id": "INDAP-002",
                "nombre": "Programa de Asesoría Técnica (SAT) INDAP",
                "organizacion": "INDAP Chile",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 2,000,000",
                "fecha_cierre": "2025-03-15",
                "estado": "Abierto",
                "area": "Asesoría Técnica",
                "categoria": "Capacitación",
                "descripcion": "Asesoría técnica especializada para agricultores familiares",
                "requisitos": "Usuarios INDAP",
                "enlace": "https://www.indap.gob.cl/sat",
                "contacto": "sat@indap.gob.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "12 meses",
                "beneficiarios": "Agricultores familiares",
                "prioridad": "Media",
                "documentos_requeridos": [
                    "Formulario SAT",
                    "Plan de asesoría"
                ],
                "formularios": [
                    "https://www.indap.gob.cl/formularios/sat"
                ],
                "fuente": "INDAP Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            # FIA - Programas expandidos
            {
                "id": "FIA-001",
                "nombre": "Programa de Innovación en Agricultura FIA",
                "organizacion": "FIA Chile",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 200,000,000",
                "fecha_cierre": "2025-05-31",
                "estado": "Abierto",
                "area": "Innovación Agrícola",
                "categoria": "I+D",
                "descripcion": "Fomento a la innovación en el sector agrícola nacional",
                "requisitos": "Empresas agrícolas, centros de investigación",
                "enlace": "https://www.fia.cl/innovacion",
                "contacto": "innovacion@fia.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "36 meses",
                "beneficiarios": "Sector agrícola",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Proyecto de innovación",
                    "Presupuesto",
                    "Cronograma",
                    "Equipo técnico"
                ],
                "formularios": [
                    "https://www.fia.cl/formularios/innovacion"
                ],
                "fuente": "FIA Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            # SAG - Programas nuevos
            {
                "id": "SAG-001",
                "nombre": "Programa de Sanidad Vegetal SAG",
                "organizacion": "SAG Chile",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 50,000,000",
                "fecha_cierre": "2025-06-30",
                "estado": "Abierto",
                "area": "Sanidad Vegetal",
                "categoria": "Salud Animal y Vegetal",
                "descripcion": "Programa de prevención y control de plagas y enfermedades vegetales",
                "requisitos": "Productores agrícolas, organizaciones",
                "enlace": "https://www.sag.gob.cl/sanidad-vegetal",
                "contacto": "sanidad@sag.gob.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "24 meses",
                "beneficiarios": "Productores agrícolas",
                "prioridad": "Media",
                "documentos_requeridos": [
                    "Formulario SAG",
                    "Plan sanitario",
                    "Presupuesto"
                ],
                "formularios": [
                    "https://www.sag.gob.cl/formularios/sanidad"
                ],
                "fuente": "SAG Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            # CNR - Programas nuevos
            {
                "id": "CNR-001",
                "nombre": "Programa de Riego Tecnificado CNR",
                "organizacion": "CNR Chile",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 100,000,000",
                "fecha_cierre": "2025-07-31",
                "estado": "Abierto",
                "area": "Riego Tecnificado",
                "categoria": "Infraestructura",
                "descripcion": "Fomento a la tecnificación del riego agrícola",
                "requisitos": "Productores agrícolas",
                "enlace": "https://www.cnr.gob.cl/riego-tecnificado",
                "contacto": "riego@cnr.gob.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "18 meses",
                "beneficiarios": "Productores agrícolas",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Proyecto de riego",
                    "Presupuesto",
                    "Planos técnicos"
                ],
                "formularios": [
                    "https://www.cnr.gob.cl/formularios/riego"
                ],
                "fuente": "CNR Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        ]
    
    def obtener_fondos_internacionales_expandidos(self):
        """Fondos internacionales expandidos"""
        return [
            # BID - Programas expandidos
            {
                "id": "BID-001",
                "nombre": "Fondo de Innovación Agrícola BID",
                "organizacion": "BID",
                "tipo": "Internacional",
                "pais": "Regional",
                "monto": "USD 5,000,000",
                "fecha_cierre": "2025-08-31",
                "estado": "Abierto",
                "area": "Innovación Agrícola",
                "categoria": "Desarrollo Rural",
                "descripcion": "Fondo para proyectos de innovación agrícola en América Latina y el Caribe",
                "requisitos": "Organizaciones de la región, gobiernos, ONGs",
                "enlace": "https://www.iadb.org/innovacion-agricola",
                "contacto": "innovacion@iadb.org",
                "tipo_financiamiento": "Subsidio",
                "duracion": "36 meses",
                "beneficiarios": "América Latina y Caribe",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Propuesta técnica",
                    "Presupuesto detallado",
                    "Cronograma",
                    "Equipo técnico"
                ],
                "formularios": [
                    "https://www.iadb.org/formularios/innovacion"
                ],
                "fuente": "BID",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "id": "BID-002",
                "nombre": "Programa de Sostenibilidad Ambiental BID",
                "organizacion": "BID",
                "tipo": "Internacional",
                "pais": "Regional",
                "monto": "USD 10,000,000",
                "fecha_cierre": "2025-09-30",
                "estado": "Abierto",
                "area": "Sostenibilidad Ambiental",
                "categoria": "Medio Ambiente",
                "descripcion": "Proyectos de sostenibilidad ambiental y cambio climático",
                "requisitos": "Organizaciones ambientales, gobiernos",
                "enlace": "https://www.iadb.org/sostenibilidad",
                "contacto": "sostenibilidad@iadb.org",
                "tipo_financiamiento": "Subsidio",
                "duracion": "48 meses",
                "beneficiarios": "América Latina y Caribe",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Propuesta ambiental",
                    "Estudio de impacto",
                    "Presupuesto",
                    "Cronograma"
                ],
                "formularios": [
                    "https://www.iadb.org/formularios/sostenibilidad"
                ],
                "fuente": "BID",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            # FAO - Programas expandidos
            {
                "id": "FAO-001",
                "nombre": "Programa de Seguridad Alimentaria FAO",
                "organizacion": "FAO",
                "tipo": "Internacional",
                "pais": "Global",
                "monto": "USD 2,000,000",
                "fecha_cierre": "2025-10-31",
                "estado": "Abierto",
                "area": "Seguridad Alimentaria",
                "categoria": "Alimentación",
                "descripcion": "Proyectos para mejorar la seguridad alimentaria y nutrición",
                "requisitos": "Gobiernos, ONGs, organizaciones",
                "enlace": "https://www.fao.org/seguridad-alimentaria",
                "contacto": "seguridad@fao.org",
                "tipo_financiamiento": "Subsidio",
                "duracion": "24 meses",
                "beneficiarios": "Países en desarrollo",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Propuesta técnica",
                    "Presupuesto",
                    "Cronograma",
                    "Indicadores"
                ],
                "formularios": [
                    "https://www.fao.org/formularios/seguridad"
                ],
                "fuente": "FAO",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "id": "FAO-002",
                "nombre": "Programa de Agricultura Sostenible FAO",
                "organizacion": "FAO",
                "tipo": "Internacional",
                "pais": "Global",
                "monto": "USD 3,000,000",
                "fecha_cierre": "2025-11-30",
                "estado": "Abierto",
                "area": "Agricultura Sostenible",
                "categoria": "Sostenibilidad",
                "descripcion": "Fomento a prácticas agrícolas sostenibles y resilientes",
                "requisitos": "Organizaciones agrícolas, gobiernos",
                "enlace": "https://www.fao.org/agricultura-sostenible",
                "contacto": "agricultura@fao.org",
                "tipo_financiamiento": "Subsidio",
                "duracion": "30 meses",
                "beneficiarios": "Países en desarrollo",
                "prioridad": "Media",
                "documentos_requeridos": [
                    "Propuesta técnica",
                    "Presupuesto",
                    "Cronograma",
                    "Metodología"
                ],
                "formularios": [
                    "https://www.fao.org/formularios/agricultura"
                ],
                "fuente": "FAO",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            # GEF - Programas expandidos
            {
                "id": "GEF-001",
                "nombre": "Fondo Mundial para el Medio Ambiente - Biodiversidad",
                "organizacion": "GEF",
                "tipo": "Internacional",
                "pais": "Global",
                "monto": "USD 8,000,000",
                "fecha_cierre": "2025-12-31",
                "estado": "Abierto",
                "area": "Biodiversidad",
                "categoria": "Conservación",
                "descripcion": "Proyectos de conservación de biodiversidad y ecosistemas",
                "requisitos": "Gobiernos, ONGs ambientales",
                "enlace": "https://www.thegef.org/biodiversidad",
                "contacto": "biodiversidad@gef.org",
                "tipo_financiamiento": "Subsidio",
                "duracion": "60 meses",
                "beneficiarios": "Países en desarrollo",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Propuesta técnica",
                    "Estudio de biodiversidad",
                    "Presupuesto",
                    "Cronograma",
                    "Indicadores ambientales"
                ],
                "formularios": [
                    "https://www.thegef.org/formularios/biodiversidad"
                ],
                "fuente": "GEF",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            # Fondo Verde del Clima
            {
                "id": "GCF-001",
                "nombre": "Fondo Verde del Clima - Adaptación",
                "organizacion": "Fondo Verde del Clima",
                "tipo": "Internacional",
                "pais": "Global",
                "monto": "USD 15,000,000",
                "fecha_cierre": "2025-12-15",
                "estado": "Abierto",
                "area": "Adaptación al Cambio Climático",
                "categoria": "Cambio Climático",
                "descripcion": "Proyectos de adaptación al cambio climático en sectores vulnerables",
                "requisitos": "Gobiernos, entidades acreditadas",
                "enlace": "https://www.greenclimate.fund/adaptacion",
                "contacto": "adaptacion@gcf.org",
                "tipo_financiamiento": "Subsidio",
                "duracion": "72 meses",
                "beneficiarios": "Países en desarrollo",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Propuesta de adaptación",
                    "Análisis de vulnerabilidad",
                    "Presupuesto detallado",
                    "Cronograma",
                    "Indicadores de adaptación"
                ],
                "formularios": [
                    "https://www.greenclimate.fund/formularios/adaptacion"
                ],
                "fuente": "Fondo Verde del Clima",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        ]
    
    def obtener_fondos_innovacion(self):
        """Fondos de innovación y tecnología"""
        return [
            {
                "id": "INNOV-001",
                "nombre": "Programa de Innovación Tecnológica Agrícola",
                "organizacion": "Ministerio de Agricultura Chile",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 800,000,000",
                "fecha_cierre": "2025-06-30",
                "estado": "Abierto",
                "area": "Tecnología Agrícola",
                "categoria": "Innovación",
                "descripcion": "Fomento a la adopción de tecnologías agrícolas avanzadas",
                "requisitos": "Empresas agrícolas, startups, centros de investigación",
                "enlace": "https://www.minagri.gob.cl/innovacion-tecnologica",
                "contacto": "innovacion@minagri.gob.cl",
                "tipo_financiamiento": "Subsidio + Crédito",
                "duracion": "36 meses",
                "beneficiarios": "Sector agrícola chileno",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Propuesta técnica",
                    "Presupuesto detallado",
                    "Cronograma",
                    "Equipo técnico",
                    "Plan de comercialización"
                ],
                "formularios": [
                    "https://www.minagri.gob.cl/formularios/innovacion"
                ],
                "fuente": "Ministerio de Agricultura Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "id": "INNOV-002",
                "nombre": "Fondo de Innovación Digital Rural",
                "organizacion": "Subsecretaría de Telecomunicaciones Chile",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 400,000,000",
                "fecha_cierre": "2025-08-31",
                "estado": "Abierto",
                "area": "Digitalización Rural",
                "categoria": "Tecnología",
                "descripcion": "Proyectos de digitalización y conectividad rural",
                "requisitos": "Municipios rurales, organizaciones rurales",
                "enlace": "https://www.subtel.gob.cl/digitalizacion-rural",
                "contacto": "digitalizacion@subtel.gob.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "24 meses",
                "beneficiarios": "Comunidades rurales",
                "prioridad": "Media",
                "documentos_requeridos": [
                    "Proyecto de digitalización",
                    "Presupuesto",
                    "Cronograma",
                    "Plan de sostenibilidad"
                ],
                "formularios": [
                    "https://www.subtel.gob.cl/formularios/digitalizacion"
                ],
                "fuente": "Subsecretaría de Telecomunicaciones Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        ]
    
    def obtener_fondos_sostenibilidad(self):
        """Fondos de sostenibilidad y medio ambiente"""
        return [
            {
                "id": "SUST-001",
                "nombre": "Programa de Agricultura Regenerativa",
                "organizacion": "Ministerio del Medio Ambiente Chile",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 600,000,000",
                "fecha_cierre": "2025-09-30",
                "estado": "Abierto",
                "area": "Agricultura Regenerativa",
                "categoria": "Sostenibilidad",
                "descripcion": "Fomento a prácticas agrícolas regenerativas y sostenibles",
                "requisitos": "Productores agrícolas, organizaciones",
                "enlace": "https://www.mma.gob.cl/agricultura-regenerativa",
                "contacto": "regenerativa@mma.gob.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "30 meses",
                "beneficiarios": "Productores agrícolas",
                "prioridad": "Alta",
                "documentos_requeridos": [
                    "Plan de agricultura regenerativa",
                    "Presupuesto",
                    "Cronograma",
                    "Indicadores ambientales"
                ],
                "formularios": [
                    "https://www.mma.gob.cl/formularios/regenerativa"
                ],
                "fuente": "Ministerio del Medio Ambiente Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
            {
                "id": "SUST-002",
                "nombre": "Fondo de Conservación de Suelos",
                "organizacion": "SAG Chile",
                "tipo": "Nacional",
                "pais": "Chile",
                "monto": "CLP 300,000,000",
                "fecha_cierre": "2025-10-31",
                "estado": "Abierto",
                "area": "Conservación de Suelos",
                "categoria": "Conservación",
                "descripcion": "Proyectos de conservación y recuperación de suelos agrícolas",
                "requisitos": "Productores agrícolas",
                "enlace": "https://www.sag.gob.cl/conservacion-suelos",
                "contacto": "suelos@sag.gob.cl",
                "tipo_financiamiento": "Subsidio",
                "duracion": "24 meses",
                "beneficiarios": "Productores agrícolas",
                "prioridad": "Media",
                "documentos_requeridos": [
                    "Plan de conservación",
                    "Presupuesto",
                    "Cronograma",
                    "Estudio de suelos"
                ],
                "formularios": [
                    "https://www.sag.gob.cl/formularios/suelos"
                ],
                "fuente": "SAG Chile",
                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        ]
    
    def guardar_datos(self):
        """Guardar datos en archivos JSON"""
        try:
            with open(self.fondos_file, 'w', encoding='utf-8') as f:
                json.dump(self.fondos_data, f, ensure_ascii=False, indent=2)
            
            with open(self.postulaciones_file, 'w', encoding='utf-8') as f:
                json.dump(self.postulaciones_data, f, ensure_ascii=False, indent=2)
                
        except Exception as e:
            logger.error(f"Error guardando datos: {e}")
    
    def obtener_estadisticas(self):
        """Obtener estadísticas de la plataforma"""
        total_fondos = len(self.fondos_data)
        fondos_abiertos = len([f for f in self.fondos_data if f.get('estado') == 'Abierto'])
        fondos_nacionales = len([f for f in self.fondos_data if f.get('tipo') == 'Nacional'])
        fondos_internacionales = len([f for f in self.fondos_data if f.get('tipo') == 'Internacional'])
        total_postulaciones = len(self.postulaciones_data)
        
        return {
            'total_fondos': total_fondos,
            'fondos_abiertos': fondos_abiertos,
            'fondos_nacionales': fondos_nacionales,
            'fondos_internacionales': fondos_internacionales,
            'total_postulaciones': total_postulaciones
        }
    
    def agregar_fondo(self, datos_fondo):
        """Agregar nuevo fondo"""
        try:
            nuevo_id = f"FONDO-{len(self.fondos_data) + 1:03d}"
            datos_fondo['id'] = nuevo_id
            datos_fondo['fecha_actualizacion'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            self.fondos_data.append(datos_fondo)
            self.guardar_datos()
            return True
        except Exception as e:
            logger.error(f"Error agregando fondo: {e}")
            return False
    
    def agregar_postulacion(self, datos_postulacion):
        """Agregar nueva postulación"""
        try:
            nuevo_id = f"POST-{len(self.postulaciones_data) + 1:03d}"
            datos_postulacion['id'] = nuevo_id
            datos_postulacion['fecha_postulacion'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            self.postulaciones_data.append(datos_postulacion)
            self.guardar_datos()
            return True
        except Exception as e:
            logger.error(f"Error agregando postulación: {e}")
            return False

# Inicializar plataforma
plataforma = IICAPlatformDinamico()

@app.route('/')
def index():
    """Página principal con interfaz dinámica"""
    return render_template('index_dinamico.html')

@app.route('/fondos-abiertos')
def fondos_abiertos():
    """Fondos abiertos con interfaz dinámica"""
    fondos_abiertos = [f for f in plataforma.fondos_data if f.get('estado') == 'Abierto']
    fondos_nacionales = [f for f in fondos_abiertos if f.get('tipo') == 'Nacional']
    fondos_internacionales = [f for f in fondos_abiertos if f.get('tipo') == 'Internacional']
    
    return render_template('fondos_abiertos_dinamico.html', 
                         fondos_nacionales=fondos_nacionales,
                         fondos_internacionales=fondos_internacionales)

@app.route('/fondos-disponibles')
def fondos_disponibles():
    """Todos los fondos disponibles con filtros dinámicos"""
    return render_template('fondos_disponibles_dinamico.html')

@app.route('/agregar-fondo')
def agregar_fondo():
    """Formulario para agregar nuevo fondo"""
    return render_template('agregar_fondo_dinamico.html')

@app.route('/detalle-fondo/<fondo_id>')
def detalle_fondo(fondo_id):
    """Detalle de fondo específico"""
    fondo = next((f for f in plataforma.fondos_data if f.get('id') == fondo_id), None)
    if not fondo:
        flash('Fondo no encontrado', 'error')
        return redirect(url_for('index'))
    
    return render_template('detalle_fondo_dinamico.html', fondo=fondo)

@app.route('/api/estadisticas')
def api_estadisticas():
    """API de estadísticas"""
    return jsonify(plataforma.obtener_estadisticas())

@app.route('/api/fondos')
def api_fondos():
    """API de fondos con filtros"""
    tipo = request.args.get('tipo', '')
    estado = request.args.get('estado', '')
    area = request.args.get('area', '')
    organizacion = request.args.get('organizacion', '')
    
    fondos_filtrados = plataforma.fondos_data.copy()
    
    if tipo:
        fondos_filtrados = [f for f in fondos_filtrados if f.get('tipo') == tipo]
    
    if estado:
        fondos_filtrados = [f for f in fondos_filtrados if f.get('estado') == estado]
    
    if area:
        fondos_filtrados = [f for f in fondos_filtrados if area.lower() in f.get('area', '').lower()]
    
    if organizacion:
        fondos_filtrados = [f for f in fondos_filtrados if organizacion.lower() in f.get('organizacion', '').lower()]
    
    return jsonify(fondos_filtrados)

@app.route('/api/agregar-fondo', methods=['POST'])
def api_agregar_fondo():
    """API para agregar nuevo fondo"""
    try:
        datos = request.get_json()
        if plataforma.agregar_fondo(datos):
            return jsonify({'success': True, 'message': 'Fondo agregado exitosamente'})
        else:
            return jsonify({'success': False, 'message': 'Error agregando fondo'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})

@app.route('/api/agregar-postulacion', methods=['POST'])
def api_agregar_postulacion():
    """API para agregar nueva postulación"""
    try:
        datos = request.get_json()
        if plataforma.agregar_postulacion(datos):
            return jsonify({'success': True, 'message': 'Postulación agregada exitosamente'})
        else:
            return jsonify({'success': False, 'message': 'Error agregando postulación'})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})

@app.route('/exportar-excel')
def exportar_excel():
    """Exportar datos a Excel"""
    try:
        import pandas as pd
        
        # Crear DataFrame con fondos
        df_fondos = pd.DataFrame(plataforma.fondos_data)
        
        # Crear archivo Excel
        excel_path = f"data/fondos_dinamicos_{datetime.now().strftime('%Y%m%d_%H%M%S')}.xlsx"
        with pd.ExcelWriter(excel_path, engine='openpyxl') as writer:
            df_fondos.to_excel(writer, sheet_name='Fondos', index=False)
        
        return jsonify({'success': True, 'file': excel_path})
    except Exception as e:
        return jsonify({'success': False, 'message': f'Error: {str(e)}'})

if __name__ == '__main__':
    print("🚀 Iniciando Plataforma IICA Chile Dinámica...")
    print("✅ Sistema dinámico de financiamiento cargado")
    print("🌐 Accede a: http://127.0.0.1:5004")
    app.run(host='0.0.0.0', port=5004, debug=True)

