from utils import clasificar_area, parsear_fecha, parsear_monto

def obtener_proyectos_globaltenders():
    proyectos = [
        {"Nombre": "Modernización Agrícola", "Fuente": "GlobalTenders", "Fecha cierre": "30/10/2025",
         "Enlace": "https://www.globaltenders.com/tender-detail?AgricultureProjectID", "Monto": "200000 USD", "Estado": "Abierto"}
    ]
    for p in proyectos:
        p['Área de interés'] = clasificar_area(p['Nombre'])
        p['Fecha cierre'] = parsear_fecha(p['Fecha cierre'])
        p['Monto'] = parsear_monto(p['Monto'])
    return proyectos
