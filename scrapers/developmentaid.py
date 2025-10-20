from utils import clasificar_area, parsear_fecha, parsear_monto

def obtener_proyectos_developmentaid():
    proyectos = [
        {"Nombre": "Erosión y recuperación de suelos", "Fuente": "DevelopmentAid", "Fecha cierre": "12/11/2025",
         "Enlace": "https://developmentaid.org/proyecto1", "Monto": "120000 USD", "Estado": "Abierto"}
    ]
    for p in proyectos:
        p['Área de interés'] = clasificar_area(p['Nombre'])
        p['Fecha cierre'] = parsear_fecha(p['Fecha cierre'])
        p['Monto'] = parsear_monto(p['Monto'])
    return proyectos
