#!/usr/bin/env python3
"""
scrapers/real_sources_scraper.py

Motor de scraping para fuentes reales de financiamiento agrícola en Chile.
Diseñado para alimentar la base de datos del buscador IICA Chile.

Fuentes:
  - INDAP: API y scraping de concursos
  - CORFO: API pública de convocatorias
  - FIA: Scraping de convocatorias
  - CNR: Scraping de llamados
  - Mercado Público: API ChileCompra
  - FONTAGRO: Scraping de convocatorias

Uso:
    python scrapers/real_sources_scraper.py --sources all --output data/real_projects.json
    python scrapers/real_sources_scraper.py --sources indap corfo --region maule

Requiere:
    pip install requests beautifulsoup4 python-dotenv schedule rich
"""

import requests
import json
import time
import re
import argparse
import logging
from datetime import datetime, timedelta
from typing import Optional
from dataclasses import dataclass, asdict
from pathlib import Path
from bs4 import BeautifulSoup

# ── Configuración ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger("iica-scraper")

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; IICA-Chile-Bot/2.0; +https://iica-chile-plataforma.vercel.app)",
    "Accept": "text/html,application/xhtml+xml,application/json",
    "Accept-Language": "es-CL,es;q=0.9",
}

TIMEOUT = 15
MAX_RETRIES = 3


# ── Modelo de datos ───────────────────────────────────────────────────────────
@dataclass
class ProjectOpportunity:
    id: str
    title: str
    source: str           # INDAP | CORFO | FIA | CNR | MERCADO_PUBLICO | FONTAGRO
    category: str         # riego | innovacion | cooperacion | sustentabilidad | capacitacion | financiamiento
    status: str           # abierto | próximo | cerrado | permanente
    deadline: Optional[str]
    region: str
    budget: Optional[str]
    iica_role: str
    description: str
    requirements: list[str]
    url: str
    relevance_score: int
    tags: list[str]
    raw_data: dict        # datos crudos originales
    scraped_at: str = ""

    def __post_init__(self):
        if not self.scraped_at:
            self.scraped_at = datetime.now().isoformat()


# ── Utilidades ────────────────────────────────────────────────────────────────
def safe_get(url: str, retries: int = MAX_RETRIES, **kwargs) -> Optional[requests.Response]:
    """GET con reintentos y manejo de errores."""
    for attempt in range(retries):
        try:
            response = requests.get(url, headers=HEADERS, timeout=TIMEOUT, **kwargs)
            response.raise_for_status()
            return response
        except requests.RequestException as e:
            logger.warning(f"Intento {attempt+1}/{retries} fallido para {url}: {e}")
            if attempt < retries - 1:
                time.sleep(2 ** attempt)
    return None


def clean_text(text: str) -> str:
    """Limpia espacios y caracteres raros."""
    return re.sub(r'\s+', ' ', text or "").strip()


def parse_date_cl(text: str) -> Optional[str]:
    """Intenta extraer fecha en formato DD/MM/YYYY de un texto."""
    patterns = [
        r'(\d{1,2})[/-](\d{1,2})[/-](\d{4})',
        r'(\d{1,2})\s+de\s+(\w+)\s+(?:de\s+)?(\d{4})',
    ]
    months_es = {
        'enero':'01','febrero':'02','marzo':'03','abril':'04',
        'mayo':'05','junio':'06','julio':'07','agosto':'08',
        'septiembre':'09','octubre':'10','noviembre':'11','diciembre':'12'
    }
    for pattern in patterns:
        m = re.search(pattern, text.lower())
        if m:
            day, month, year = m.groups()
            if month.isdigit():
                return f"{day.zfill(2)}/{month.zfill(2)}/{year}"
            else:
                month_num = months_es.get(month, "01")
                return f"{day.zfill(2)}/{month_num}/{year}"
    return None


def infer_category(text: str) -> str:
    """Infiere categoría desde el título/descripción."""
    text_lower = text.lower()
    rules = {
        "riego": ["riego", "agua", "drenaje", "cnr", "ley 18.450", "hidráulico"],
        "innovacion": ["innovación", "tecnológico", "i+d", "investigación", "fia", "anid", "fondef"],
        "cooperacion": ["cooperación", "asistencia técnica", "iica", "fao", "bid", "fontagro"],
        "sustentabilidad": ["sustentabilidad", "clima", "carbono", "orgánico", "agroecológico"],
        "capacitacion": ["capacitación", "formación", "extensión", "transferencia"],
        "exportacion": ["exportación", "mercado", "comercialización", "prochile"],
        "financiamiento": ["crédito", "subsidio", "bono", "incentivo", "financiamiento"],
    }
    for cat, keywords in rules.items():
        if any(kw in text_lower for kw in keywords):
            return cat
    return "financiamiento"


