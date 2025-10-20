from utils import clasificar_area, parsear_fecha, parsear_monto

def obtener_proyectos_iica():
    proyectos = [
        {"Nombre": "Proyecto Agricultura Sostenible", "Fuente": "IICA", "Fecha cierre": "18/10/2025",
         "Enlace": "https://iica.int/proyecto1", "Monto": "100000 USD", "Estado": "Abierto"}
    ]
    for p in proyectos:
        p['Área de interés'] = clasificar_area(p['Nombre'])
        p['Fecha cierre'] = parsear_fecha(p['Fecha cierre'])
        p['Monto'] = parsear_monto(p['Monto'])
    return proyectos
