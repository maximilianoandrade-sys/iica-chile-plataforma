from utils import clasificar_area, parsear_fecha, parsear_monto

def obtener_proyectos_tenderconsultants():
    proyectos = [
        {"Nombre": "Consultoría de innovación agrícola", "Fuente": "TenderConsultants", "Fecha cierre": "28/10/2025",
         "Enlace": "https://www.tenderconsultants.co.uk/", "Monto": "50000 GBP", "Estado": "Abierto"}
    ]
    for p in proyectos:
        p['Área de interés'] = clasificar_area(p['Nombre'])
        p['Fecha cierre'] = parsear_fecha(p['Fecha cierre'])
        p['Monto'] = parsear_monto(p['Monto'])
    return proyectos