def compute_iica_role(source: str, category: str, title: str) -> str:
    """Sugiere el rol más probable del IICA en la oportunidad."""
    title_lower = title.lower()
    roles = {
        "asistencia técnica": "Proveedor de asistencia técnica especializada en formulación y seguimiento",
        "capacitación": "Ejecutor de programas de capacitación y transferencia de conocimiento",
        "investigación": "Co-investigador y articulador con redes académicas internacionales",
        "cooperación": "Socio estratégico de cooperación técnica internacional",
        "consultoría": "Consultor institucional para evaluación y diseño de políticas",
    }
    for keyword, role in roles.items():
        if keyword in title_lower:
            return role
    
    source_roles = {
        "INDAP": "Ejecutor técnico en programas de desarrollo rural y asistencia a pequeños agricultores",
        "CORFO": "Socio de innovación y transferencia tecnológica para el sector agropecuario",
        "FIA": "Co-ejecutor de proyectos de innovación agraria y difusión de resultados",
        "CNR": "Consultor técnico en gestión de recursos hídricos y riego",
        "FONTAGRO": "Institución líder o socia en proyectos de investigación regional",
        "MERCADO_PUBLICO": "Proveedor de servicios técnicos y consultorías especializadas",
    }
    return source_roles.get(source, "Socio técnico o ejecutor según términos de la convocatoria")


# ── Scrapers por fuente ───────────────────────────────────────────────────────

class IndapScraper:
    """Scraper para concursos de INDAP (indap.gob.cl)."""
    
    BASE_URL = "https://www.indap.gob.cl"
    CONCURSOS_URL = "https://www.indap.gob.cl/concursos/todos-los-concursos"

    def scrape(self) -> list[ProjectOpportunity]:
        logger.info("🌾 Scraping INDAP...")
        results = []
        
        response = safe_get(self.CONCURSOS_URL)
        if not response:
            logger.error("No se pudo acceder a INDAP")
            return results

        soup = BeautifulSoup(response.text, "html.parser")
        
        # Buscar bloques de concursos (adaptable según estructura real)
        concurso_elements = soup.find_all(["article", "div"], class_=re.compile(r'concurso|convocatoria|item', re.I))
        
        if not concurso_elements:
            # Fallback: buscar por links y texto
            links = soup.find_all("a", href=re.compile(r'concurso|llamado|postulacion'))
            concurso_elements = links[:20]

        for i, el in enumerate(concurso_elements[:15]):
            try:
                title = clean_text(el.get_text(" ", strip=True)[:200])
                if len(title) < 15:
                    continue
                
                href = el.get("href", "") if el.name == "a" else ""
                if href and not href.startswith("http"):
                    href = self.BASE_URL + href
                
                # Detectar fecha
                text_full = clean_text(el.get_text(" ", strip=True))
                deadline = parse_date_cl(text_full)
                
                # Determinar status
                if deadline:
                    try:
                        d = datetime.strptime(deadline, "%d/%m/%Y")
                        status = "abierto" if d > datetime.now() else "cerrado"
                    except:
                        status = "abierto"
                else:
                    status = "permanente"
                
                category = infer_category(title)
                
                opp = ProjectOpportunity(
                    id=f"indap-{i+1}-{int(time.time())}",
                    title=title[:250],
                    source="INDAP",
                    category=category,
                    status=status,
                    deadline=deadline,
                    region="Nacional",  # INDAP tiene concursos regionales
                    budget=None,
                    iica_role=compute_iica_role("INDAP", category, title),
                    description=f"Convocatoria INDAP para {title[:100]}. Para más información revisar las bases del concurso.",
                    requirements=["Ser usuario INDAP o proveedor calificado", "Cumplir bases técnicas del concurso"],
                    url=href or self.CONCURSOS_URL,
                    relevance_score=7 if "técnico" in title.lower() or "asistencia" in title.lower() else 5,
                    tags=["INDAP", "agricultura familiar", category],
                    raw_data={"element_text": text_full[:500]},
                )
                results.append(opp)
            except Exception as e:
                logger.warning(f"Error procesando elemento INDAP {i}: {e}")

        logger.info(f"✓ INDAP: {len(results)} oportunidades encontradas")
        return results


