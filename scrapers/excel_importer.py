from utils import clasificar_area, parsear_fecha, parsear_monto
import pandas as pd
import os
from datetime import datetime

def obtener_proyectos_excel():
    """
    Importa proyectos desde archivos Excel en la carpeta data/
    Busca archivos .xlsx y .xls en data/ y los procesa
    """
    proyectos = []
    
    # Directorio donde buscar archivos Excel
    data_dir = "data"
    excel_files = []
    
    try:
        # Buscar archivos Excel en el directorio data/
        if os.path.exists(data_dir):
            for file in os.listdir(data_dir):
                if file.endswith(('.xlsx', '.xls')) and not file.startswith('proyectos'):
                    excel_files.append(os.path.join(data_dir, file))
    except Exception as e:
        print(f"Error buscando archivos Excel: {e}")
        return proyectos
    
    # Procesar cada archivo Excel encontrado
    for excel_file in excel_files:
        try:
            print(f"Procesando archivo Excel: {excel_file}")
            
            # Leer el archivo Excel
            df = pd.read_excel(excel_file)
            
            # Mapear columnas comunes (flexible)
            column_mapping = {
                'nombre': ['nombre', 'name', 'titulo', 'title', 'proyecto', 'project'],
                'fuente': ['fuente', 'source', 'origen', 'origin'],
                'fecha': ['fecha', 'date', 'fecha_cierre', 'deadline', 'cierre'],
                'enlace': ['enlace', 'link', 'url', 'web'],
                'monto': ['monto', 'amount', 'presupuesto', 'budget', 'valor'],
                'estado': ['estado', 'status', 'estatus']
            }
            
            # Encontrar las columnas correctas
            found_columns = {}
            for key, possible_names in column_mapping.items():
                for col in df.columns:
                    if any(name.lower() in col.lower() for name in possible_names):
                        found_columns[key] = col
                        break
            
            # Procesar cada fila del Excel
            for index, row in df.iterrows():
                try:
                    # Extraer datos usando las columnas encontradas
                    nombre = str(row.get(found_columns.get('nombre', ''), f'Proyecto Excel {index+1}'))
                    fuente = str(row.get(found_columns.get('fuente', ''), 'Excel Import'))
                    fecha = str(row.get(found_columns.get('fecha', ''), '31/12/2025'))
                    enlace = str(row.get(found_columns.get('enlace', ''), '#'))
                    monto = str(row.get(found_columns.get('monto', ''), 'Consultar'))
                    estado = str(row.get(found_columns.get('estado', ''), 'Abierto'))
                    
                    # Crear proyecto
                    proyecto = {
                        "Nombre": nombre,
                        "Fuente": fuente,
                        "Fecha cierre": fecha,
                        "Enlace": enlace if enlace.startswith('http') else '#',
                        "Monto": monto,
                        "Estado": estado
                    }
                    
                    # Aplicar utilidades de normalización
                    proyecto['Área de interés'] = clasificar_area(proyecto['Nombre'])
                    proyecto['Fecha cierre'] = parsear_fecha(proyecto['Fecha cierre'])
                    proyecto['Monto'] = parsear_monto(proyecto['Monto'])
                    
                    proyectos.append(proyecto)
                    
                except Exception as e:
                    print(f"Error procesando fila {index} del archivo {excel_file}: {e}")
                    continue
                    
        except Exception as e:
            print(f"Error procesando archivo {excel_file}: {e}")
            continue
    
    print(f"Importados {len(proyectos)} proyectos desde archivos Excel")
    return proyectos

def crear_plantilla_excel():
    """
    Crea una plantilla Excel de ejemplo para que los usuarios sepan el formato
    """
    try:
        # Crear DataFrame de ejemplo
        data = {
            'nombre': [
                'Proyecto de Innovación Agrícola',
                'Desarrollo Rural Sostenible',
                'Tecnología para el Campo'
            ],
            'fuente': [
                'Fondo de Innovación',
                'Cooperación Internacional',
                'Programa Nacional'
            ],
            'fecha': [
                '15/12/2025',
                '20/12/2025',
                '25/12/2025'
            ],
            'enlace': [
                'https://ejemplo.com/proyecto1',
                'https://ejemplo.com/proyecto2',
                'https://ejemplo.com/proyecto3'
            ],
            'monto': [
                '50000 USD',
                '100000 EUR',
                '75000 CLP'
            ],
            'estado': [
                'Abierto',
                'Abierto',
                'Cerrado'
            ]
        }
        
        df = pd.DataFrame(data)
        
        # Guardar plantilla
        template_path = "data/plantilla_proyectos.xlsx"
        df.to_excel(template_path, index=False)
        print(f"Plantilla creada en: {template_path}")
        
        return template_path
        
    except Exception as e:
        print(f"Error creando plantilla: {e}")
        return None
