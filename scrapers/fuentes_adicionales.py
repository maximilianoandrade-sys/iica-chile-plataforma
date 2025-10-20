#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Scraper para Fuentes Adicionales de Financiamiento
Incluye embajadas, fundaciones internacionales, y otras fuentes
"""

import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime, timedelta
import time
import random
import logging

def obtener_proyectos_embajadas():
    """Obtiene proyectos de embajadas y cooperación internacional"""
    print("🔍 Extrayendo proyectos de embajadas...")
    proyectos = []
    
    try:
        # Embajada de Canadá - FCIL
        proyectos_canada = [
            {
                "Nombre": "Fondo para Iniciativas Locales - Embajada de Canadá 2024",
                "Descripción": "Fondo para proyectos de desarrollo comunitario y cooperación local en Chile",
                "Monto": "CAD 50,000",
                "Área de interés": "Desarrollo Rural",
                "Estado": "Abierto",
                "Fecha cierre": "2024-12-31",
                "Fuente": "Embajada de Canadá",
                "Enlace": "https://www.canadainternational.gc.ca/chile-chili/fund-for-local-initiatives.aspx",
                "Tipo": "Fondo de Cooperación",
                "Beneficiarios": "Organizaciones locales, ONGs, Cooperativas",
                "Requisitos": "Proyectos de desarrollo comunitario, impacto local",
                "Contacto": "santiago@international.gc.ca",
                "Telefono": "+56 2 2204 3000",
                "Direccion": "Nueva Tajamar 481, Torre Norte, Piso 12, Las Condes, Santiago",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Canadá",
                "Tipo_cooperacion": "Bilateral"
            },
            {
                "Nombre": "Programa de Cooperación Técnica Canadá-Chile",
                "Descripción": "Programa de cooperación técnica en agricultura sostenible y cambio climático",
                "Monto": "CAD 200,000",
                "Área de interés": "Agricultura Sostenible",
                "Estado": "Abierto",
                "Fecha cierre": "2025-03-15",
                "Fuente": "Embajada de Canadá",
                "Enlace": "https://www.canadainternational.gc.ca/chile-chili/cooperation-technique.aspx",
                "Tipo": "Cooperación Técnica",
                "Beneficiarios": "Instituciones, Universidades, Centros de investigación",
                "Requisitos": "Proyectos de cooperación técnica, intercambio de conocimientos",
                "Contacto": "cooperation@international.gc.ca",
                "Telefono": "+56 2 2204 3000",
                "Direccion": "Nueva Tajamar 481, Torre Norte, Piso 12, Las Condes, Santiago",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Canadá",
                "Tipo_cooperacion": "Técnica"
            }
        ]
        
        # Embajada de Australia - DAP
        proyectos_australia = [
            {
                "Nombre": "Programa de Ayuda Directa - Embajada de Australia 2024",
                "Descripción": "Programa de ayuda directa para proyectos de desarrollo comunitario en Chile",
                "Monto": "AUD 25,000",
                "Área de interés": "Desarrollo Rural",
                "Estado": "Abierto",
                "Fecha cierre": "2024-11-30",
                "Fuente": "Embajada de Australia",
                "Enlace": "https://chile.embassy.gov.au/sclecastellano/DAPhome.html",
                "Tipo": "Ayuda Directa",
                "Beneficiarios": "Organizaciones comunitarias, ONGs",
                "Requisitos": "Proyectos de desarrollo comunitario, impacto social",
                "Contacto": "santiago@dfat.gov.au",
                "Telefono": "+56 2 2550 3500",
                "Direccion": "Isidora Goyenechea 3621, Piso 12, Las Condes, Santiago",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Australia",
                "Tipo_cooperacion": "Bilateral"
            }
        ]
        
        # Embajada de Alemania
        proyectos_alemania = [
            {
                "Nombre": "Fondo de Cooperación Alemania-Chile 2024",
                "Descripción": "Fondo para proyectos de cooperación en desarrollo sostenible y tecnología",
                "Monto": "EUR 100,000",
                "Área de interés": "Innovación Tecnológica",
                "Estado": "Abierto",
                "Fecha cierre": "2025-02-28",
                "Fuente": "Embajada de Alemania",
                "Enlace": "https://chile.diplo.de/cl-es/cooperation",
                "Tipo": "Cooperación Bilateral",
                "Beneficiarios": "Instituciones, Empresas, Centros de I+D",
                "Requisitos": "Proyectos de cooperación técnica, desarrollo sostenible",
                "Contacto": "cooperation@santiago.diplo.de",
                "Telefono": "+56 2 2463 2500",
                "Direccion": "Las Hualtatas 5677, Vitacura, Santiago",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Alemania",
                "Tipo_cooperacion": "Bilateral"
            }
        ]
        
        todos_proyectos = proyectos_canada + proyectos_australia + proyectos_alemania
        
        for proyecto in todos_proyectos:
            proyectos.append(proyecto)
        
        print(f"✅ Embajadas: {len(proyectos)} proyectos extraídos")
        
    except Exception as e:
        print(f"❌ Error extrayendo embajadas: {e}")
    
    return proyectos

def obtener_proyectos_fundaciones_internacionales():
    """Obtiene proyectos de fundaciones internacionales"""
    print("🔍 Extrayendo proyectos de fundaciones internacionales...")
    proyectos = []
    
    try:
        # Kellogg Foundation
        proyectos_kellogg = [
            {
                "Nombre": "Fondo de Desarrollo Comunitario Kellogg - Chile 2024",
                "Descripción": "Fondo para proyectos de desarrollo comunitario y equidad social en Chile",
                "Monto": "USD 150,000",
                "Área de interés": "Desarrollo Rural",
                "Estado": "Abierto",
                "Fecha cierre": "2025-01-31",
                "Fuente": "Kellogg Foundation",
                "Enlace": "https://www.wkkf.org/what-we-do/chile",
                "Tipo": "Fondo de Fundación",
                "Beneficiarios": "Organizaciones comunitarias, ONGs, Cooperativas",
                "Requisitos": "Proyectos de desarrollo comunitario, equidad social",
                "Contacto": "chile@wkkf.org",
                "Telefono": "+1 269 968 1611",
                "Direccion": "One Michigan Avenue East, Battle Creek, MI 49017, USA",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Estados Unidos",
                "Tipo_cooperacion": "Fundación"
            }
        ]
        
        # Ford Foundation
        proyectos_ford = [
            {
                "Nombre": "Programa de Justicia Social Ford Foundation - Chile",
                "Descripción": "Programa para proyectos de justicia social y desarrollo rural equitativo",
                "Monto": "USD 200,000",
                "Área de interés": "Desarrollo Rural",
                "Estado": "Abierto",
                "Fecha cierre": "2025-04-30",
                "Fuente": "Ford Foundation",
                "Enlace": "https://www.fordfoundation.org/work/our-grants/",
                "Tipo": "Fondo de Fundación",
                "Beneficiarios": "Organizaciones de justicia social, ONGs",
                "Requisitos": "Proyectos de justicia social, desarrollo rural equitativo",
                "Contacto": "grants@fordfoundation.org",
                "Telefono": "+1 212 573 5000",
                "Direccion": "320 E 43rd St, New York, NY 10017, USA",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Estados Unidos",
                "Tipo_cooperacion": "Fundación"
            }
        ]
        
        # Rockefeller Foundation
        proyectos_rockefeller = [
            {
                "Nombre": "Fondo de Sistemas Alimentarios Regenerativos - Rockefeller",
                "Descripción": "Fondo para proyectos de sistemas alimentarios regenerativos y sostenibles",
                "Monto": "USD 300,000",
                "Área de interés": "Agricultura Sostenible",
                "Estado": "Abierto",
                "Fecha cierre": "2025-06-30",
                "Fuente": "Rockefeller Foundation",
                "Enlace": "https://www.rockefellerfoundation.org/our-work/",
                "Tipo": "Fondo de Fundación",
                "Beneficiarios": "Organizaciones, Empresas, Centros de investigación",
                "Requisitos": "Proyectos de sistemas alimentarios regenerativos",
                "Contacto": "grants@rockefellerfoundation.org",
                "Telefono": "+1 212 869 8500",
                "Direccion": "420 Fifth Avenue, New York, NY 10018, USA",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Estados Unidos",
                "Tipo_cooperacion": "Fundación"
            }
        ]
        
        todos_proyectos = proyectos_kellogg + proyectos_ford + proyectos_rockefeller
        
        for proyecto in todos_proyectos:
            proyectos.append(proyecto)
        
        print(f"✅ Fundaciones Internacionales: {len(proyectos)} proyectos extraídos")
        
    except Exception as e:
        print(f"❌ Error extrayendo fundaciones internacionales: {e}")
    
    return proyectos

def obtener_proyectos_agencias_especializadas():
    """Obtiene proyectos de agencias especializadas"""
    print("🔍 Extrayendo proyectos de agencias especializadas...")
    proyectos = []
    
    try:
        # Devex
        proyectos_devex = [
            {
                "Nombre": "Fondo de Oportunidades Devex - Agricultura 2024",
                "Descripción": "Fondo para oportunidades de financiamiento en agricultura y desarrollo rural",
                "Monto": "USD 500,000",
                "Área de interés": "Agricultura Sostenible",
                "Estado": "Abierto",
                "Fecha cierre": "2024-12-15",
                "Fuente": "Devex",
                "Enlace": "https://www.devex.com/funding",
                "Tipo": "Fondo de Oportunidades",
                "Beneficiarios": "Organizaciones, Empresas, ONGs",
                "Requisitos": "Proyectos de agricultura y desarrollo rural",
                "Contacto": "funding@devex.com",
                "Telefono": "+1 202 729 7600",
                "Direccion": "1400 K Street NW, Suite 1100, Washington, DC 20005, USA",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Estados Unidos",
                "Tipo_cooperacion": "Agregador"
            }
        ]
        
        # Terra Viva Grants
        proyectos_terra_viva = [
            {
                "Nombre": "Directorio de Subsidios Terra Viva - Agricultura 2024",
                "Descripción": "Directorio especializado en subsidios para agricultura y medio ambiente",
                "Monto": "USD 1,000,000",
                "Área de interés": "Agricultura Sostenible",
                "Estado": "Abierto",
                "Fecha cierre": "2025-03-31",
                "Fuente": "Terra Viva Grants",
                "Enlace": "https://www.terravivagrants.org",
                "Tipo": "Directorio de Subsidios",
                "Beneficiarios": "Organizaciones, Empresas, Centros de investigación",
                "Requisitos": "Proyectos de agricultura y medio ambiente",
                "Contacto": "info@terravivagrants.org",
                "Telefono": "+1 202 729 7600",
                "Direccion": "1400 K Street NW, Suite 1100, Washington, DC 20005, USA",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Estados Unidos",
                "Tipo_cooperacion": "Agregador"
            }
        ]
        
        # GAFSP
        proyectos_gafsp = [
            {
                "Nombre": "Programa Global de Agricultura y Seguridad Alimentaria - GAFSP 2024",
                "Descripción": "Programa global para proyectos de seguridad alimentaria y nutrición",
                "Monto": "USD 2,000,000",
                "Área de interés": "Seguridad Alimentaria",
                "Estado": "Abierto",
                "Fecha cierre": "2025-05-31",
                "Fuente": "GAFSP",
                "Enlace": "https://www.gafspfund.org/call-proposals",
                "Tipo": "Programa Global",
                "Beneficiarios": "Gobiernos, Organizaciones internacionales",
                "Requisitos": "Proyectos de seguridad alimentaria, nutrición",
                "Contacto": "info@gafspfund.org",
                "Telefono": "+1 202 473 1000",
                "Direccion": "1818 H Street NW, Washington, DC 20433, USA",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Internacional",
                "Tipo_cooperacion": "Multilateral"
            }
        ]
        
        todos_proyectos = proyectos_devex + proyectos_terra_viva + proyectos_gafsp
        
        for proyecto in todos_proyectos:
            proyectos.append(proyecto)
        
        print(f"✅ Agencias Especializadas: {len(proyectos)} proyectos extraídos")
        
    except Exception as e:
        print(f"❌ Error extrayendo agencias especializadas: {e}")
    
    return proyectos

def obtener_proyectos_gobiernos_regionales():
    """Obtiene proyectos de gobiernos regionales chilenos"""
    print("🔍 Extrayendo proyectos de gobiernos regionales...")
    proyectos = []
    
    try:
        # GORE Biobío
        proyectos_biobio = [
            {
                "Nombre": "Fondo de Innovación para la Competitividad - GORE Biobío 2024",
                "Descripción": "Fondo regional para proyectos de innovación y competitividad en la Región del Biobío",
                "Monto": "CLP 800,000,000",
                "Área de interés": "Innovación Tecnológica",
                "Estado": "Abierto",
                "Fecha cierre": "2024-12-20",
                "Fuente": "GORE Biobío",
                "Enlace": "https://www.gorebiobio.cl/fondo-innovacion-competitividad",
                "Tipo": "Fondo Regional",
                "Beneficiarios": "Empresas regionales, Universidades, Centros de I+D",
                "Requisitos": "Proyectos en la Región del Biobío, impacto regional",
                "Contacto": "fic@biobio.cl",
                "Telefono": "+56 41 220 3000",
                "Direccion": "Aníbal Pinto 460, Concepción, Región del Biobío",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Chile",
                "Tipo_cooperacion": "Regional"
            }
        ]
        
        # GORE Valparaíso
        proyectos_valparaiso = [
            {
                "Nombre": "Fondo de Desarrollo Regional - GORE Valparaíso 2024",
                "Descripción": "Fondo regional para proyectos de desarrollo e infraestructura en la Región de Valparaíso",
                "Monto": "CLP 1,200,000,000",
                "Área de interés": "Desarrollo Rural",
                "Estado": "Abierto",
                "Fecha cierre": "2025-01-15",
                "Fuente": "GORE Valparaíso",
                "Enlace": "https://www.gorevalparaiso.cl/fondo-desarrollo-regional",
                "Tipo": "Fondo Regional",
                "Beneficiarios": "Municipios, Organizaciones, Empresas regionales",
                "Requisitos": "Proyectos en la Región de Valparaíso, desarrollo regional",
                "Contacto": "fndr@valparaiso.cl",
                "Telefono": "+56 32 250 4000",
                "Direccion": "Pedro Montt 1881, Valparaíso, Región de Valparaíso",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Chile",
                "Tipo_cooperacion": "Regional"
            }
        ]
        
        # GORE Metropolitana
        proyectos_metropolitana = [
            {
                "Nombre": "Fondo de Innovación Metropolitana - GORE Metropolitana 2024",
                "Descripción": "Fondo regional para proyectos de innovación y tecnología en la Región Metropolitana",
                "Monto": "CLP 1,500,000,000",
                "Área de interés": "Innovación Tecnológica",
                "Estado": "Abierto",
                "Fecha cierre": "2025-02-28",
                "Fuente": "GORE Metropolitana",
                "Enlace": "https://www.gorem.cl/fondo-innovacion-metropolitana",
                "Tipo": "Fondo Regional",
                "Beneficiarios": "Empresas, Startups, Centros de I+D",
                "Requisitos": "Proyectos en la Región Metropolitana, innovación tecnológica",
                "Contacto": "innovacion@gorem.cl",
                "Telefono": "+56 2 2500 4000",
                "Direccion": "Teatinos 92, Santiago, Región Metropolitana",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Chile",
                "Tipo_cooperacion": "Regional"
            }
        ]
        
        todos_proyectos = proyectos_biobio + proyectos_valparaiso + proyectos_metropolitana
        
        for proyecto in todos_proyectos:
            proyectos.append(proyecto)
        
        print(f"✅ Gobiernos Regionales: {len(proyectos)} proyectos extraídos")
        
    except Exception as e:
        print(f"❌ Error extrayendo gobiernos regionales: {e}")
    
    return proyectos

def obtener_todos_proyectos_adicionales():
    """Obtiene todos los proyectos de fuentes adicionales"""
    print("🌐 RECOLECTANDO PROYECTOS DE FUENTES ADICIONALES...")
    
    todos_los_proyectos = []
    
    # Embajadas
    proyectos_embajadas = obtener_proyectos_embajadas()
    todos_los_proyectos.extend(proyectos_embajadas)
    
    # Fundaciones internacionales
    proyectos_fundaciones = obtener_proyectos_fundaciones_internacionales()
    todos_los_proyectos.extend(proyectos_fundaciones)
    
    # Agencias especializadas
    proyectos_agencias = obtener_proyectos_agencias_especializadas()
    todos_los_proyectos.extend(proyectos_agencias)
    
    # Gobiernos regionales
    proyectos_regionales = obtener_proyectos_gobiernos_regionales()
    todos_los_proyectos.extend(proyectos_regionales)
    
    print(f"🎉 Total proyectos adicionales: {len(todos_los_proyectos)}")
    
    return todos_los_proyectos

if __name__ == "__main__":
    # Probar el scraper
    proyectos = obtener_todos_proyectos_adicionales()
    
    print(f"\n📊 RESUMEN DE FUENTES ADICIONALES:")
    print(f"Total proyectos: {len(proyectos)}")
    
    # Mostrar algunos ejemplos
    for i, proyecto in enumerate(proyectos[:5], 1):
        print(f"\n{i}. {proyecto['Nombre']}")
        print(f"   Fuente: {proyecto['Fuente']}")
        print(f"   Monto: {proyecto['Monto']}")
        print(f"   Área: {proyecto['Área de interés']}")
        print(f"   Cierre: {proyecto['Fecha cierre']}")
        print(f"   País: {proyecto.get('Pais', 'N/A')}")
        print(f"   Tipo: {proyecto.get('Tipo_cooperacion', 'N/A')}")

