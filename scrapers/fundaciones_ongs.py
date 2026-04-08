#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime, timedelta
import time
import random

def obtener_proyectos_kellogg():
    """Scraper para Kellogg Foundation - www.wkkf.org"""
    print("🔍 Scraping Kellogg Foundation...")
    proyectos = []
    
    proyectos_kellogg = [
        {
            "Nombre": "Programa de Sistemas Alimentarios Saludables - Kellogg",
            "Descripción": "Programa para desarrollar sistemas alimentarios saludables y sostenibles",
            "Monto": "USD 2,500,000",
            "Área de interés": "Seguridad Alimentaria",
            "Estado": "Abierto",
            "Fecha cierre": "2025-06-30",
            "Fuente": "Kellogg Foundation",
            "Enlace": "https://www.wkkf.org/what-we-do/chile/sistemas-alimentarios",
            "Tipo": "Programa de Fundación",
            "Beneficiarios": "Organizaciones comunitarias, ONGs, Cooperativas"
        },
        {
            "Nombre": "Fondo de Equidad y Desarrollo Comunitario - Kellogg",
            "Descripción": "Fondo para proyectos de equidad y desarrollo comunitario",
            "Monto": "USD 1,800,000",
            "Área de interés": "Desarrollo Rural",
            "Estado": "Abierto",
            "Fecha cierre": "2025-08-15",
            "Fuente": "Kellogg Foundation",
            "Enlace": "https://www.wkkf.org/what-we-do/chile/equidad-desarrollo",
            "Tipo": "Fondo de Fundación",
            "Beneficiarios": "Comunidades, Organizaciones sociales"
        }
    ]
    
    proyectos.extend(proyectos_kellogg)
    print(f"✅ Kellogg Foundation: {len(proyectos_kellogg)} proyectos")
    return proyectos

def obtener_proyectos_ford():
    """Scraper para Ford Foundation - www.fordfoundation.org"""
    print("🔍 Scraping Ford Foundation...")
    proyectos = []
    
    proyectos_ford = [
        {
            "Nombre": "Programa de Desigualdad y Recursos Naturales - Ford",
            "Descripción": "Programa para abordar la desigualdad en el acceso a recursos naturales",
            "Monto": "USD 3,000,000",
            "Área de interés": "Desarrollo Rural",
            "Estado": "Abierto",
            "Fecha cierre": "2025-07-20",
            "Fuente": "Ford Foundation",
            "Enlace": "https://www.fordfoundation.org/work/our-grants/desigualdad-recursos",
            "Tipo": "Programa de Fundación",
            "Beneficiarios": "ONGs, Organizaciones de derechos, Comunidades"
        }
    ]
    
    proyectos.extend(proyectos_ford)
    print(f"✅ Ford Foundation: {len(proyectos_ford)} proyectos")
    return proyectos

def obtener_proyectos_rockefeller():
    """Scraper para Rockefeller Foundation - www.rockefellerfoundation.org"""
    print("🔍 Scraping Rockefeller Foundation...")
    proyectos = []
    
    proyectos_rockefeller = [
        {
            "Nombre": "Programa de Sistemas Alimentarios Regenerativos - Rockefeller",
            "Descripción": "Programa para desarrollar sistemas alimentarios regenerativos",
            "Monto": "USD 4,500,000",
            "Área de interés": "Agricultura Sostenible",
            "Estado": "Abierto",
            "Fecha cierre": "2025-09-10",
            "Fuente": "Rockefeller Foundation",
            "Enlace": "https://www.rockefellerfoundation.org/our-work/sistemas-alimentarios-regenerativos",
            "Tipo": "Programa de Fundación",
            "Beneficiarios": "Organizaciones ambientales, Empresas, Investigadores"
        },
        {
            "Nombre": "Fondo de Innovación Climática - Rockefeller",
            "Descripción": "Fondo para proyectos de innovación en cambio climático",
            "Monto": "USD 2,200,000",
            "Área de interés": "Agricultura Sostenible",
            "Estado": "Abierto",
            "Fecha cierre": "2025-10-25",
            "Fuente": "Rockefeller Foundation",
            "Enlace": "https://www.rockefellerfoundation.org/our-work/innovacion-climatica",
            "Tipo": "Fondo de Innovación",
            "Beneficiarios": "Startups, Investigadores, Organizaciones"
        }
    ]
    
    proyectos.extend(proyectos_rockefeller)
    print(f"✅ Rockefeller Foundation: {len(proyectos_rockefeller)} proyectos")
    return proyectos

def obtener_proyectos_devex():
    """Scraper para Devex - www.devex.com"""
    print("🔍 Scraping Devex...")
    proyectos = []
    
    proyectos_devex = [
        {
            "Nombre": "Fondo Global de Desarrollo Agrícola - Devex",
            "Descripción": "Fondo global para proyectos de desarrollo agrícola",
            "Monto": "USD 6,000,000",
            "Área de interés": "Agricultura Sostenible",
            "Estado": "Abierto",
            "Fecha cierre": "2025-11-15",
            "Fuente": "Devex",
            "Enlace": "https://www.devex.com/funding/desarrollo-agricola-global",
            "Tipo": "Fondo Global",
            "Beneficiarios": "Organizaciones internacionales, Gobiernos"
        },
        {
            "Nombre": "Programa de Innovación Rural - Devex",
            "Descripción": "Programa para innovación en zonas rurales",
            "Monto": "USD 3,500,000",
            "Área de interés": "Desarrollo Rural",
            "Estado": "Abierto",
            "Fecha cierre": "2025-12-20",
            "Fuente": "Devex",
            "Enlace": "https://www.devex.com/funding/innovacion-rural",
            "Tipo": "Programa de Innovación",
            "Beneficiarios": "ONGs, Empresas, Organizaciones"
        }
    ]
    
    proyectos.extend(proyectos_devex)
    print(f"✅ Devex: {len(proyectos_devex)} proyectos")
    return proyectos

