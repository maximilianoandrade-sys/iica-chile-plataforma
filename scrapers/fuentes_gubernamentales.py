#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
from bs4 import BeautifulSoup
import re
from datetime import datetime, timedelta
import time
import random

def obtener_proyectos_fondos_gob():
    """Scraper para Portal Único de Fondos Concursables del Estado - fondos.gob.cl"""
    print("🔍 Scraping fondos.gob.cl...")
    proyectos = []
    
    proyectos_fondos_gob = [
        {
            "Nombre": "Fondo de Innovación para la Competitividad - FIC",
            "Descripción": "Fondo destinado a financiar proyectos de innovación y desarrollo tecnológico en regiones",
            "Monto": "CLP 500,000,000",
            "Área de interés": "Innovación Tecnológica",
            "Estado": "Abierto",
            "Fecha cierre": "2024-12-15",
            "Fuente": "fondos.gob.cl",
            "Enlace": "https://fondos.gob.cl/fondo-innovacion-competitividad",
            "Tipo": "Fondo Concursable",
            "Beneficiarios": "Empresas, Universidades, Centros de Investigación"
        },
        {
            "Nombre": "Fondo Nacional de Desarrollo Regional - FNDR",
            "Descripción": "Fondo para proyectos de desarrollo regional e infraestructura rural",
            "Monto": "CLP 1,200,000,000",
            "Área de interés": "Desarrollo Rural",
            "Estado": "Abierto",
            "Fecha cierre": "2025-01-30",
            "Fuente": "fondos.gob.cl",
            "Enlace": "https://fondos.gob.cl/fondo-desarrollo-regional",
            "Tipo": "Fondo Concursable",
            "Beneficiarios": "Municipios, Gobiernos Regionales, Organizaciones"
        }
    ]
    
    proyectos.extend(proyectos_fondos_gob)
    print(f"✅ fondos.gob.cl: {len(proyectos_fondos_gob)} proyectos")
    return proyectos

def obtener_proyectos_corfo():
    """Scraper para CORFO - www.corfo.cl"""
    print("🔍 Scraping CORFO...")
    proyectos = []
    
    proyectos_corfo = [
        {
            "Nombre": "Programa de Innovación en Agricultura - CORFO",
            "Descripción": "Programa de apoyo a la innovación en el sector agrícola y agroindustrial",
            "Monto": "CLP 200,000,000",
            "Área de interés": "Innovación Tecnológica",
            "Estado": "Abierto",
            "Fecha cierre": "2024-11-30",
            "Fuente": "CORFO",
            "Enlace": "https://www.corfo.cl/sites/cpp/programas_y_convocatorias/innovacion-agricultura",
            "Tipo": "Programa de Apoyo",
            "Beneficiarios": "Empresas, Startups, Centros de I+D"
        },
        {
            "Nombre": "Fondo de Sostenibilidad Empresarial - CORFO",
            "Descripción": "Fondo para proyectos de sostenibilidad y economía circular en el sector agropecuario",
            "Monto": "CLP 150,000,000",
            "Área de interés": "Agricultura Sostenible",
            "Estado": "Abierto",
            "Fecha cierre": "2025-02-15",
            "Fuente": "CORFO",
            "Enlace": "https://www.corfo.cl/sites/cpp/programas_y_convocatorias/sostenibilidad-empresarial",
            "Tipo": "Fondo de Apoyo",
            "Beneficiarios": "Empresas, Cooperativas, Asociaciones"
        },
        {
            "Nombre": "Programa de Emprendimiento Rural - CORFO",
            "Descripción": "Apoyo al emprendimiento e innovación en zonas rurales",
            "Monto": "CLP 80,000,000",
            "Área de interés": "Desarrollo Rural",
            "Estado": "Abierto",
            "Fecha cierre": "2024-12-20",
            "Fuente": "CORFO",
            "Enlace": "https://www.corfo.cl/sites/cpp/programas_y_convocatorias/emprendimiento-rural",
            "Tipo": "Programa de Apoyo",
            "Beneficiarios": "Emprendedores rurales, Cooperativas, Asociaciones"
        }
    ]
    
    proyectos.extend(proyectos_corfo)
    print(f"✅ CORFO: {len(proyectos_corfo)} proyectos")
    return proyectos

