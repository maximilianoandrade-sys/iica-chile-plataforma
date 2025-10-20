import pandas as pd
import os

# Crear directorio si no existe
os.makedirs('data', exist_ok=True)

# Datos de proyectos actualizados
proyectos = [
    {'Nombre': 'Activa Chile Apoya', 'Fuente': 'Corfo', 'Fecha cierre': '2025-12-31', 'Enlace': 'https://www.corfo.cl', 'Estado': 'Abierto', 'Monto': 'USD 15,000,000', 'Área de interés': 'Innovación Tecnológica'},
    {'Nombre': 'Crédito Especial Cultivos Tradicionales', 'Fuente': 'Minagri', 'Fecha cierre': '2025-06-30', 'Enlace': 'https://minagri.gob.cl', 'Estado': 'Abierto', 'Monto': 'USD 5,000,000', 'Área de interés': 'Agricultura Sostenible'},
    {'Nombre': 'Crédito Siembra por Chile', 'Fuente': 'Minagri', 'Fecha cierre': '2025-08-15', 'Enlace': 'https://minagri.gob.cl', 'Estado': 'Abierto', 'Monto': 'USD 10,000,000', 'Área de interés': 'Desarrollo Rural'},
    {'Nombre': 'Crédito Mundo Verde', 'Fuente': 'Minagri', 'Fecha cierre': '2025-09-30', 'Enlace': 'https://minagri.gob.cl', 'Estado': 'Abierto', 'Monto': 'USD 8,000,000', 'Área de interés': 'Gestión Hídrica'},
    {'Nombre': 'Programa Siembra por Chile 2024', 'Fuente': 'Minagri', 'Fecha cierre': '2025-11-30', 'Enlace': 'https://minagri.gob.cl', 'Estado': 'Abierto', 'Monto': 'USD 131,000,000', 'Área de interés': 'Agricultura Sostenible'},
    {'Nombre': 'Convocatoria FIA 2024', 'Fuente': 'FIA', 'Fecha cierre': '2025-07-31', 'Enlace': 'https://www.fia.cl', 'Estado': 'Abierto', 'Monto': 'USD 3,300,000', 'Área de interés': 'Innovación Tecnológica'},
    {'Nombre': 'Proyectos Riego Los Ríos', 'Fuente': 'Gobierno Chile', 'Fecha cierre': '2025-10-31', 'Enlace': 'https://www.gob.cl', 'Estado': 'Abierto', 'Monto': 'USD 5,600,000', 'Área de interés': 'Gestión Hídrica'},
    {'Nombre': 'Crédito Energías Limpias', 'Fuente': 'Minagri', 'Fecha cierre': '2025-12-15', 'Enlace': 'https://minagri.gob.cl', 'Estado': 'Abierto', 'Monto': 'USD 12,000,000', 'Área de interés': 'Innovación Tecnológica'},
    {'Nombre': 'Crédito Obras de Riego', 'Fuente': 'Minagri', 'Fecha cierre': '2025-08-31', 'Enlace': 'https://minagri.gob.cl', 'Estado': 'Abierto', 'Monto': 'USD 15,000,000', 'Área de interés': 'Gestión Hídrica'},
    {'Nombre': 'Crédito Recuperación Suelos', 'Fuente': 'Minagri', 'Fecha cierre': '2025-09-15', 'Enlace': 'https://minagri.gob.cl', 'Estado': 'Abierto', 'Monto': 'USD 20,000,000', 'Área de interés': 'Agricultura Sostenible'},
    {'Nombre': 'Programa FAO Seguridad Alimentaria', 'Fuente': 'FAO', 'Fecha cierre': '2025-08-31', 'Enlace': 'https://www.fao.org', 'Estado': 'Abierto', 'Monto': 'USD 50,000,000', 'Área de interés': 'Seguridad Alimentaria'},
    {'Nombre': 'Fondo Verde del Clima', 'Fuente': 'Banco Mundial', 'Fecha cierre': '2025-09-30', 'Enlace': 'https://www.worldbank.org', 'Estado': 'Abierto', 'Monto': 'USD 100,000,000', 'Área de interés': 'Agricultura Sostenible'},
    {'Nombre': 'Programa BID Agricultura', 'Fuente': 'BID', 'Fecha cierre': '2025-10-31', 'Enlace': 'https://www.iadb.org', 'Estado': 'Abierto', 'Monto': 'USD 75,000,000', 'Área de interés': 'Desarrollo Rural'},
    {'Nombre': 'Fondo FIDA Pequeños Productores', 'Fuente': 'FIDA', 'Fecha cierre': '2025-11-30', 'Enlace': 'https://www.ifad.org', 'Estado': 'Abierto', 'Monto': 'USD 60,000,000', 'Área de interés': 'Desarrollo Rural'},
    {'Nombre': 'Programa UNDP Desarrollo', 'Fuente': 'UNDP', 'Fecha cierre': '2025-12-31', 'Enlace': 'https://www.undp.org', 'Estado': 'Abierto', 'Monto': 'USD 40,000,000', 'Área de interés': 'Desarrollo Rural'}
]

# Crear DataFrame y guardar
df = pd.DataFrame(proyectos)
df.to_excel('data/proyectos_actualizados.xlsx', index=False, engine='openpyxl')
print('✅ Archivo Excel creado correctamente con', len(proyectos), 'proyectos')