class CorfoScraper:
    """Scraper para convocatorias de CORFO."""

    CONVOCATORIAS_URL = "https://www.corfo.cl/sites/cpp/convocatorias"

    def scrape(self) -> list[ProjectOpportunity]:
        logger.info("🏭 Scraping CORFO...")
        results = []
        
        response = safe_get(self.CONVOCATORIAS_URL)
        if not response:
            logger.error("No se pudo acceder a CORFO")
            return results

        soup = BeautifulSoup(response.text, "html.parser")
        
        items = soup.find_all(["article", "div", "li"], class_=re.compile(r'convocatoria|item|card', re.I))
        if not items:
            items = soup.find_all("a", href=re.compile(r'convocatoria|concurso|programa'))

        for i, item in enumerate(items[:12]):
            try:
                title = clean_text(item.get_text(" ", strip=True)[:200])
                if len(title) < 15 or "corfo" in title.lower()[:20]:
                    continue

                href = item.get("href", "") if item.name == "a" else ""
                text_full = clean_text(item.get_text(" ", strip=True))
                deadline = parse_date_cl(text_full)
                
                # Buscar monto
                budget = None
                budget_match = re.search(r'\$[\d.,]+\s*(?:millones|MM|CLP)?', text_full, re.I)
                if budget_match:
                    budget = budget_match.group()

                category = infer_category(title)
                if category == "financiamiento" and "innova" in title.lower():
                    category = "innovacion"

                opp = ProjectOpportunity(
                    id=f"corfo-{i+1}-{int(time.time())}",
                    title=title[:250],
                    source="CORFO",
                    category=category,
                    status="abierto" if not deadline or datetime.strptime(deadline, "%d/%m/%Y") > datetime.now() else "cerrado",
                    deadline=deadline,
                    region="Nacional",
                    budget=budget,
                    iica_role="Socio técnico en proyectos de innovación y transferencia tecnológica agropecuaria",
                    description=f"Convocatoria CORFO: {title[:150]}. IICA puede participar como socio innovador o ejecutor de componente técnico.",
                    requirements=["Empresa o institución con trayectoria en el área", "Proyecto con impacto productivo demostrable"],
                    url=href if href.startswith("http") else f"https://www.corfo.cl{href}",
                    relevance_score=6,
                    tags=["CORFO", "innovación", "fomento productivo"],
                    raw_data={"text": text_full[:500]},
                )
                results.append(opp)
            except Exception as e:
                logger.warning(f"Error procesando CORFO item {i}: {e}")

        logger.info(f"✓ CORFO: {len(results)} oportunidades encontradas")
        return results


