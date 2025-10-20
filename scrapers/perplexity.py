import requests
from bs4 import BeautifulSoup
from utils import clasificar_area, parsear_fecha, parsear_monto

def obtener_proyectos_perplexity(query="agriculture"):
    url = f"https://www.perplexity.ai/search?q={query.replace(' ', '%20')}"
    headers = {
        "User-Agent": "Mozilla/5.0"
    }
    resp = requests.get(url, headers=headers)
    soup = BeautifulSoup(resp.text, 'html.parser')
    proyectos = []
    # Ajusta el selector según el HTML del sitio
    # Busca títulos/hrefs de tarjetas o resultados
    for card in soup.select("a"):
        nombre = card.text.strip()
        enlace = card.get("href")
        if nombre and enlace and "http" in enlace:
            proyectos.append({
                "Nombre": nombre[:100],
                "Fuente": "Perplexity",
                "Fecha cierre": "",           # No disponible
                "Enlace": enlace,
                "Monto": "",                  # No disponible
                "Estado": "Desconocido",
                "Área de interés": clasificar_area(nombre)
            })
    return proyectos
