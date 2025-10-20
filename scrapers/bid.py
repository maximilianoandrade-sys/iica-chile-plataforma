from utils import clasificar_area, parsear_fecha, parsear_monto


def obtener_proyectos_bid():
    proyectos = [
        {
            "Nombre": "BID - Innovación Agroindustrial",
            "Fuente": "BID",
            "Fecha cierre": "22/11/2025",
            "Enlace": "https://beo-procurement.iadb.org/opportunities",
            "Monto": "180000 USD",
            "Estado": "Abierto",
        }
    ]
    for p in proyectos:
        p["Área de interés"] = clasificar_area(p["Nombre"])
        p["Fecha cierre"] = parsear_fecha(p["Fecha cierre"])
        p["Monto"] = parsear_monto(p["Monto"])
    return proyectos


