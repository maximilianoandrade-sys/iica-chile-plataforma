from utils import clasificar_area, parsear_fecha, parsear_monto

def obtener_proyectos_fondosgob():
    proyectos = [
        {"Nombre": "Proyecto apoyo al agro", "Fuente": "FondosGob", "Fecha cierre": "05/11/2025",
         "Enlace": "https://www.fondos.gob.cl/", "Monto": "30000 CLP", "Estado": "Abierto"}
    ]
    for p in proyectos:
        p['Área de interés'] = clasificar_area(p['Nombre'])
        p['Fecha cierre'] = parsear_fecha(p['Fecha cierre'])
        p['Monto'] = parsear_monto(p['Monto'])
    return proyectos
