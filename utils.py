import re
from datetime import datetime


def clasificar_area(nombre: str) -> str:
    """Clasifica un proyecto en un área de interés simple usando palabras clave.

    La clasificación es heurística y extensible. Si no encuentra coincidencias,
    devuelve "General".
    """
    if not nombre:
        return "General"

    texto = nombre.lower()

    keywords_to_area = [
        ("agric", "Agricultura"),
        ("ganad", "Ganadería"),
        ("suelo", "Suelos"),
        ("aliment", "Seguridad alimentaria"),
        ("innov", "Innovación"),
        ("desarrollo", "Desarrollo rural"),
        ("clima", "Cambio climático"),
        ("riego", "Riego"),
        ("forest", "Forestal"),
    ]

    for kw, area in keywords_to_area:
        if kw in texto:
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

