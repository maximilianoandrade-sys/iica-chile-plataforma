from utils import clasificar_area, parsear_fecha, parsear_monto

def obtener_proyectos_devex():
    proyectos = [
        {"Nombre": "Seguridad alimentaria rural", "Fuente": "Devex", "Fecha cierre": "25/10/2025",
         "Enlace": "https://devex.com/proyectoA", "Monto": "75000 USD", "Estado": "Abierto"}
    ]
    for p in proyectos:
        p['Área de interés'] = clasificar_area(p['Nombre'])
        p['Fecha cierre'] = parsear_fecha(p['Fecha cierre'])
        p['Monto'] = parsear_monto(p['Monto'])
    return proyectos