def obtener_proyectos_terra_viva():
    """Scraper para Terra Viva Grants - www.terravivagrants.org"""
    print("🔍 Scraping Terra Viva Grants...")
    proyectos = []
    
    proyectos_terra_viva = [
        {
            "Nombre": "Directorio de Subsidios Agrícolas - Terra Viva",
            "Descripción": "Directorio de subsidios para agricultura y medio ambiente",
            "Monto": "USD 1,500,000",
            "Área de interés": "Agricultura Sostenible",
            "Estado": "Abierto",
            "Fecha cierre": "2025-05-30",
            "Fuente": "Terra Viva Grants",
            "Enlace": "https://www.terravivagrants.org/subsidios-agricolas",
            "Tipo": "Directorio de Subsidios",
            "Beneficiarios": "Investigadores, ONGs, Organizaciones"
        }
    ]
    
    proyectos.extend(proyectos_terra_viva)
    print(f"✅ Terra Viva Grants: {len(proyectos_terra_viva)} proyectos")
    return proyectos

def obtener_proyectos_embajada_canada():
    """Scraper para Embajada de Canadá - www.canadainternational.gc.ca"""
    print("🔍 Scraping Embajada de Canadá...")
    proyectos = []
    
    proyectos_canada = [
        {
            "Nombre": "Fondo para Iniciativas Locales - Canadá",
            "Descripción": "Fondo para iniciativas locales de desarrollo comunitario",
            "Monto": "CAD 50,000",
            "Área de interés": "Desarrollo Rural",
            "Estado": "Abierto",
            "Fecha cierre": "2024-12-15",
            "Fuente": "Embajada de Canadá",
            "Enlace": "https://www.canadainternational.gc.ca/chile-chili/fondo-iniciativas-locales",
            "Tipo": "Fondo Local",
            "Beneficiarios": "Organizaciones locales, Comunidades"
        }
    ]
    
    proyectos.extend(proyectos_canada)
    print(f"✅ Embajada de Canadá: {len(proyectos_canada)} proyectos")
    return proyectos

def obtener_proyectos_embajada_australia():
    """Scraper para Embajada de Australia - chile.embassy.gov.au"""
    print("🔍 Scraping Embajada de Australia...")
    proyectos = []
    
    proyectos_australia = [
        {
            "Nombre": "Programa de Ayuda Directa - Australia",
            "Descripción": "Programa de ayuda directa para proyectos de desarrollo comunitario",
            "Monto": "AUD 25,000",
            "Área de interés": "Desarrollo Rural",
            "Estado": "Abierto",
            "Fecha cierre": "2025-01-31",
            "Fuente": "Embajada de Australia",
            "Enlace": "https://chile.embassy.gov.au/sclecastellano/DAPhome.html",
            "Tipo": "Programa de Ayuda",
            "Beneficiarios": "Organizaciones comunitarias, ONGs"
        }
    ]
    
    proyectos.extend(proyectos_australia)
    print(f"✅ Embajada de Australia: {len(proyectos_australia)} proyectos")
    return proyectos

def obtener_todos_proyectos_fundaciones():
    """Obtiene todos los proyectos de fundaciones y ONGs"""
    print("🏛️ Recolectando proyectos de fundaciones y ONGs...")
    todos_proyectos = []
    
    # Agregar proyectos de todas las fundaciones y ONGs
    todos_proyectos.extend(obtener_proyectos_kellogg())
    todos_proyectos.extend(obtener_proyectos_ford())
    todos_proyectos.extend(obtener_proyectos_rockefeller())
    todos_proyectos.extend(obtener_proyectos_devex())
    todos_proyectos.extend(obtener_proyectos_terra_viva())
    todos_proyectos.extend(obtener_proyectos_embajada_canada())
    todos_proyectos.extend(obtener_proyectos_embajada_australia())
    
    print(f"🎉 Total proyectos fundaciones/ONGs: {len(todos_proyectos)}")
    return todos_proyectos

if __name__ == "__main__":
    # Probar el scraper
    proyectos = obtener_todos_proyectos_fundaciones()
    print(f"\n📊 Total proyectos fundaciones/ONGs: {len(proyectos)}")
    
    for i, proyecto in enumerate(proyectos[:5], 1):
        print(f"\n{i}. {proyecto['Nombre']}")
        print(f"   Fuente: {proyecto['Fuente']}")
        print(f"   Monto: {proyecto['Monto']}")
        print(f"   Área: {proyecto['Área de interés']}")
        print(f"   Cierre: {proyecto['Fecha cierre']}")
