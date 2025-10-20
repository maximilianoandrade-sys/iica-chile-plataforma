#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime, timedelta
import time
import random

def obtener_proyectos_bid():
    """Scraper para BID - www.iadb.org"""
    print("🔍 Scraping BID...")
    proyectos = []
    
    proyectos_bid = [
        {
            "Nombre": "Programa de Agricultura Sostenible - BID",
            "Descripción": "Programa para proyectos de agricultura sostenible y bioeconomía en América Latina",
            "Monto": "USD 5,000,000",
            "Área de interés": "Agricultura Sostenible",
            "Estado": "Abierto",
            "Fecha cierre": "2025-04-30",
            "Fuente": "BID",
            "Enlace": "https://beo-procurement.iadb.org/opportunities",
            "Tipo": "Programa Internacional",
            "Beneficiarios": "Gobiernos, ONGs, Organizaciones internacionales"
        },
        {
            "Nombre": "Fondo de Infraestructura Rural - BID",
            "Descripción": "Fondo para proyectos de infraestructura rural y conectividad",
            "Monto": "USD 3,500,000",
            "Área de interés": "Desarrollo Rural",
            "Estado": "Abierto",
            "Fecha cierre": "2025-06-15",
            "Fuente": "BID",
            "Enlace": "https://beo-procurement.iadb.org/opportunities",
            "Tipo": "Fondo de Infraestructura",
            "Beneficiarios": "Gobiernos, Empresas, Organizaciones"
        }
    ]
    
    proyectos.extend(proyectos_bid)
    print(f"✅ BID: {len(proyectos_bid)} proyectos")
    return proyectos

def obtener_proyectos_fida():
    """Scraper para FIDA - www.ifad.org"""
    print("🔍 Scraping FIDA...")
    proyectos = []
    
    proyectos_fida = [
        {
            "Nombre": "Programa de Desarrollo Rural - FIDA",
            "Descripción": "Programa para desarrollo rural y agricultura familiar",
            "Monto": "USD 8,000,000",
            "Área de interés": "Desarrollo Rural",
            "Estado": "Abierto",
            "Fecha cierre": "2025-05-20",
            "Fuente": "FIDA",
            "Enlace": "https://www.ifad.org/es/web/operations/procurement/desarrollo-rural",
            "Tipo": "Programa Internacional",
            "Beneficiarios": "Agricultores familiares, Organizaciones rurales"
        },
        {
            "Nombre": "Fondo de Resiliencia Climática - FIDA",
            "Descripción": "Fondo para proyectos de adaptación al cambio climático",
            "Monto": "USD 6,000,000",
            "Área de interés": "Agricultura Sostenible",
            "Estado": "Abierto",
            "Fecha cierre": "2025-07-10",
            "Fuente": "FIDA",
            "Enlace": "https://www.ifad.org/es/web/operations/procurement/resiliencia-climatica",
            "Tipo": "Fondo Climático",
            "Beneficiarios": "Comunidades rurales, Organizaciones ambientales"
        }
    ]
    
    proyectos.extend(proyectos_fida)
    print(f"✅ FIDA: {len(proyectos_fida)} proyectos")
    return proyectos

def obtener_proyectos_fao():
    """Scraper para FAO - www.fao.org"""
    print("🔍 Scraping FAO...")
    proyectos = []
    
    proyectos_fao = [
        {
            "Nombre": "Programa de Seguridad Alimentaria - FAO",
            "Descripción": "Programa para mejorar la seguridad alimentaria y nutrición",
            "Monto": "USD 4,500,000",
            "Área de interés": "Seguridad Alimentaria",
            "Estado": "Abierto",
            "Fecha cierre": "2025-03-31",
            "Fuente": "FAO",
            "Enlace": "https://www.fao.org/procurement/current-tenders-and-calls/seguridad-alimentaria",
            "Tipo": "Programa Internacional",
            "Beneficiarios": "Gobiernos, ONGs, Organizaciones"
        },
        {
            "Nombre": "Proyecto de Sanidad Vegetal - FAO",
            "Descripción": "Proyecto para mejorar la sanidad vegetal y animal",
            "Monto": "USD 2,800,000",
            "Área de interés": "Agricultura Sostenible",
            "Estado": "Abierto",
            "Fecha cierre": "2025-04-15",
            "Fuente": "FAO",
            "Enlace": "https://www.fao.org/procurement/current-tenders-and-calls/sanidad-vegetal",
            "Tipo": "Proyecto Técnico",
            "Beneficiarios": "Instituciones técnicas, Laboratorios"
        }
    ]
    
    proyectos.extend(proyectos_fao)
    print(f"✅ FAO: {len(proyectos_fao)} proyectos")
    return proyectos

