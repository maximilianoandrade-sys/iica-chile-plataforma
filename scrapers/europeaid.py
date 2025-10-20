from utils import clasificar_area, parsear_fecha, parsear_monto


def obtener_proyectos_europeaid():
    proyectos = [
        {
            "Nombre": "EuropeAid - Agricultura resiliente",
            "Fuente": "EuropeAid",
            "Fecha cierre": "10/12/2025",
            "Enlace": "https://ec.europa.eu/international-partnerships/opportunities",
            "Monto": "300000 EUR",
            "Estado": "Abierto",
        }
    ]
    for p in proyectos:
        p["Área de interés"] = clasificar_area(p["Nombre"])
        p["Fecha cierre"] = parsear_fecha(p["Fecha cierre"])
        p["Monto"] = parsear_monto(p["Monto"])
    return proyectos


