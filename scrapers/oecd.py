from utils import clasificar_area, parsear_fecha, parsear_monto


def obtener_proyectos_oecd():
    proyectos = [
        {
            "Nombre": "OECD - Agricultural Innovation Grants",
            "Fuente": "OECD",
            "Fecha cierre": "12/12/2025",
            "Enlace": "https://www.oecd.org/calls-for-tenders/",
            "Monto": "100000 EUR",
            "Estado": "Abierto",
        }
    ]
    for p in proyectos:
        p["Área de interés"] = clasificar_area(p["Nombre"])
        p["Fecha cierre"] = parsear_fecha(p["Fecha cierre"])
        p["Monto"] = parsear_monto(p["Monto"])
    return proyectos


