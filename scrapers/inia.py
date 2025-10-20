from utils import clasificar_area, parsear_fecha, parsear_monto

def obtener_proyectos_inia():
    proyectos = [
        {"Nombre": "Licitación INIA Innovación", "Fuente": "INIA", "Fecha cierre": "07/11/2025",
         "Enlace": "https://www.inia.cl/licitaciones/", "Monto": "0", "Estado": "Abierto"}
    ]
    for p in proyectos:
        p['Área de interés'] = clasificar_area(p['Nombre'])
        p['Fecha cierre'] = parsear_fecha(p['Fecha cierre'])
        p['Monto'] = parsear_monto(p['Monto'])
    return proyectos