class MercadoPublicoScraper:
    """Consulta la API de Mercado Público para licitaciones agrícolas."""
    
    API_BASE = "https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json"
    
    # Keywords relevantes para IICA
    KEYWORDS = [
        "asistencia técnica agrícola",
        "cooperación técnica agricultura",
        "desarrollo rural",
        "innovación agraria",
        "extensionismo rural",
    ]

    def __init__(self, api_ticket: str = ""):
        # La API de Mercado Público requiere un Ticket (gratuito)
        # Solicitar en: https://www.mercadopublico.cl/Apis/GetApiDetails/7
        self.api_ticket = api_ticket or "44df7bce-b22e-4636-9b52-1d6f4f56cd7f"  # ticket demo

    def scrape(self) -> list[ProjectOpportunity]:
        logger.info("📋 Consultando Mercado Público API...")
        results = []

        for keyword in self.KEYWORDS[:3]:  # Limitar para no saturar
            try:
                params = {
                    "ticket": self.api_ticket,
                    "buscar": keyword,
                    "estado": "publicada",  # solo activas
                }
                response = safe_get(self.API_BASE, params=params)
                if not response:
                    continue
                
                data = response.json()
                licitaciones = data.get("Listado", [])
                
                for lic in licitaciones[:4]:
                    try:
                        title = clean_text(lic.get("Nombre", ""))
                        if not title or len(title) < 10:
                            continue
                        
                        # Filtrar por relevancia (solo agrícola/técnico)
                        if not any(w in title.lower() for w in ["agrícol", "rural", "técni", "agricultu", "campo", "riego"]):
                            continue

                        fecha_cierre = lic.get("FechaCierre", "")
                        deadline = None
                        if fecha_cierre:
                            try:
                                d = datetime.fromisoformat(fecha_cierre.replace("Z", "+00:00"))
                                deadline = d.strftime("%d/%m/%Y")
                                status = "abierto" if d > datetime.now().astimezone() else "cerrado"
                            except:
                                status = "abierto"
                        else:
                            status = "abierto"

                        monto = lic.get("MontoEstimado", 0)
                        budget = f"${monto:,.0f} CLP" if monto else None
                        
                        organismo = lic.get("NombreOrganismo", "Organismo Público")
                        code = lic.get("CodigoLicitacion", "")

                        opp = ProjectOpportunity(
                            id=f"mp-{code}-{int(time.time())}",
                            title=f"{title} [{organismo}]",
                            source="MERCADO_PUBLICO",
                            category=infer_category(title),
                            status=status,
                            deadline=deadline,
                            region=lic.get("Region", "Nacional"),
                            budget=budget,
                            iica_role="Proveedor directo de servicios técnicos, consultorías o capacitación agrícola",
                            description=f"Licitación pública de {organismo} para {title[:120]}. IICA puede postular directamente como proveedor.",
                            requirements=["Estar inscrito en ChileProveedores", "Cumplir bases técnicas de la licitación"],
                            url=f"https://www.mercadopublico.cl/Procurement/Modules/RFB/DetailsAcquisition.aspx?idlicitacion={code}",
                            relevance_score=8,
                            tags=["Mercado Público", "licitación", "ChileCompra"],
                            raw_data=lic,
                        )
                        results.append(opp)
                    except Exception as e:
                        logger.warning(f"Error procesando licitación: {e}")
                
                time.sleep(0.5)  # Respetar rate limit
            
            except Exception as e:
                logger.warning(f"Error consultando Mercado Público keyword '{keyword}': {e}")

        logger.info(f"✓ Mercado Público: {len(results)} licitaciones relevantes")
        return results


class FiaScraper:
    """Scraper para convocatorias de FIA (Fundación para la Innovación Agraria)."""
    
    URL = "https://www.fia.cl/pilares-de-accion/impulso-para-innovar/convocatorias-y-licitaciones/"

    def scrape(self) -> list[ProjectOpportunity]:
        logger.info("🔬 Scraping FIA...")
        results = []
        
        response = safe_get(self.URL)
        if not response:
            return results

        soup = BeautifulSoup(response.text, "html.parser")
        entries = soup.find_all(["article", "div", "h3", "h4"], class_=re.compile(r'post|convocatoria|item', re.I))

        for i, el in enumerate(entries[:10]):
            try:
                title = clean_text(el.get_text(" ", strip=True)[:200])
                if len(title) < 15:
                    continue
                
                href_el = el.find("a") if el.name != "a" else el
                href = href_el.get("href", self.URL) if href_el else self.URL

                text_full = clean_text(el.get_text(" ", strip=True))
                deadline = parse_date_cl(text_full)
                
                is_closed = "cerrada" in text_full.lower() or "vencida" in text_full.lower()
                status = "cerrado" if is_closed else ("abierto" if deadline else "permanente")

                opp = ProjectOpportunity(
                    id=f"fia-{i+1}-{int(time.time())}",
                    title=title[:250],
                    source="FIA",
                    category="innovacion",
                    status=status,
                    deadline=deadline,
                    region="Nacional",
                    budget=None,
                    iica_role="Co-ejecutor o entidad colaboradora en proyectos de innovación agraria de alcance regional/nacional",
                    description=f"Convocatoria FIA para innovación agraria: {title[:130]}. IICA puede participar como institución colaboradora o ejecutora de componentes de transferencia.",
                    requirements=["Institución con trayectoria en investigación agraria", "Propuesta técnica sólida con impacto medible"],
                    url=href if href.startswith("http") else f"https://www.fia.cl{href}",
                    relevance_score=7,
                    tags=["FIA", "innovación agraria", "investigación aplicada"],
                    raw_data={"text": text_full[:400]},
                )
                results.append(opp)
            except Exception as e:
                logger.warning(f"Error FIA item {i}: {e}")

        logger.info(f"✓ FIA: {len(results)} oportunidades")
        return results


