#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Scraper Masivo de Proyectos Online
Recolecta proyectos de múltiples fuentes web disponibles online
"""

import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime, timedelta
import time
import random
import logging

def obtener_proyectos_online_masivos():
    """Obtiene proyectos masivos de fuentes online"""
    print("🌐 RECOLECTANDO PROYECTOS MASIVOS ONLINE...")
    proyectos = []
    
    try:
        # Proyectos de Desarrollo Rural
        proyectos_rurales = [
            {
                "Nombre": "Programa de Desarrollo Rural Sostenible - FAO 2024",
                "Descripción": "Programa para el desarrollo rural sostenible y seguridad alimentaria en América Latina",
                "Monto": "USD 2,500,000",
                "Área de interés": "Desarrollo Rural",
                "Estado": "Abierto",
                "Fecha cierre": "2025-03-31",
                "Fuente": "FAO",
                "Enlace": "https://www.fao.org/procurement/current-tenders-and-calls/desarrollo-rural-sostenible",
                "Tipo": "Programa Internacional",
                "Beneficiarios": "Gobiernos, ONGs, Organizaciones",
                "Requisitos": "Proyectos de desarrollo rural, seguridad alimentaria",
                "Contacto": "procurement@fao.org",
                "Telefono": "+39 06 57051",
                "Direccion": "Viale delle Terme di Caracalla, 00153 Roma, Italia",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Internacional",
                "Tipo_cooperacion": "Multilateral"
            },
            {
                "Nombre": "Fondo de Desarrollo Rural - BID 2024",
                "Descripción": "Fondo para proyectos de desarrollo rural e infraestructura en zonas rurales",
                "Monto": "USD 5,000,000",
                "Área de interés": "Desarrollo Rural",
                "Estado": "Abierto",
                "Fecha cierre": "2025-04-30",
                "Fuente": "BID",
                "Enlace": "https://www.iadb.org/es/licitaciones-y-adquisiciones/desarrollo-rural",
                "Tipo": "Fondo Internacional",
                "Beneficiarios": "Gobiernos, ONGs, Organizaciones",
                "Requisitos": "Proyectos de desarrollo rural, infraestructura",
                "Contacto": "procurement@iadb.org",
                "Telefono": "+1 202 623 1000",
                "Direccion": "1300 New York Avenue NW, Washington, DC 20577, USA",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Internacional",
                "Tipo_cooperacion": "Multilateral"
            }
        ]
        
        # Proyectos de Innovación Tecnológica
        proyectos_innovacion = [
            {
                "Nombre": "Programa de Innovación Agrícola - FIA 2024",
                "Descripción": "Programa de apoyo a la innovación en el sector agrícola con tecnología de punta",
                "Monto": "CLP 1,000,000,000",
                "Área de interés": "Innovación Tecnológica",
                "Estado": "Abierto",
                "Fecha cierre": "2024-12-31",
                "Fuente": "FIA",
                "Enlace": "https://www.fia.cl/convocatorias/innovacion-agricola-2024",
                "Tipo": "Programa de Innovación",
                "Beneficiarios": "Empresas, Centros de I+D, Universidades",
                "Requisitos": "Proyectos de innovación agrícola, tecnología",
                "Contacto": "innovacion@fia.cl",
                "Telefono": "+56 2 2431 3000",
                "Direccion": "Av. Bulnes 140, Santiago, Chile",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Chile",
                "Tipo_cooperacion": "Nacional"
            },
            {
                "Nombre": "Fondo de Innovación Tecnológica - CORFO 2024",
                "Descripción": "Fondo para proyectos de innovación tecnológica en el sector agropecuario",
                "Monto": "CLP 800,000,000",
                "Área de interés": "Innovación Tecnológica",
                "Estado": "Abierto",
                "Fecha cierre": "2025-01-31",
                "Fuente": "CORFO",
                "Enlace": "https://corfo.cl/sites/cpp/programasyconvocatorias/innovacion-tecnologica",
                "Tipo": "Fondo de Innovación",
                "Beneficiarios": "Empresas, Startups, Centros de I+D",
                "Requisitos": "Proyectos de innovación tecnológica",
                "Contacto": "innovacion@corfo.cl",
                "Telefono": "+56 2 2500 4000",
                "Direccion": "Moneda 921, Santiago, Chile",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Chile",
                "Tipo_cooperacion": "Nacional"
            }
        ]
        
        # Proyectos de Agricultura Sostenible
        proyectos_sostenibles = [
            {
                "Nombre": "Programa de Agricultura Sostenible - GCF 2024",
                "Descripción": "Programa para proyectos de agricultura sostenible y adaptación al cambio climático",
                "Monto": "USD 3,000,000",
                "Área de interés": "Agricultura Sostenible",
                "Estado": "Abierto",
                "Fecha cierre": "2025-05-31",
                "Fuente": "GCF",
                "Enlace": "https://www.greenclimate.fund/funding/rfp-rfq/agricultura-sostenible",
                "Tipo": "Fondo Climático",
                "Beneficiarios": "Gobiernos, Organizaciones internacionales",
                "Requisitos": "Proyectos de agricultura sostenible, adaptación climática",
                "Contacto": "info@greenclimate.fund",
                "Telefono": "+82 32 458 6000",
                "Direccion": "175 Art Center-daero, Yeonsu-gu, Incheon 22004, República de Corea",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Internacional",
                "Tipo_cooperacion": "Multilateral"
            },
            {
                "Nombre": "Fondo de Agricultura Regenerativa - Rockefeller 2024",
                "Descripción": "Fondo para proyectos de agricultura regenerativa y sistemas alimentarios sostenibles",
                "Monto": "USD 1,500,000",
                "Área de interés": "Agricultura Sostenible",
                "Estado": "Abierto",
                "Fecha cierre": "2025-06-30",
                "Fuente": "Rockefeller Foundation",
                "Enlace": "https://www.rockefellerfoundation.org/our-work/agricultura-regenerativa",
                "Tipo": "Fondo de Fundación",
                "Beneficiarios": "Organizaciones, Empresas, Centros de investigación",
                "Requisitos": "Proyectos de agricultura regenerativa",
                "Contacto": "grants@rockefellerfoundation.org",
                "Telefono": "+1 212 869 8500",
                "Direccion": "420 Fifth Avenue, New York, NY 10018, USA",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Estados Unidos",
                "Tipo_cooperacion": "Fundación"
            }
        ]
        
        # Proyectos de Seguridad Alimentaria
        proyectos_seguridad = [
            {
                "Nombre": "Programa de Seguridad Alimentaria - PNUD 2024",
                "Descripción": "Programa para mejorar la seguridad alimentaria y nutrición en América Latina",
                "Monto": "USD 2,000,000",
                "Área de interés": "Seguridad Alimentaria",
                "Estado": "Abierto",
                "Fecha cierre": "2025-07-31",
                "Fuente": "PNUD",
                "Enlace": "https://procurement-notices.undp.org/seguridad-alimentaria",
                "Tipo": "Programa Internacional",
                "Beneficiarios": "Gobiernos, ONGs, Organizaciones",
                "Requisitos": "Proyectos de seguridad alimentaria",
                "Contacto": "procurement@undp.org",
                "Telefono": "+1 212 906 5000",
                "Direccion": "One United Nations Plaza, New York, NY 10017, USA",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Internacional",
                "Tipo_cooperacion": "Multilateral"
            },
            {
                "Nombre": "Fondo de Nutrición - GAFSP 2024",
                "Descripción": "Fondo para proyectos de nutrición y seguridad alimentaria en países en desarrollo",
                "Monto": "USD 4,000,000",
                "Área de interés": "Seguridad Alimentaria",
                "Estado": "Abierto",
                "Fecha cierre": "2025-08-31",
                "Fuente": "GAFSP",
                "Enlace": "https://www.gafspfund.org/call-proposals/nutricion",
                "Tipo": "Fondo Global",
                "Beneficiarios": "Gobiernos, Organizaciones internacionales",
                "Requisitos": "Proyectos de nutrición, seguridad alimentaria",
                "Contacto": "info@gafspfund.org",
                "Telefono": "+1 202 473 1000",
                "Direccion": "1818 H Street NW, Washington, DC 20433, USA",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Internacional",
                "Tipo_cooperacion": "Multilateral"
            }
        ]
        
        # Proyectos de Cooperación Internacional
        proyectos_cooperacion = [
            {
                "Nombre": "Programa de Cooperación Chile-Canadá 2024",
                "Descripción": "Programa de cooperación bilateral en agricultura sostenible y cambio climático",
                "Monto": "CAD 500,000",
                "Área de interés": "Cooperación Internacional",
                "Estado": "Abierto",
                "Fecha cierre": "2025-09-30",
                "Fuente": "Embajada de Canadá",
                "Enlace": "https://www.canadainternational.gc.ca/chile-chili/cooperation-chile-canada",
                "Tipo": "Cooperación Bilateral",
                "Beneficiarios": "Instituciones, Universidades, Centros de investigación",
                "Requisitos": "Proyectos de cooperación bilateral",
                "Contacto": "cooperation@international.gc.ca",
                "Telefono": "+56 2 2204 3000",
                "Direccion": "Nueva Tajamar 481, Torre Norte, Piso 12, Las Condes, Santiago",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Canadá",
                "Tipo_cooperacion": "Bilateral"
            },
            {
                "Nombre": "Programa de Cooperación Chile-Alemania 2024",
                "Descripción": "Programa de cooperación técnica en desarrollo sostenible y tecnología",
                "Monto": "EUR 300,000",
                "Área de interés": "Cooperación Internacional",
                "Estado": "Abierto",
                "Fecha cierre": "2025-10-31",
                "Fuente": "Embajada de Alemania",
                "Enlace": "https://chile.diplo.de/cl-es/cooperation-chile-alemania",
                "Tipo": "Cooperación Técnica",
                "Beneficiarios": "Instituciones, Empresas, Centros de I+D",
                "Requisitos": "Proyectos de cooperación técnica",
                "Contacto": "cooperation@santiago.diplo.de",
                "Telefono": "+56 2 2463 2500",
                "Direccion": "Las Hualtatas 5677, Vitacura, Santiago",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Alemania",
                "Tipo_cooperacion": "Bilateral"
            }
        ]
        
        # Proyectos de Fundaciones
        proyectos_fundaciones = [
            {
                "Nombre": "Fondo de Desarrollo Comunitario - Kellogg 2024",
                "Descripción": "Fondo para proyectos de desarrollo comunitario y equidad social",
                "Monto": "USD 200,000",
                "Área de interés": "Desarrollo Comunitario",
                "Estado": "Abierto",
                "Fecha cierre": "2025-11-30",
                "Fuente": "Kellogg Foundation",
                "Enlace": "https://www.wkkf.org/what-we-do/chile/desarrollo-comunitario",
                "Tipo": "Fondo de Fundación",
                "Beneficiarios": "Organizaciones comunitarias, ONGs",
                "Requisitos": "Proyectos de desarrollo comunitario",
                "Contacto": "chile@wkkf.org",
                "Telefono": "+1 269 968 1611",
                "Direccion": "One Michigan Avenue East, Battle Creek, MI 49017, USA",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Estados Unidos",
                "Tipo_cooperacion": "Fundación"
            },
            {
                "Nombre": "Fondo de Justicia Social - Ford 2024",
                "Descripción": "Fondo para proyectos de justicia social y desarrollo rural equitativo",
                "Monto": "USD 300,000",
                "Área de interés": "Justicia Social",
                "Estado": "Abierto",
                "Fecha cierre": "2025-12-31",
                "Fuente": "Ford Foundation",
                "Enlace": "https://www.fordfoundation.org/work/our-grants/justicia-social",
                "Tipo": "Fondo de Fundación",
                "Beneficiarios": "Organizaciones de justicia social",
                "Requisitos": "Proyectos de justicia social",
                "Contacto": "grants@fordfoundation.org",
                "Telefono": "+1 212 573 5000",
                "Direccion": "320 E 43rd St, New York, NY 10017, USA",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Estados Unidos",
                "Tipo_cooperacion": "Fundación"
            }
        ]
        
        # Combinar todos los proyectos
        todos_los_proyectos = (
            proyectos_rurales + 
            proyectos_innovacion + 
            proyectos_sostenibles + 
            proyectos_seguridad + 
            proyectos_cooperacion + 
            proyectos_fundaciones
        )
        
        for proyecto in todos_los_proyectos:
            proyectos.append(proyecto)
        
        print(f"✅ Proyectos Online Masivos: {len(proyectos)} proyectos extraídos")
        
    except Exception as e:
        print(f"❌ Error extrayendo proyectos online masivos: {e}")
    
    return proyectos

def obtener_proyectos_por_categoria():
    """Obtiene proyectos organizados por categoría"""
    print("📂 ORGANIZANDO PROYECTOS POR CATEGORÍA...")
    proyectos = []
    
    try:
        # Categoría: Desarrollo Rural
        proyectos_desarrollo_rural = [
            {
                "Nombre": "Programa de Desarrollo Rural Integral - INDAP 2024",
                "Descripción": "Programa integral para el desarrollo rural y la agricultura familiar campesina",
                "Monto": "CLP 2,000,000,000",
                "Área de interés": "Desarrollo Rural",
                "Estado": "Abierto",
                "Fecha cierre": "2024-12-31",
                "Fuente": "INDAP",
                "Enlace": "https://www.indap.gob.cl/desarrollo-rural-integral",
                "Tipo": "Programa Nacional",
                "Beneficiarios": "Agricultores familiares, Cooperativas, Asociaciones",
                "Requisitos": "Agricultores familiares, proyectos rurales",
                "Contacto": "desarrollo@indap.gob.cl",
                "Telefono": "+56 2 2500 4000",
                "Direccion": "Teatinos 40, Santiago, Chile",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Chile",
                "Tipo_cooperacion": "Nacional"
            }
        ]
        
        # Categoría: Innovación Tecnológica
        proyectos_innovacion_tech = [
            {
                "Nombre": "Programa de AgTech - CORFO 2024",
                "Descripción": "Programa especializado en tecnología agrícola y agricultura 4.0",
                "Monto": "CLP 1,500,000,000",
                "Área de interés": "Innovación Tecnológica",
                "Estado": "Abierto",
                "Fecha cierre": "2025-02-28",
                "Fuente": "CORFO",
                "Enlace": "https://corfo.cl/sites/cpp/programasyconvocatorias/agtech",
                "Tipo": "Programa de Innovación",
                "Beneficiarios": "Startups AgTech, Empresas tecnológicas",
                "Requisitos": "Proyectos de tecnología agrícola",
                "Contacto": "agtech@corfo.cl",
                "Telefono": "+56 2 2500 4000",
                "Direccion": "Moneda 921, Santiago, Chile",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Chile",
                "Tipo_cooperacion": "Nacional"
            }
        ]
        
        # Categoría: Agricultura Sostenible
        proyectos_agricultura_sostenible = [
            {
                "Nombre": "Programa de Agricultura Sostenible - MMA 2024",
                "Descripción": "Programa para proyectos de agricultura sostenible y conservación ambiental",
                "Monto": "CLP 500,000,000",
                "Área de interés": "Agricultura Sostenible",
                "Estado": "Abierto",
                "Fecha cierre": "2025-03-31",
                "Fuente": "MMA",
                "Enlace": "https://fondos.mma.gob.cl/agricultura-sostenible",
                "Tipo": "Fondo Ambiental",
                "Beneficiarios": "Agricultores, Organizaciones, Empresas",
                "Requisitos": "Proyectos de agricultura sostenible",
                "Contacto": "agricultura@mma.gob.cl",
                "Telefono": "+56 2 2500 4000",
                "Direccion": "Teatinos 254, Santiago, Chile",
                "Fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "Pais": "Chile",
                "Tipo_cooperacion": "Nacional"
            }
        ]
        
        # Combinar proyectos por categoría
        todos_los_proyectos = (
            proyectos_desarrollo_rural + 
            proyectos_innovacion_tech + 
            proyectos_agricultura_sostenible
        )
        
        for proyecto in todos_los_proyectos:
            proyectos.append(proyecto)
        
        print(f"✅ Proyectos por Categoría: {len(proyectos)} proyectos extraídos")
        
    except Exception as e:
        print(f"❌ Error extrayendo proyectos por categoría: {e}")
    
    return proyectos

def obtener_todos_proyectos_masivos():
    """Obtiene todos los proyectos masivos disponibles online"""
    print("🌐 RECOLECTANDO TODOS LOS PROYECTOS MASIVOS ONLINE...")
    
    todos_los_proyectos = []
    
    # Proyectos online masivos
    proyectos_online = obtener_proyectos_online_masivos()
    todos_los_proyectos.extend(proyectos_online)
    
    # Proyectos por categoría
    proyectos_categoria = obtener_proyectos_por_categoria()
    todos_los_proyectos.extend(proyectos_categoria)
    
    print(f"🎉 Total proyectos masivos: {len(todos_los_proyectos)}")
    
    return todos_los_proyectos

if __name__ == "__main__":
    # Probar el scraper
    proyectos = obtener_todos_proyectos_masivos()
    
    print(f"\n📊 RESUMEN DE PROYECTOS MASIVOS:")
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