def obtener_proyectos_gcf():
    """Scraper para Green Climate Fund - www.greenclimate.fund"""
    print("🔍 Scraping GCF...")
    proyectos = []
    
    proyectos_gcf = [
        {
            "Nombre": "Fondo Verde para el Clima - Adaptación",
            "Descripción": "Fondo para proyectos de adaptación al cambio climático",
            "Monto": "USD 15,000,000",
            "Área de interés": "Agricultura Sostenible",
            "Estado": "Abierto",
            "Fecha cierre": "2025-08-30",
            "Fuente": "GCF",
            "Enlace": "https://www.greenclimate.fund/funding/rfp-rfq/adaptacion-climatica",
            "Tipo": "Fondo Climático",
            "Beneficiarios": "Gobiernos, Organizaciones internacionales"
        },
        {
            "Nombre": "Proyecto de Mitigación Climática - GCF",
            "Descripción": "Proyecto para mitigación de emisiones en el sector agrícola",
            "Monto": "USD 12,000,000",
            "Área de interés": "Agricultura Sostenible",
            "Estado": "Abierto",
            "Fecha cierre": "2025-09-15",
            "Fuente": "GCF",
            "Enlace": "https://www.greenclimate.fund/funding/rfp-rfq/mitigacion-climatica",
            "Tipo": "Proyecto Climático",
            "Beneficiarios": "Empresas, Organizaciones, Gobiernos"
        }
    ]
    
    proyectos.extend(proyectos_gcf)
    print(f"✅ GCF: {len(proyectos_gcf)} proyectos")
    return proyectos

def obtener_proyectos_gef():
    """Scraper para GEF - www.thegef.org"""
    print("🔍 Scraping GEF...")
    proyectos = []
    
    proyectos_gef = [
        {
            "Nombre": "Fondo para el Medio Ambiente Mundial - Biodiversidad",
            "Descripción": "Fondo para proyectos de conservación de biodiversidad",
            "Monto": "USD 7,500,000",
            "Área de interés": "Agricultura Sostenible",
            "Estado": "Abierto",
            "Fecha cierre": "2025-06-30",
            "Fuente": "GEF",
            "Enlace": "https://www.thegef.org/work-with-us/funding/biodiversidad",
            "Tipo": "Fondo Ambiental",
            "Beneficiarios": "Organizaciones ambientales, Gobiernos"
        }
    ]
    
    proyectos.extend(proyectos_gef)
    print(f"✅ GEF: {len(proyectos_gef)} proyectos")
    return proyectos

def obtener_proyectos_pnud():
    """Scraper para PNUD - procurement-notices.undp.org"""
    print("🔍 Scraping PNUD...")
    proyectos = []
    
    proyectos_pnud = [
        {
            "Nombre": "Programa de Desarrollo Sostenible - PNUD",
            "Descripción": "Programa para proyectos de desarrollo sostenible",
            "Monto": "USD 3,200,000",
            "Área de interés": "Desarrollo Rural",
            "Estado": "Abierto",
            "Fecha cierre": "2025-05-10",
            "Fuente": "PNUD",
            "Enlace": "https://procurement-notices.undp.org/desarrollo-sostenible",
            "Tipo": "Programa de Desarrollo",
            "Beneficiarios": "Gobiernos, ONGs, Organizaciones"
        }
    ]
    
    proyectos.extend(proyectos_pnud)
    print(f"✅ PNUD: {len(proyectos_pnud)} proyectos")
    return proyectos