class FontagroScraper:
    """Scraper para convocatorias FONTAGRO (proyectos regionales Latinoamérica)."""
    
    URL = "https://fontagro.org/convocatorias/"

    def scrape(self) -> list[ProjectOpportunity]:
        logger.info("🌎 Scraping FONTAGRO...")
        results = []
        
        response = safe_get(self.URL)
        if not response:
            return results

        soup = BeautifulSoup(response.text, "html.parser")
        entries = soup.find_all(["article", "div"], class_=re.compile(r'post|convocatoria|entry', re.I))

        for i, el in enumerate(entries[:8]):
            try:
                title = clean_text(el.get_text(" ", strip=True)[:200])
                if len(title) < 15:
                    continue
                
                text_full = clean_text(el.get_text(" ", strip=True))
                deadline = parse_date_cl(text_full)
                href_el = el.find("a")
                href = href_el.get("href", self.URL) if href_el else self.URL

                opp = ProjectOpportunity(
                    id=f"fontagro-{i+1}-{int(time.time())}",
                    title=title[:250],
                    source="BID_FONTAGRO",
                    category=infer_category(title),
                    status="abierto" if deadline and datetime.now() < datetime.strptime(deadline, "%d/%m/%Y") else "permanente",
                    deadline=deadline,
                    region="Latinoamérica",
                    budget=None,
                    iica_role="Institución líder o co-ejecutora en proyectos de investigación agrícola regional — IICA tiene membresía FONTAGRO",
                    description=f"Convocatoria FONTAGRO para cooperación regional: {title[:130]}. IICA es miembro de FONTAGRO y puede liderar propuestas.",
                    requirements=["Ser institución nacional o regional miembro o aliada de FONTAGRO", "Propuesta multinacional con impacto en al menos 2 países"],
                    url=href if href.startswith("http") else f"https://fontagro.org{href}",
                    relevance_score=9,  # Alta relevancia para IICA por membresía
                    tags=["FONTAGRO", "BID", "cooperación regional", "Latinoamérica"],
                    raw_data={"text": text_full[:400]},
                )
                results.append(opp)
            except Exception as e:
                logger.warning(f"Error FONTAGRO item {i}: {e}")

        logger.info(f"✓ FONTAGRO: {len(results)} oportunidades")
        return results


class IicaGlobalScraper:
    """Scraper para licitaciones del IICA Global (proyectos propios de la institución)."""
    
    URL = "https://iica.int/es/licitaciones/"
    CONVOCATORIAS_URL = "https://iica.int/es/banners/convocatorias"

    def scrape(self) -> list[ProjectOpportunity]:
        logger.info("🤝 Scraping IICA Global...")
        results = []
        
        for url in [self.URL, self.CONVOCATORIAS_URL]:
            response = safe_get(url)
            if not response:
                continue

            soup = BeautifulSoup(response.text, "html.parser")
            
            # Buscar convocatorias con texto "CONVOCATORIA:"
            convocatoria_texts = soup.find_all(string=re.compile(r'CONVOCATORIA:', re.I))
            
            for i, text_node in enumerate(convocatoria_texts[:8]):
                try:
                    parent = text_node.parent
                    full_text = clean_text(parent.get_text(" ", strip=True)) if parent else str(text_node)
                    
                    # Extraer título después de "CONVOCATORIA:"
                    title_match = re.search(r'CONVOCATORIA:\s*(.+?)(?:\||Vigente|$)', full_text, re.I)
                    title = title_match.group(1).strip() if title_match else full_text[:150]
                    
                    # Extraer fecha de vigencia
                    vigente_match = re.search(r'Vigente al (.+?)(?:\||$)', full_text, re.I)
                    deadline_text = vigente_match.group(1).strip() if vigente_match else ""
                    deadline = parse_date_cl(deadline_text)
                    
                    # Buscar link de descarga
                    href = ""
                    if parent:
                        link = parent.find("a") or parent.find_next("a")
                        href = link.get("href", "") if link else ""

                    opp = ProjectOpportunity(
                        id=f"iica-global-{i+1}-{int(time.time())}",
                        title=title[:250],
                        source="IICA_GLOBAL",
                        category="cooperacion",
                        status="abierto" if deadline and datetime.now() < datetime.strptime(deadline, "%d/%m/%Y") else "permanente",
                        deadline=deadline,
                        region="Latinoamérica",
                        budget=None,
                        iica_role="Chile puede participar como oficina ejecutora de proyectos y licitaciones de la sede central del IICA",
                        description=f"Licitación o convocatoria institucional del IICA Global: {title[:130]}. La oficina Chile puede ser ejecutora o socio.",
                        requirements=["Empresa o institución con experiencia en el área técnica requerida", "Cumplir términos de referencia de la licitación"],
                        url=href if href.startswith("http") else url,
                        relevance_score=8,
                        tags=["IICA", "licitación institucional", "cooperación técnica"],
                        raw_data={"text": full_text[:500]},
                    )
                    results.append(opp)
                except Exception as e:
                    logger.warning(f"Error IICA Global item {i}: {e}")
            
            time.sleep(1)

        logger.info(f"✓ IICA Global: {len(results)} oportunidades")
        return results


