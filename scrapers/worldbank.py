from utils import clasificar_area, parsear_fecha, parsear_monto


def obtener_proyectos_worldbank():
    proyectos = [
        {
            "Nombre": "World Bank - Sustainable Irrigation Initiative",
            "Fuente": "WorldBank",
            "Fecha cierre": "15/11/2025",
            "Enlace": "https://www.worldbank.org/projects",
            "Monto": "250000 USD",
            "Estado": "Abierto",
        }
    ]
    for p in proyectos:
        p["Área de interés"] = clasificar_area(p["Nombre"])
        p["Fecha cierre"] = parsear_fecha(p["Fecha cierre"])
        p["Monto"] = parsear_monto(p["Monto"])
    return proyectos