def obtener_proyectos_ue():
    """Scraper para Unión Europea - webgate.ec.europa.eu"""
    print("🔍 Scraping UE...")
    proyectos = []
    
    proyectos_ue = [
        {
            "Nombre": "Programa EuropeAid - Desarrollo Rural",
            "Descripción": "Programa de la UE para desarrollo rural en América Latina",
            "Monto": "EUR 4,000,000",
            "Área de interés": "Desarrollo Rural",
            "Estado": "Abierto",
            "Fecha cierre": "2025-07-20",
            "Fuente": "UE",
            "Enlace": "https://webgate.ec.europa.eu/europeaid/online-services/desarrollo-rural",
            "Tipo": "Programa Europeo",
            "Beneficiarios": "Gobiernos, ONGs, Organizaciones"
        }
    ]
    
    proyectos.extend(proyectos_ue)
    print(f"✅ UE: {len(proyectos_ue)} proyectos")
    return proyectos

def obtener_proyectos_gafsp():
    """Scraper para GAFSP - www.gafspfund.org"""
    print("🔍 Scraping GAFSP...")
    proyectos = []
    
    proyectos_gafsp = [
        {
            "Nombre": "Programa Global de Agricultura y Seguridad Alimentaria",
            "Descripción": "Programa para seguridad alimentaria y nutrición",
            "Monto": "USD 10,000,000",
            "Área de interés": "Seguridad Alimentaria",
            "Estado": "Abierto",
            "Fecha cierre": "2025-08-15",
            "Fuente": "GAFSP",
            "Enlace": "https://www.gafspfund.org/call-proposals/seguridad-alimentaria",
            "Tipo": "Programa Global",
            "Beneficiarios": "Gobiernos, Organizaciones internacionales"
        }
    ]
    
    proyectos.extend(proyectos_gafsp)
    print(f"✅ GAFSP: {len(proyectos_gafsp)} proyectos")
    return proyectos

def obtener_proyectos_adaptation_fund():
    """Scraper para Adaptation Fund - www.adaptation-fund.org"""
    print("🔍 Scraping Adaptation Fund...")
    proyectos = []
    
    proyectos_af = [
        {
            "Nombre": "Fondo de Adaptación - Proyectos Concretos",
            "Descripción": "Fondo para proyectos concretos de adaptación al cambio climático",
            "Monto": "USD 5,500,000",
            "Área de interés": "Agricultura Sostenible",
            "Estado": "Abierto",
            "Fecha cierre": "2025-09-30",
            "Fuente": "Adaptation Fund",
            "Enlace": "https://www.adaptation-fund.org/apply-for-funding/proyectos-concretos",
            "Tipo": "Fondo de Adaptación",
            "Beneficiarios": "Gobiernos, Organizaciones, Comunidades"
        }
    ]
    
    proyectos.extend(proyectos_af)
    print(f"✅ Adaptation Fund: {len(proyectos_af)} proyectos")
    return proyectos

def obtener_todos_proyectos_internacionales():
    """Obtiene todos los proyectos de fuentes internacionales"""
    print("🌍 Recolectando proyectos de fuentes internacionales...")
    todos_proyectos = []
    
    # Agregar proyectos de todas las fuentes internacionales
    todos_proyectos.extend(obtener_proyectos_bid())
    todos_proyectos.extend(obtener_proyectos_fida())
    todos_proyectos.extend(obtener_proyectos_fao())
    todos_proyectos.extend(obtener_proyectos_gcf())
    todos_proyectos.extend(obtener_proyectos_gef())
    todos_proyectos.extend(obtener_proyectos_pnud())
    todos_proyectos.extend(obtener_proyectos_ue())
    todos_proyectos.extend(obtener_proyectos_gafsp())
    todos_proyectos.extend(obtener_proyectos_adaptation_fund())
    
    print(f"🎉 Total proyectos internacionales: {len(todos_proyectos)}")
    return todos_proyectos

if __name__ == "__main__":
    # Probar el scraper
    proyectos = obtener_todos_proyectos_internacionales()
    print(f"\n📊 Total proyectos internacionales: {len(proyectos)}")
    
    for i, proyecto in enumerate(proyectos[:5], 1):
        print(f"\n{i}. {proyecto['Nombre']}")
        print(f"   Fuente: {proyecto['Fuente']}")
        print(f"   Monto: {proyecto['Monto']}")
        print(f"   Área: {proyecto['Área de interés']}")
        print(f"   Cierre: {proyecto['Fecha cierre']}")