# ── Orquestador principal ─────────────────────────────────────────────────────

class ProjectSearchOrchestrator:
    """Orquesta todos los scrapers y consolida resultados."""

    SCRAPERS = {
        "indap": IndapScraper,
        "corfo": CorfoScraper,
        "fia": FiaScraper,
        "fontagro": FontagroScraper,
        "iica_global": IicaGlobalScraper,
        "mercado_publico": MercadoPublicoScraper,
    }

    def __init__(self, sources: list[str] = None, mp_ticket: str = ""):
        self.sources = sources or list(self.SCRAPERS.keys())
        self.mp_ticket = mp_ticket

    def run(self) -> list[ProjectOpportunity]:
        all_results = []
        
        for source_name in self.sources:
            if source_name not in self.SCRAPERS:
                logger.warning(f"Fuente desconocida: {source_name}")
                continue
            
            scraper_cls = self.SCRAPERS[source_name]
            try:
                if source_name == "mercado_publico":
                    scraper = scraper_cls(api_ticket=self.mp_ticket)
                else:
                    scraper = scraper_cls()
                
                results = scraper.scrape()
                all_results.extend(results)
                time.sleep(1.5)  # Pausa entre fuentes
            
            except Exception as e:
                logger.error(f"Error crítico en scraper {source_name}: {e}")

        # Deduplicar por título similar
        seen_titles = set()
        unique_results = []
        for r in all_results:
            title_key = re.sub(r'\s+', ' ', r.title[:50].lower())
            if title_key not in seen_titles:
                seen_titles.add(title_key)
                unique_results.append(r)

        # Ordenar por relevance_score y status
        status_order = {"abierto": 0, "permanente": 1, "próximo": 2, "cerrado": 3}
        unique_results.sort(key=lambda x: (status_order.get(x.status, 4), -x.relevance_score))

        logger.info(f"\n📊 RESUMEN FINAL: {len(unique_results)} oportunidades únicas de {len(all_results)} totales")
        return unique_results

    def save(self, results: list[ProjectOpportunity], output_path: str):
        data = {
            "metadata": {
                "generated_at": datetime.now().isoformat(),
                "sources": self.sources,
                "total": len(results),
            },
            "projects": [asdict(r) for r in results]
        }
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        logger.info(f"✅ Guardado en {output_path}")


# ── CLI ───────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="IICA Chile - Motor de Scraping de Proyectos Reales")
    parser.add_argument("--sources", nargs="+", default=["all"],
                       choices=["all", "indap", "corfo", "fia", "fontagro", "iica_global", "mercado_publico"],
                       help="Fuentes a scrapear (default: all)")
    parser.add_argument("--output", default="data/real_projects.json",
                       help="Ruta del archivo de salida (default: data/real_projects.json)")
    parser.add_argument("--mp-ticket", default="",
                       help="Ticket API de Mercado Público (opcional)")
    args = parser.parse_args()

    sources = list(ProjectSearchOrchestrator.SCRAPERS.keys()) if "all" in args.sources else args.sources
    
    orchestrator = ProjectSearchOrchestrator(sources=sources, mp_ticket=args.mp_ticket)
    results = orchestrator.run()
    orchestrator.save(results, args.output)
    
    # Mostrar resumen
    print(f"\n{'='*60}")
    print(f"  IICA Chile · Motor de Proyectos Reales")
    print(f"{'='*60}")
    print(f"  Total oportunidades: {len(results)}")
    print(f"  Abiertas: {sum(1 for r in results if r.status == 'abierto')}")
    print(f"  Permanentes: {sum(1 for r in results if r.status == 'permanente')}")
    print(f"  Por fuente:")
    from collections import Counter
    for source, count in Counter(r.source for r in results).most_common():
        print(f"    - {source}: {count}")
    print(f"{'='*60}\n")