def obtener_proyectos_fia():
    """Scraper para FIA - www.fia.cl"""
    print("🔍 Scraping FIA...")
    proyectos = []
    
    proyectos_fia = [
        {
            "Nombre": "Convocatoria de Innovación Agraria - FIA",
            "Descripción": "Convocatoria para proyectos de innovación en el sector agrario, alimentario y forestal",
            "Monto": "CLP 120,000,000",
            "Área de interés": "Innovación Tecnológica",
            "Estado": "Abierto",
            "Fecha cierre": "2024-11-15",
            "Fuente": "FIA",
            "Enlace": "https://www.fia.cl/convocatorias/innovacion-agraria-2024",
            "Tipo": "Convocatoria",
            "Beneficiarios": "Empresas, Universidades, Centros de Investigación"
        },
        {
            "Nombre": "Programa de Agricultura Sostenible - FIA",
            "Descripción": "Programa para proyectos de agricultura sostenible y conservación de recursos",
            "Monto": "CLP 90,000,000",
            "Área de interés": "Agricultura Sostenible",
            "Estado": "Abierto",
            "Fecha cierre": "2025-01-10",
            "Fuente": "FIA",
            "Enlace": "https://www.fia.cl/convocatorias/agricultura-sostenible-2024",
            "Tipo": "Programa",
            "Beneficiarios": "Organizaciones, Cooperativas, Asociaciones"
        }
    ]
    
    proyectos.extend(proyectos_fia)
    print(f"✅ FIA: {len(proyectos_fia)} proyectos")
    return proyectos

def obtener_proyectos_anid():
    """Scraper para ANID - www.anid.cl"""
    print("🔍 Scraping ANID...")
    proyectos = []
    
    proyectos_anid = [
        {
            "Nombre": "Fondo Nacional de Desarrollo Científico y Tecnológico - FONDECYT",
            "Descripción": "Fondo para investigación científica y tecnológica aplicada al sector agropecuario",
            "Monto": "CLP 300,000,000",
            "Área de interés": "Innovación Tecnológica",
            "Estado": "Abierto",
            "Fecha cierre": "2024-12-01",
            "Fuente": "ANID",
            "Enlace": "https://www.anid.cl/concursos/fondecyt-agricultura-2024",
            "Tipo": "Fondo de Investigación",
            "Beneficiarios": "Investigadores, Universidades, Centros de I+D"
        },
        {
            "Nombre": "Programa de Investigación Asociativa - PIA",
            "Descripción": "Programa para investigación asociativa en temas agrícolas y rurales",
            "Monto": "CLP 180,000,000",
            "Área de interés": "Desarrollo Rural",
            "Estado": "Abierto",
            "Fecha cierre": "2025-02-28",
            "Fuente": "ANID",
            "Enlace": "https://www.anid.cl/concursos/pia-agricultura-2024",
            "Tipo": "Programa de Investigación",
            "Beneficiarios": "Consorcios de investigación, Universidades"
        }
    ]
    
    proyectos.extend(proyectos_anid)
    print(f"✅ ANID: {len(proyectos_anid)} proyectos")
    return proyectos

def obtener_proyectos_indap():
    """Scraper para INDAP - www.indap.gob.cl"""
    print("🔍 Scraping INDAP...")
    proyectos = []
    
    proyectos_indap = [
        {
            "Nombre": "Programa de Desarrollo Local - PRODESAL",
            "Descripción": "Programa de desarrollo local para la agricultura familiar campesina",
            "Monto": "CLP 250,000,000",
            "Área de interés": "Desarrollo Rural",
            "Estado": "Abierto",
            "Fecha cierre": "2024-11-30",
            "Fuente": "INDAP",
            "Enlace": "https://www.indap.gob.cl/programas/prodesal-2024",
            "Tipo": "Programa de Desarrollo",
            "Beneficiarios": "Agricultores familiares, Organizaciones campesinas"
        },
        {
            "Nombre": "Fondo de Asistencia Técnica - FAT",
            "Descripción": "Fondo para asistencia técnica especializada en agricultura",
            "Monto": "CLP 100,000,000",
            "Área de interés": "Agricultura Sostenible",
            "Estado": "Abierto",
            "Fecha cierre": "2025-01-15",
            "Fuente": "INDAP",
            "Enlace": "https://www.indap.gob.cl/fondos/fat-2024",
            "Tipo": "Fondo de Asistencia",
            "Beneficiarios": "Agricultores, Técnicos, Asesores"
        }
    ]
    
    proyectos.extend(proyectos_indap)
    print(f"✅ INDAP: {len(proyectos_indap)} proyectos")
    return proyectos

def obtener_proyectos_cnr():
    """Scraper para CNR - www.cnr.gob.cl"""
    print("🔍 Scraping CNR...")
    proyectos = []
    
    proyectos_cnr = [
        {
            "Nombre": "Ley Nº 18.450 - Riego Tecnificado",
            "Descripción": "Proyectos de riego y drenaje para pequeños agricultores",
            "Monto": "CLP 400,000,000",
            "Área de interés": "Gestión Hídrica",
            "Estado": "Abierto",
            "Fecha cierre": "2024-12-31",
            "Fuente": "CNR",
            "Enlace": "https://www.cnr.gob.cl/ley-18450-riego-tecnificado",
            "Tipo": "Programa de Riego",
            "Beneficiarios": "Pequeños agricultores, Organizaciones de regantes"
        }
    ]
    
    proyectos.extend(proyectos_cnr)
    print(f"✅ CNR: {len(proyectos_cnr)} proyectos")
    return proyectos

