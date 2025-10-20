from utils import clasificar_area, parsear_fecha, parsear_monto

def obtener_proyectos_ungm():
    proyectos = [
        {"Nombre": "Desarrollo ganadero sostenible", "Fuente": "UNGM", "Fecha cierre": "20/11/2025",
         "Enlace": "https://www.ungm.org/Public/Notice/XXXXXX", "Monto": "170000 USD", "Estado": "Abierto"}
    ]
    for p in proyectos:
        p['Área de interés'] = clasificar_area(p['Nombre'])
        p['Fecha cierre'] = parsear_fecha(p['Fecha cierre'])
        p['Monto'] = parsear_monto(p['Monto'])
    return proyectos
