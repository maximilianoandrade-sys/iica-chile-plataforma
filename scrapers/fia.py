from utils import clasificar_area, parsear_fecha, parsear_monto

def obtener_proyectos_fia():
    proyectos = [
        {"Nombre": "Premio Mujer AgroInnovadora", "Fuente": "FIA", "Fecha cierre": "07/10/2025",
         "Enlace": "https://www.fia.cl/pilares-de-accion/impulso-para-innovar/convocatorias-y-licitaciones/", "Monto": "0", "Estado": "Abierto"},
        {"Nombre": "Giras nacionales de innovación para Mujeres Agroinnovadoras 2025", "Fuente": "FIA", "Fecha cierre": "07/10/2025",
         "Enlace": "https://www.fia.cl/pilares-de-accion/impulso-para-innovar/convocatorias-y-licitaciones/", "Monto": "0", "Estado": "Abierto"}
    ]
    for p in proyectos:
        p['Área de interés'] = clasificar_area(p['Nombre'])
        p['Fecha cierre'] = parsear_fecha(p['Fecha cierre'])
        p['Monto'] = parsear_monto(p['Monto'])
    return proyectos
