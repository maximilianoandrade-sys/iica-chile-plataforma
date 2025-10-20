from utils import clasificar_area, parsear_fecha, parsear_monto


def obtener_proyectos_undp():
    proyectos = [
        {
            "Nombre": "UNDP - Climate-Smart Agriculture",
            "Fuente": "UNDP",
            "Fecha cierre": "18/12/2025",
            "Enlace": "https://procurement-notices.undp.org/",
            "Monto": "220000 USD",
            "Estado": "Abierto",
        }
    ]
    for p in proyectos:
        p["Área de interés"] = clasificar_area(p["Nombre"])
        p["Fecha cierre"] = parsear_fecha(p["Fecha cierre"])
        p["Monto"] = parsear_monto(p["Monto"])
    return proyectos


