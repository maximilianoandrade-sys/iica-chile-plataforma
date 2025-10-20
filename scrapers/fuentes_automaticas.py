#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Módulo de Fuentes Automáticas para IICA Chile
Scraping y APIs de múltiples plataformas de financiamiento
"""

import requests
from bs4 import BeautifulSoup
import json
import logging
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
import time
import re
from urllib.parse import urljoin, urlparse
import feedparser
import xml.etree.ElementTree as ET

logger = logging.getLogger(__name__)

class FuentesAutomaticas:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
    
    def scraping_bid(self):
        """Scraping del Banco Interamericano de Desarrollo"""
        try:
            logger.info("🔄 Iniciando scraping BID...")
            
            # Configurar Selenium
            chrome_options = Options()
            chrome_options.add_argument("--headless")
            chrome_options.add_argument("--no-sandbox")
            chrome_options.add_argument("--disable-dev-shm-usage")
            
            driver = webdriver.Chrome(options=chrome_options)
            driver.get("https://www.iadb.org/es/project-search")
            
            # Esperar a que cargue
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "project-item"))
            )
            
            proyectos = []
            project_elements = driver.find_elements(By.CLASS_NAME, "project-item")
            
            for element in project_elements[:10]:
                try:
                    titulo = element.find_element(By.CLASS_NAME, "project-title").text
                    descripcion = element.find_element(By.CLASS_NAME, "project-description").text
                    monto = element.find_element(By.CLASS_NAME, "project-amount").text
                    
                    proyecto = {
                        "id": f"BID-{hash(titulo) % 10000:04d}",
                        "nombre": titulo,
                        "organizacion": "Banco Interamericano de Desarrollo",
                        "tipo": "Internacional",
                        "pais": "Internacional",
                        "descripcion": descripcion,
                        "monto": monto,
                        "estado": "Abierto",
                        "area": "Desarrollo Rural",
                        "categoria": "Agricultura",
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
            
            url = "https://www.mercadopublico.cl/Portal/Public/BusquedaAvanzada"
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                licitaciones = []
                
                # Buscar licitaciones relacionadas con agricultura
                for item in soup.find_all('div', class_='licitacion-item'):
                    try:
                        titulo = item.find('h3').text.strip()
                        descripcion = item.find('p', class_='descripcion').text.strip()
                        monto = item.find('span', class_='monto').text.strip()
                        fecha = item.find('span', class_='fecha').text.strip()
                        
                        if any(keyword in titulo.lower() for keyword in ['agricultura', 'rural', 'agro', 'campo']):
                            licitacion = {
                                "id": f"MP-CHILE-{hash(titulo) % 10000:04d}",
                                "nombre": titulo,
                                "organizacion": "Mercado Público Chile",
                                "tipo": "Nacional",
                                "pais": "Chile",
                                "descripcion": descripcion,
                                "monto": monto,
                                "fecha_cierre": fecha,
                                "estado": "Abierto",
                                "area": "Desarrollo Rural",
                                "categoria": "Agricultura",
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
    
    def scraping_fondos_gob_cl(self):
        """Scraping de Fondos.gob.cl"""
        try:
            logger.info("🔄 Iniciando scraping Fondos.gob.cl...")
            
            url = "https://fondos.gob.cl/searchernew/cooperación%20internacional"
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                fondos = []
                
                for item in soup.find_all('div', class_='fondo-item'):
                    try:
                        titulo = item.find('h4').text.strip()
                        descripcion = item.find('p', class_='descripcion').text.strip()
                        monto = item.find('span', class_='monto').text.strip()
                        fecha = item.find('span', class_='fecha').text.strip()
                        
                        fondo = {
                            "id": f"FONDOS-GOB-{hash(titulo) % 10000:04d}",
                            "nombre": titulo,
                            "organizacion": "Fondos.gob.cl",
                            "tipo": "Nacional",
                            "pais": "Chile",
                            "descripcion": descripcion,
                            "monto": monto,
                            "fecha_cierre": fecha,
                            "estado": "Abierto",
                            "area": "Desarrollo Rural",
                            "categoria": "Agricultura",
                            "fuente": "Fondos.gob.cl",
                            "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        }
                        fondos.append(fondo)
                    except:
                        continue
                
                logger.info(f"✅ Scraping Fondos.gob.cl completado: {len(fondos)} fondos")
                return fondos
            
        except Exception as e:
            logger.error(f"❌ Error en scraping Fondos.gob.cl: {e}")
            return []
    
    def scraping_devex(self):
        """Scraping de Devex"""
        try:
            logger.info("🔄 Iniciando scraping Devex...")
            
            url = "https://www.devex.com/jobs"
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                oportunidades = []
                
                for item in soup.find_all('div', class_='job-item'):
                    try:
                        titulo = item.find('h3').text.strip()
                        descripcion = item.find('p', class_='descripcion').text.strip()
                        organizacion = item.find('span', class_='organizacion').text.strip()
                        
                        if any(keyword in titulo.lower() for keyword in ['agriculture', 'rural', 'development', 'food']):
                            oportunidad = {
                                "id": f"DEXEV-{hash(titulo) % 10000:04d}",
                                "nombre": titulo,
                                "organizacion": organizacion,
                                "tipo": "Internacional",
                                "pais": "Internacional",
                                "descripcion": descripcion,
                                "estado": "Abierto",
                                "area": "Desarrollo Rural",
                                "categoria": "Agricultura",
                                "fuente": "Devex",
                                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                            }
                            oportunidades.append(oportunidad)
                    except:
                        continue
                
                logger.info(f"✅ Scraping Devex completado: {len(oportunidades)} oportunidades")
                return oportunidades
            
        except Exception as e:
            logger.error(f"❌ Error en scraping Devex: {e}")
            return []
    
    def scraping_tenders_global(self):
        """Scraping de Tenders Global"""
        try:
            logger.info("🔄 Iniciando scraping Tenders Global...")
            
            url = "https://www.tendersglobal.com"
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                tenders = []
                
                for item in soup.find_all('div', class_='tender-item'):
                    try:
                        titulo = item.find('h3').text.strip()
                        descripcion = item.find('p', class_='descripcion').text.strip()
                        monto = item.find('span', class_='monto').text.strip()
                        fecha = item.find('span', class_='fecha').text.strip()
                        
                        if any(keyword in titulo.lower() for keyword in ['agriculture', 'rural', 'food', 'farming']):
                            tender = {
                                "id": f"TENDERS-{hash(titulo) % 10000:04d}",
                                "nombre": titulo,
                                "organizacion": "Tenders Global",
                                "tipo": "Internacional",
                                "pais": "Internacional",
                                "descripcion": descripcion,
                                "monto": monto,
                                "fecha_cierre": fecha,
                                "estado": "Abierto",
                                "area": "Desarrollo Rural",
                                "categoria": "Agricultura",
                                "fuente": "Tenders Global",
                                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                            }
                            tenders.append(tender)
                    except:
                        continue
                
                logger.info(f"✅ Scraping Tenders Global completado: {len(tenders)} tenders")
                return tenders
            
        except Exception as e:
            logger.error(f"❌ Error en scraping Tenders Global: {e}")
            return []
    
    def scraping_fao(self):
        """Scraping de FAO"""
        try:
            logger.info("🔄 Iniciando scraping FAO...")
            
            url = "https://www.fao.org/procurement/current-tenders-and-calls"
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                oportunidades = []
                
                for item in soup.find_all('div', class_='tender-item'):
                    try:
                        titulo = item.find('h3').text.strip()
                        descripcion = item.find('p', class_='descripcion').text.strip()
                        monto = item.find('span', class_='monto').text.strip()
                        fecha = item.find('span', class_='fecha').text.strip()
                        
                        oportunidad = {
                            "id": f"FAO-{hash(titulo) % 10000:04d}",
                            "nombre": titulo,
                            "organizacion": "FAO - Organización de las Naciones Unidas",
                            "tipo": "Internacional",
                            "pais": "Internacional",
                            "descripcion": descripcion,
                            "monto": monto,
                            "fecha_cierre": fecha,
                            "estado": "Abierto",
                            "area": "Seguridad Alimentaria",
                            "categoria": "Agricultura",
                            "fuente": "FAO",
                            "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                        }
                        oportunidades.append(oportunidad)
                    except:
                        continue
                
                logger.info(f"✅ Scraping FAO completado: {len(oportunidades)} oportunidades")
                return oportunidades
            
        except Exception as e:
            logger.error(f"❌ Error en scraping FAO: {e}")
            return []
    
    def scraping_union_europea(self):
        """Scraping de la Unión Europea"""
        try:
            logger.info("🔄 Iniciando scraping Unión Europea...")
            
            url = "https://ec.europa.eu/info/funding-tenders/opportunities/portal/screen/opportunities"
            response = self.session.get(url, timeout=30)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                oportunidades = []
                
                for item in soup.find_all('div', class_='opportunity-item'):
                    try:
                        titulo = item.find('h3').text.strip()
                        descripcion = item.find('p', class_='descripcion').text.strip()
                        monto = item.find('span', class_='monto').text.strip()
                        fecha = item.find('span', class_='fecha').text.strip()
                        
                        if any(keyword in titulo.lower() for keyword in ['agriculture', 'rural', 'food', 'farming']):
                            oportunidad = {
                                "id": f"UE-{hash(titulo) % 10000:04d}",
                                "nombre": titulo,
                                "organizacion": "Unión Europea",
                                "tipo": "Internacional",
                                "pais": "Internacional",
                                "descripcion": descripcion,
                                "monto": monto,
                                "fecha_cierre": fecha,
                                "estado": "Abierto",
                                "area": "Innovación Tecnológica",
                                "categoria": "Agricultura",
                                "fuente": "Unión Europea",
                                "fecha_actualizacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                            }
                            oportunidades.append(oportunidad)
                    except:
                        continue
                
                logger.info(f"✅ Scraping Unión Europea completado: {len(oportunidades)} oportunidades")
                return oportunidades
            
        except Exception as e:
            logger.error(f"❌ Error en scraping Unión Europea: {e}")
            return []
    
    def obtener_todos_los_fondos(self):
        """Obtener fondos de todas las fuentes automáticas"""
        todos_los_fondos = []
        
        # Lista de métodos de scraping
        metodos_scraping = [
            self.scraping_bid,
            self.scraping_mercado_publico_chile,
            self.scraping_fondos_gob_cl,
            self.scraping_devex,
            self.scraping_tenders_global,
            self.scraping_fao,
            self.scraping_union_europea
        ]
        
        # Ejecutar todos los métodos de scraping
        for metodo in metodos_scraping:
            try:
                fondos = metodo()
                todos_los_fondos.extend(fondos)
            except Exception as e:
                logger.error(f"❌ Error en {metodo.__name__}: {e}")
                continue
        
        logger.info(f"✅ Total de fondos obtenidos: {len(todos_los_fondos)}")
        return todos_los_fondos

# Función principal para ejecutar scraping
def ejecutar_scraping_completo():
    """Ejecutar scraping completo de todas las fuentes"""
    fuentes = FuentesAutomaticas()
    return fuentes.obtener_todos_los_fondos()

if __name__ == "__main__":
    # Ejecutar scraping completo
    fondos = ejecutar_scraping_completo()
    print(f"Total de fondos obtenidos: {len(fondos)}")
    
    # Guardar resultados
    with open('fondos_scraping.json', 'w', encoding='utf-8') as f:
        json.dump(fondos, f, ensure_ascii=False, indent=2)

