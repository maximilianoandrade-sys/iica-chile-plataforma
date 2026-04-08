#!/usr/bin/env python3
"""
Script para fortalecer la sección de documentos con documentos específicos por proyecto
"""

import pandas as pd
import os
from datetime import datetime

def fortalecer_documentos():
    """Fortalecer la sección de documentos con documentos específicos por área de proyecto"""
    
    print("📋 Fortaleciendo sección de documentos...")
    
    # Documentos específicos por área de interés
    documentos_por_area = {
        'Agricultura Sostenible': {
            'documentos_obligatorios': [
                'Plan de Manejo Sostenible del Suelo',
                'Certificado de Buenas Prácticas Agrícolas',
                'Estudio de Impacto Ambiental',
                'Plan de Gestión de Residuos Orgánicos',
                'Certificado de Uso de Semillas Certificadas'
            ],
            'documentos_complementarios': [
                'Plan de Capacitación en Agricultura Sostenible',
                'Certificado de Participación en Programas Ambientales',
                'Estudio de Mercado para Productos Sostenibles',
                'Plan de Comercialización Verde'
            ],
            'plantillas': [
                'Plantilla_Plan_Manejo_Suelo.docx',
                'Plantilla_Estudio_Impacto_Ambiental.docx',
                'Plantilla_Plan_Gestion_Residuos.docx'
            ]
        },
        'Juventudes Rurales': {
            'documentos_obligatorios': [
                'Carta de Motivación Personal',
                'Plan de Vida y Carrera',
                'Certificado de Estudios (mínimo enseñanza media)',
                'Carta de Recomendación de Autoridad Local',
                'Plan de Emprendimiento Rural'
            ],
            'documentos_complementarios': [
                'Certificado de Participación en Programas Juveniles',
                'Plan de Desarrollo de Habilidades Blandas',
                'Estudio de Viabilidad del Proyecto',
                'Plan de Networking Rural'
            ],
            'plantillas': [
                'Plantilla_Carta_Motivacion.docx',
                'Plantilla_Plan_Emprendimiento.docx',
                'Plantilla_Plan_Vida_Carrera.docx'
            ]
        },
        'Innovación Tecnológica': {
            'documentos_obligatorios': [
                'Propuesta Técnica de Innovación',
                'Plan de Investigación y Desarrollo',
                'Certificado de Propiedad Intelectual',
                'Estudio de Viabilidad Técnica',
                'Plan de Transferencia Tecnológica'
            ],
            'documentos_complementarios': [
                'Patente o Solicitud de Patente',
                'Certificado de Participación en Ferias Tecnológicas',
                'Plan de Comercialización de Tecnología',
                'Estudio de Mercado Tecnológico'
            ],
            'plantillas': [
                'Plantilla_Propuesta_Tecnica.docx',
                'Plantilla_Plan_I_D.docx',
                'Plantilla_Transferencia_Tecnologica.docx'
            ]
        },
        'Gestión Hídrica': {
            'documentos_obligatorios': [
                'Plan de Gestión Integral del Agua',
                'Certificado de Eficiencia Hídrica',
                'Estudio Hidrológico del Área',
                'Plan de Monitoreo de Calidad del Agua',
                'Certificado de Uso Eficiente del Agua'
            ],
            'documentos_complementarios': [
                'Plan de Conservación de Cuencas',
                'Certificado de Tecnologías de Riego Eficiente',
                'Estudio de Impacto Hídrico',
                'Plan de Educación Ambiental Hídrica'
            ],
            'plantillas': [
                'Plantilla_Plan_Gestion_Agua.docx',
                'Plantilla_Estudio_Hidrologico.docx',
                'Plantilla_Monitoreo_Calidad.docx'
            ]
        },
        'Desarrollo Rural': {
            'documentos_obligatorios': [
                'Plan de Desarrollo Comunitario',
                'Certificado de Participación Comunitaria',
                'Estudio Socioeconómico del Área',
                'Plan de Fortalecimiento Organizacional',
                'Certificado de Liderazgo Comunitario'
            ],
            'documentos_complementarios': [
                'Plan de Capacitación Comunitaria',
                'Certificado de Participación en Asociaciones',
                'Estudio de Necesidades Comunitarias',
                'Plan de Sostenibilidad Comunitaria'
            ],
            'plantillas': [
                'Plantilla_Plan_Desarrollo_Comunitario.docx',
                'Plantilla_Estudio_Socioeconomico.docx',
                'Plantilla_Fortalecimiento_Organizacional.docx'
            ]
        },
        'Seguridad Alimentaria': {
            'documentos_obligatorios': [
                'Plan de Seguridad Alimentaria',
                'Certificado de Inocuidad Alimentaria',
                'Plan de Producción de Alimentos',
                'Certificado de Manipulación de Alimentos',
                'Plan de Distribución Alimentaria'
            ],
            'documentos_complementarios': [
                'Plan de Nutrición Comunitaria',
                'Certificado de Producción Orgánica',
                'Estudio de Acceso a Alimentos',
                'Plan de Educación Nutricional'
            ],
            'plantillas': [
                'Plantilla_Plan_Seguridad_Alimentaria.docx',
                'Plantilla_Produccion_Alimentos.docx',
                'Plantilla_Distribucion_Alimentaria.docx'
            ]
        }
    }
    
    # Crear directorio de documentos si no existe
    os.makedirs('static/documentos', exist_ok=True)
    os.makedirs('static/plantillas', exist_ok=True)
    
    # Crear archivos de documentos (simulados)
    for area, docs in documentos_por_area.items():
        area_dir = f"static/documentos/{area.replace(' ', '_').lower()}"
        os.makedirs(area_dir, exist_ok=True)
        
        # Crear archivos de documentos obligatorios
        for doc in docs['documentos_obligatorios']:
            doc_file = f"{area_dir}/{doc.replace(' ', '_').lower()}.txt"
            with open(doc_file, 'w', encoding='utf-8') as f:
                f.write(f"Documento: {doc}\n")
                f.write(f"Área: {area}\n")
                f.write(f"Tipo: Obligatorio\n")
                f.write(f"Descripción: Este documento es requerido para postular a proyectos de {area}.\n")
                f.write(f"Fecha de creación: {datetime.now().strftime('%Y-%m-%d')}\n")
        
        # Crear archivos de documentos complementarios
        for doc in docs['documentos_complementarios']:
            doc_file = f"{area_dir}/{doc.replace(' ', '_').lower()}.txt"
            with open(doc_file, 'w', encoding='utf-8') as f:
                f.write(f"Documento: {doc}\n")
                f.write(f"Área: {area}\n")
                f.write(f"Tipo: Complementario\n")
                f.write(f"Descripción: Este documento complementa la postulación a proyectos de {area}.\n")
                f.write(f"Fecha de creación: {datetime.now().strftime('%Y-%m-%d')}\n")
        
        # Crear plantillas
        for plantilla in docs['plantillas']:
            plantilla_file = f"static/plantillas/{plantilla}"
            with open(plantilla_file, 'w', encoding='utf-8') as f:
                f.write(f"Plantilla: {plantilla}\n")
                f.write(f"Área: {area}\n")
                f.write(f"Descripción: Plantilla para {plantilla.replace('_', ' ').replace('.docx', '')}\n")
                f.write(f"Fecha de creación: {datetime.now().strftime('%Y-%m-%d')}\n")
    
    # Crear archivo de índice de documentos
    with open('static/documentos/indice_documentos.json', 'w', encoding='utf-8') as f:
        import json
        json.dump(documentos_por_area, f, ensure_ascii=False, indent=2)
    
    print(f"✅ Documentos fortalecidos para {len(documentos_por_area)} áreas")
    print(f"📁 Directorios creados: static/documentos/ y static/plantillas/")
    print(f"📋 Documentos por área:")
    for area, docs in documentos_por_area.items():
        print(f"  • {area}: {len(docs['documentos_obligatorios'])} obligatorios, {len(docs['documentos_complementarios'])} complementarios")
    
    return documentos_por_area

def main():
    """Función principal"""
    print("📋 FORTALECIMIENTO DE DOCUMENTOS")
    print("=" * 50)
    
    try:
        documentos = fortalecer_documentos()
        
        print("=" * 50)
        print(f"✅ Fortalecimiento completado exitosamente")
        print(f"📊 Áreas cubiertas: {len(documentos)}")
        print(f"📁 Archivos creados en static/documentos/ y static/plantillas/")
        print(f"📋 Índice guardado en static/documentos/indice_documentos.json")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False
    
    return True

if __name__ == "__main__":
    main()