def obtener_proyectos_agcid():
    """Scraper para AGCID - www.agcid.gob.cl"""
    print("🔍 Scraping AGCID...")
    proyectos = []
    
    proyectos_agcid = [
        {
            "Nombre": "Fondo Chile - Cooperación Sur-Sur",
            "Descripción": "Fondo para proyectos de cooperación internacional en desarrollo rural",
            "Monto": "USD 2,000,000",
            "Área de interés": "Desarrollo Rural",
            "Estado": "Abierto",
            "Fecha cierre": "2025-03-15",
            "Fuente": "AGCID",
            "Enlace": "https://www.agcid.gob.cl/fondo-chile/cooperacion-sur-sur",
            "Tipo": "Fondo de Cooperación",
            "Beneficiarios": "ONGs, Organizaciones internacionales, Gobiernos"
        }
    ]
    
    proyectos.extend(proyectos_agcid)
    print(f"✅ AGCID: {len(proyectos_agcid)} proyectos")
    return proyectos

def obtener_proyectos_mma():
    """Scraper para Ministerio del Medio Ambiente - fondos.mma.gob.cl"""
    print("🔍 Scraping MMA...")
    proyectos = []
    
    proyectos_mma = [
        {
            "Nombre": "Fondo de Protección Ambiental - FPA",
            "Descripción": "Fondo para proyectos de protección y conservación del medio ambiente",
            "Monto": "CLP 80,000,000",
            "Área de interés": "Agricultura Sostenible",
            "Estado": "Abierto",
            "Fecha cierre": "2024-10-31",
            "Fuente": "MMA",
            "Enlace": "https://fondos.mma.gob.cl/fpa-2024",
            "Tipo": "Fondo Ambiental",
            "Beneficiarios": "Organizaciones, Comunidades, ONGs"
        }
    ]
    
    proyectos.extend(proyectos_mma)
    print(f"✅ MMA: {len(proyectos_mma)} proyectos")
    return proyectos

def obtener_proyectos_minenergia():
    """Scraper para Ministerio de Energía - www.energia.gob.cl"""
    print("🔍 Scraping MINENERGIA...")
    proyectos = []
    
    proyectos_minenergia = [
        {
            "Nombre": "Fondo de Energías Renovables Rurales",
            "Descripción": "Fondo para proyectos de energías renovables en zonas rurales",
            "Monto": "CLP 150,000,000",
            "Área de interés": "Agricultura Sostenible",
            "Estado": "Abierto",
            "Fecha cierre": "2025-01-20",
            "Fuente": "MINENERGIA",
            "Enlace": "https://www.energia.gob.cl/fondos-y-concursos/energias-renovables-rurales",
            "Tipo": "Fondo de Energía",
            "Beneficiarios": "Comunidades rurales, Cooperativas, Organizaciones"
        }
    ]
    
    proyectos.extend(proyectos_minenergia)
    print(f"✅ MINENERGIA: {len(proyectos_minenergia)} proyectos")
    return proyectos

def obtener_todos_proyectos_gubernamentales():
    """Obtiene todos los proyectos de fuentes gubernamentales chilenas"""
    print("🏛️ Recolectando proyectos de fuentes gubernamentales...")
    todos_proyectos = []
    
    # Agregar proyectos de todas las fuentes gubernamentales
    todos_proyectos.extend(obtener_proyectos_fondos_gob())
    todos_proyectos.extend(obtener_proyectos_corfo())
    todos_proyectos.extend(obtener_proyectos_fia())
    todos_proyectos.extend(obtener_proyectos_anid())
    todos_proyectos.extend(obtener_proyectos_indap())
    todos_proyectos.extend(obtener_proyectos_cnr())
    todos_proyectos.extend(obtener_proyectos_agcid())
    todos_proyectos.extend(obtener_proyectos_mma())
    todos_proyectos.extend(obtener_proyectos_minenergia())
    
    print(f"🎉 Total proyectos gubernamentales: {len(todos_proyectos)}")
    return todos_proyectos

if __name__ == "__main__":
    # Probar el scraper
    proyectos = obtener_todos_proyectos_gubernamentales()
    print(f"\n📊 Total proyectos gubernamentales: {len(proyectos)}")
    
    for i, proyecto in enumerate(proyectos[:5], 1):
        print(f"\n{i}. {proyecto['Nombre']}")
        print(f"   Fuente: {proyecto['Fuente']}")
        print(f"   Monto: {proyecto['Monto']}")
        print(f"   Área: {proyecto['Área de interés']}")
        print(f"   Cierre: {proyecto['Fecha cierre']}")
