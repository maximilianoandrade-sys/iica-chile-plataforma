from utils import clasificar_area, parsear_fecha, parsear_monto


def obtener_proyectos_usaid():
    proyectos = [
        {
            "Nombre": "USAID - Food Security Challenge",
            "Fuente": "USAID",
            "Fecha cierre": "05/12/2025",
            "Enlace": "https://www.usaid.gov/work-usaid/how-to-work-with-usaid",
            "Monto": "400000 USD",
            "Estado": "Abierto",
        }
    ]
    for p in proyectos:
        p["Área de interés"] = clasificar_area(p["Nombre"])
        p["Fecha cierre"] = parsear_fecha(p["Fecha cierre"])
        p["Monto"] = parsear_monto(p["Monto"])
    return proyectos


