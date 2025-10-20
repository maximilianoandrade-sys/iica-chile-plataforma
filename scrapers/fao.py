from utils import clasificar_area, parsear_fecha, parsear_monto


def obtener_proyectos_fao():
    proyectos = [
        {
            "Nombre": "FAO - Sustainable Livestock Program",
            "Fuente": "FAO",
            "Fecha cierre": "29/11/2025",
            "Enlace": "https://www.fao.org/partnerships/procurement/en/",
            "Monto": "150000 USD",
            "Estado": "Abierto",
        }
    ]
    for p in proyectos:
        p["Área de interés"] = clasificar_area(p["Nombre"])
        p["Fecha cierre"] = parsear_fecha(p["Fecha cierre"])
        p["Monto"] = parsear_monto(p["Monto"])
    return proyectos


