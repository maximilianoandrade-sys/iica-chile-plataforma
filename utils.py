import re
from datetime import datetime


def clasificar_area(texto: str) -> str:
    """
    Clasifica un proyecto según áreas temáticas institucionales del IICA Chile.
    
    Áreas temáticas IICA:
    - Agricultura familiar campesina
    - Innovación tecnológica
    - Gestión hídrica
    - Seguridad alimentaria
    - Juventud rural
    - Medio ambiente
    """
    if not texto:
        return "General"
    
    texto_lower = texto.lower()
    
    # Áreas temáticas IICA con palabras clave
    areas_iica = {
        "Agricultura familiar campesina": [
            "agricultura familiar", "campesino", "campesina", "pequeño productor",
            "pequeña agricultura", "agricultura familiar campesina", "afc",
            "agricultor familiar", "comunidad rural", "asociación campesina"
        ],
        "Innovación tecnológica": [
            "innovación", "tecnología", "digital", "agtech", "agrotecnología",
            "tecnología agrícola", "agricultura digital", "precisión", "drones",
            "iot", "sensores", "automatización", "big data", "inteligencia artificial"
        ],
        "Gestión hídrica": [
            "agua", "hídrico", "hídrica", "riego", "irrigación", "gestión del agua",
            "recursos hídricos", "eficiencia hídrica", "conservación agua",
            "sistemas de riego", "déficit hídrico", "sequía"
        ],
        "Seguridad alimentaria": [
            "seguridad alimentaria", "nutrición", "alimentos", "producción alimentaria",
            "cadena alimentaria", "sistemas alimentarios", "soberanía alimentaria",
            "inocuidad alimentaria", "desnutrición", "hambre"
        ],
        "Juventud rural": [
            "juventud", "joven", "rural", "juventud rural", "jóvenes rurales",
            "emprendimiento joven", "capacitación jóvenes", "líderes jóvenes",
            "nuevas generaciones", "sucesión generacional"
        ],
        "Medio ambiente": [
            "medio ambiente", "ambiental", "sostenibilidad", "sustentabilidad",
            "biodiversidad", "conservación", "ecología", "cambio climático",
            "adaptación climática", "mitigación", "emisiones", "carbono",
            "reforestación", "recursos naturales", "protección ambiental"
        ]
    }
    
    # Buscar coincidencias por área (orden de prioridad)
    for area, keywords in areas_iica.items():
        for keyword in keywords:
            if keyword in texto_lower:
                return area
    
    # Clasificación secundaria
    keywords_secundarios = [
        ("agric", "Agricultura familiar campesina"),
        ("ganad", "Agricultura familiar campesina"),
        ("forest", "Medio ambiente"),
        ("clima", "Medio ambiente"),
        ("riego", "Gestión hídrica"),
        ("aliment", "Seguridad alimentaria"),
        ("innov", "Innovación tecnológica"),
        ("desarrollo rural", "Agricultura familiar campesina"),
    ]
    
    for kw, area in keywords_secundarios:
        if kw in texto_lower:
            return area
    
    return "General"


def parsear_fecha(valor: str) -> str:
    """Normaliza una fecha a formato ISO (YYYY-MM-DD).

    Acepta formatos comunes como DD/MM/YYYY, DD-MM-YYYY, YYYY-MM-DD, YYYY/MM/DD.
    Si no puede parsear, devuelve el valor original.
    """
    if not valor:
        return valor

    valor = str(valor).strip()
    formatos = [
        "%d/%m/%Y",
        "%d-%m-%Y",
        "%Y-%m-%d",
        "%Y/%m/%d",
        "%d.%m.%Y",
    ]
    for fmt in formatos:
        try:
            dt = datetime.strptime(valor, fmt)
            return dt.strftime("%Y-%m-%d")
        except Exception:
            continue
    return valor


def parsear_monto(valor: str) -> str:
    """Extrae monto y moneda y devuelve una representación normalizada.

    Ejemplos de entrada: "100000 USD", "50,000 usd", "200000 CLP", "50000 GBP", "0".
    Salida normalizada: "USD 100000", "CLP 200000", "GBP 50000", "0".
    Si no se detecta moneda y el monto es 0, devuelve "0"; si hay monto sin moneda, devuelve el número tal cual.
    """
    if valor is None:
        return "0"

    texto = str(valor).strip()
    if texto == "":
        return "0"

    # Detectar número (permite separadores , . y espacios)
    num_match = re.search(r"([0-9][0-9\s\.,]*)", texto)
    numero_normalizado = None
    if num_match:
        bruto = num_match.group(1)
        # Eliminar espacios y comas de miles, mantener punto como decimal si corresponde
        sin_espacios = bruto.replace(" ", "").replace(",", "")
        try:
            # Si hay más de un punto, considéralos separadores de miles
            if sin_espacios.count(".") > 1:
                sin_espacios = sin_espacios.replace(".", "")
            # Intentar como entero si aplica
            if "." in sin_espacios:
                numero = float(sin_espacios)
                # Quitar parte decimal si es .0
                numero_normalizado = (
                    str(int(numero)) if abs(numero - int(numero)) < 1e-9 else str(numero)
                )
            else:
                numero_normalizado = str(int(sin_espacios))
        except Exception:
            pass

    # Detectar moneda
    moneda_match = re.search(r"\b(usd|eur|clp|gbp|mxn|ars|brl|cop|pen|uyu|pyg|dólares?|dolares?)\b", texto, re.IGNORECASE)
    moneda_map = {
        "usd": "USD",
        "eur": "EUR",
        "clp": "CLP",
        "gbp": "GBP",
        "mxn": "MXN",
        "ars": "ARS",
        "brl": "BRL",
        "cop": "COP",
        "pen": "PEN",
        "uyu": "UYU",
        "pyg": "PYG",
        "dolares": "USD",
        "dólares": "USD",
    }
    moneda = None
    if moneda_match:
        moneda = moneda_map.get(moneda_match.group(1).lower(), None)

    if numero_normalizado is None:
        # Si no se puede extraer número, devolver valor original
        return texto

    if numero_normalizado == "0" and (moneda is None):
        return "0"

    return f"{moneda} {numero_normalizado}".strip()


def formatear_monto_visual(monto_str):
    """Formatea un monto para mostrar con decimales y separadores de miles de forma visual"""
    if not monto_str or monto_str in ['Consultar', 'Variable', 'N/A', '0']:
        return monto_str
    
    monto_str = str(monto_str)
    
    # Detectar moneda
    if 'USD' in monto_str.upper():
        moneda = 'USD'
        simbolo = '$'
    elif 'EUR' in monto_str.upper():
        moneda = 'EUR'
        simbolo = '€'
    elif 'CLP' in monto_str.upper():
        moneda = 'CLP'
        simbolo = '$'
    else:
        return monto_str
    
    # Extraer valor numérico
    valor_str = monto_str.replace(moneda, '').replace('$', '').replace('€', '').replace(',', '').strip()
    
    try:
        valor = float(valor_str)
        if moneda == 'CLP':
            # Para CLP, mostrar sin decimales pero con separadores de miles
            return f"{simbolo}{valor:,.0f} {moneda}"
        else:
            # Para USD y EUR, mostrar con 2 decimales y separadores de miles
            return f"{simbolo}{valor:,.2f} {moneda}"
    except:
        return monto_str

