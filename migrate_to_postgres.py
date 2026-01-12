"""
Script de Migración: Excel → PostgreSQL
Migra datos existentes a la nueva base de datos
"""

import pandas as pd
import os
from datetime import datetime
from models import db, Fondo, ActualizacionFondo
from app_mvp import app
import re

def parse_monto(monto_str):
    """Extraer monto numérico de string"""
    if pd.isna(monto_str):
        return None
    
    if isinstance(monto_str, (int, float)):
        return int(monto_str)
    
    # Extraer números
    numeros = re.findall(r'[\d.]+', str(monto_str).replace('.', '').replace(',', ''))
    if numeros:
        try:
            return int(numeros[0])
        except:
            return None
    return None

def parse_fecha(fecha_str):
    """Convertir fecha a objeto date"""
    if pd.isna(fecha_str):
        return None
    
    if isinstance(fecha_str, datetime):
        return fecha_str.date()
    
    # Intentar parsear diferentes formatos
    formatos = ['%Y-%m-%d', '%d-%m-%Y', '%d/%m/%Y', '%Y/%m/%d']
    for formato in formatos:
        try:
            return datetime.strptime(str(fecha_str), formato).date()
        except:
            continue
    return None

def migrar_excel_a_postgres():
    """Migrar datos de Excel a PostgreSQL"""
    print("=" * 60)
    print("🔄 MIGRACIÓN EXCEL → POSTGRESQL")
    print("=" * 60)
    
    # Archivos a migrar
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    archivos = [
        'proyectos_reales_2026.xlsx',
        'proyectos_fortalecidos.xlsx',
        'proyectos_completos.xlsx'
    ]
    
    fondos_migrados = 0
    fondos_duplicados = 0
    
    with app.app_context():
        # Crear tablas si no existen
        db.create_all()
        print("✅ Tablas creadas/verificadas")
        
        for archivo in archivos:
            filepath = os.path.join(data_dir, archivo)
            
            if not os.path.exists(filepath):
                print(f"⚠️  Archivo no encontrado: {archivo}")
                continue
            
            print(f"\n📂 Procesando: {archivo}")
            
            try:
                df = pd.read_excel(filepath)
                print(f"   Registros en Excel: {len(df)}")
                
                for idx, row in df.iterrows():
                    nombre = str(row.get('Nombre', '')).strip()
                    
                    if not nombre:
                        continue
                    
                    # Verificar si ya existe
                    existe = Fondo.query.filter_by(nombre=nombre).first()
                    if existe:
                        fondos_duplicados += 1
                        continue
                    
                    # Crear nuevo fondo
                    fondo = Fondo(
                        nombre=nombre,
                        fuente=str(row.get('Fuente', 'Sin fuente')).strip(),
                        descripcion=str(row.get('Descripción', row.get('Descripcion', ''))).strip(),
                        monto=parse_monto(row.get('Monto')),
                        monto_texto=str(row.get('Monto', '')).strip(),
                        fecha_cierre=parse_fecha(row.get('Fecha cierre', row.get('Fecha Cierre'))),
                        area_interes=str(row.get('Área de interés', row.get('Area de interes', 'General'))).strip(),
                        estado=str(row.get('Estado', 'Abierto')).strip(),
                        region=str(row.get('Región', row.get('Region', 'Nacional'))).strip(),
                        enlace=str(row.get('Enlace', '')).strip(),
                        enlace_postulacion=str(row.get('Enlace Postulación', row.get('Enlace Postulacion', ''))).strip(),
                        beneficiarios=str(row.get('Beneficiarios', '')).strip(),
                        palabras_clave=str(row.get('Palabras Clave', '')).strip(),
                        fecha_scraping=datetime.utcnow()
                    )
                    
                    db.session.add(fondo)
                    fondos_migrados += 1
                
                db.session.commit()
                print(f"✅ Migrados: {fondos_migrados - fondos_duplicados} fondos nuevos")
                
            except Exception as e:
                print(f"❌ Error procesando {archivo}: {e}")
                db.session.rollback()
                continue
        
        # Registrar migración
        actualizacion = ActualizacionFondo(
            fuente='Migración Excel',
            fondos_nuevos=fondos_migrados,
            exitoso=True
        )
        db.session.add(actualizacion)
        db.session.commit()
        
        print("\n" + "=" * 60)
        print(f"✅ MIGRACIÓN COMPLETADA")
        print(f"   Fondos migrados: {fondos_migrados}")
        print(f"   Duplicados omitidos: {fondos_duplicados}")
        print(f"   Total en BD: {Fondo.query.count()}")
        print("=" * 60)

if __name__ == '__main__':
    migrar_excel_a_postgres()
