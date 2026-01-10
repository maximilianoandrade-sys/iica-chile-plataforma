"""
Script to generate funding opportunities data from research on:
- Devex.com
- DevelopmentAid.org
- MercadoPublico.cl
- UNGM.org
And other international funding sources.
"""

import pandas as pd
import os
from datetime import datetime

# Funding opportunities researched from multiple sources
FUNDING_OPPORTUNITIES = [
    # From DevelopmentAid / FONTAGRO
    {
        'Nombre': 'FONTAGRO - Convocatoria de Propuestas 2026',
        'Fuente': 'FONTAGRO',
        'Descripción': 'Financiamiento para proyectos innovadores que aumenten sosteniblemente la productividad agrícola en América Latina y el Caribe, especialmente en contexto de cambio climático. Proyectos de hasta 36 meses.',
        'Monto': 'USD 200,000',
        'Fecha cierre': '2026-03-30',
        'Estado': 'Abierto',
        'Área de interés': 'Innovación Agrícola',
        'Enlace': 'https://www.fontagro.org/convocatoria-2026/',
        'País objetivo': 'América Latina y Caribe'
    },
    # From GAFSP
    {
        'Nombre': 'GAFSP - Eighth Call 2025 for Producer Organizations',
        'Fuente': 'GAFSP',
        'Descripción': 'Programa de $38 millones para fortalecer sistemas alimentarios, mejorar resiliencia climática y empoderar comunidades rurales. Enfocado en organizaciones de productores.',
        'Monto': 'USD 38,000,000',
        'Fecha cierre': '2025-11-11',
        'Estado': 'Abierto',
        'Área de interés': 'Seguridad Alimentaria',
        'Enlace': 'https://www.gafspfund.org/call2025',
        'País objetivo': 'Global'
    },
    # From EuropeAid
    {
        'Nombre': 'EUCaN Facility Nourishing Futures - Protección Social y Nutrición',
        'Fuente': 'EuropeAid',
        'Descripción': 'Financiamiento para sistemas agroalimentarios sostenibles en el Caribe. Enfoque en protección social y nutrición.',
        'Monto': 'EUR 500,000',
        'Fecha cierre': '2026-01-20',
        'Estado': 'Abierto',
        'Área de interés': 'Nutrición y Seguridad Alimentaria',
        'Enlace': 'https://www.developmentaid.org/grants/eucan',
        'País objetivo': 'Caribe'
    },
    # From Conservation Food and Health Foundation
    {
        'Nombre': 'Conservation Food and Health Foundation Grants',
        'Fuente': 'Conservation Foundation',
        'Descripción': 'Grants para proyectos en África, Asia, América Latina y Medio Oriente enfocados en producción alimentaria, protección ambiental y salud pública.',
        'Monto': 'USD 25,000 - 50,000',
        'Fecha cierre': '2025-06-15',
        'Estado': 'Abierto',
        'Área de interés': 'Producción Alimentaria Sostenible',
        'Enlace': 'https://www.conservationfoodhealth.org/grants',
        'País objetivo': 'América Latina'
    },
    # From Rockefeller Foundation
    {
        'Nombre': 'Rockefeller Foundation - Regenerative Agriculture Initiative',
        'Fuente': 'Rockefeller Foundation',
        'Descripción': 'Iniciativa de $100 millones para construir mercados para producción regenerativa/agroecológica con enfoque en Brasil y América Latina.',
        'Monto': 'USD 100,000,000',
        'Fecha cierre': '2026-06-30',
        'Estado': 'Abierto',
        'Área de interés': 'Agricultura Regenerativa',
        'Enlace': 'https://www.rockefellerfoundation.org/regenerative-agriculture',
        'País objetivo': 'Brasil y América Latina'
    },
    # From IFAD
    {
        'Nombre': 'IFAD - Digital Rural Inclusion and Youth Empowerment',
        'Fuente': 'IFAD',
        'Descripción': 'Provisión de tecnologías TIC para inclusión rural digital y empoderamiento juvenil en comunidades rurales.',
        'Monto': 'USD 500,000',
        'Fecha cierre': '2025-09-30',
        'Estado': 'Abierto',
        'Área de interés': 'Inclusión Digital Rural',
        'Enlace': 'https://www.ifad.org/tenders',
        'País objetivo': 'Global'
    },
    # From FAO Chile
    {
        'Nombre': 'FAO Chile - Centro de Semillas Huillilemu',
        'Fuente': 'FAO',
        'Descripción': 'Construcción del Centro de Semillas Huillilemu en la Región de Los Ríos, Chile. Proyecto de infraestructura agrícola.',
        'Monto': 'USD 800,000',
        'Fecha cierre': '2025-09-15',
        'Estado': 'Próximo',
        'Área de interés': 'Infraestructura Agrícola',
        'Enlace': 'https://www.fao.org/chile/tenders',
        'País objetivo': 'Chile'
    },
    # From UNIDO
    {
        'Nombre': 'UNIDO A2D Facility - Proyectos de Demostración',
        'Fuente': 'UNIDO',
        'Descripción': 'Convocatoria para selección de beneficiarios de grants para implementación de proyectos de demostración A2D en países en desarrollo.',
        'Monto': 'USD 150,000',
        'Fecha cierre': '2025-12-31',
        'Estado': 'Abierto',
        'Área de interés': 'Desarrollo Industrial Sostenible',
        'Enlace': 'https://www.unido.org/a2d-facility',
        'País objetivo': 'Países en Desarrollo'
    },
    # From IDB - AgroLAC
    {
        'Nombre': 'AgroLAC 2025 - Productividad Agrícola Sostenible',
        'Fuente': 'BID',
        'Descripción': 'Plataforma multi-donante del BID con The Nature Conservancy para mejorar productividad agrícola y reducir impacto ambiental en América Latina. Fondo total de $50 millones.',
        'Monto': 'USD 5,000,000',
        'Fecha cierre': '2025-12-15',
        'Estado': 'Abierto',
        'Área de interés': 'Productividad Agrícola',
        'Enlace': 'https://www.iadb.org/agrolac',
        'País objetivo': 'América Latina'
    },
    # From Nordic Development Fund / CSAF
    {
        'Nombre': 'Climate-Smart Agriculture Fund (CSAF)',
        'Fuente': 'NDF/BID',
        'Descripción': 'Fondo de financiamiento concesional para atraer inversión del sector privado hacia agricultura sostenible, silvicultura y desarrollo de pastizales en la región.',
        'Monto': 'EUR 5,000,000',
        'Fecha cierre': '2026-03-15',
        'Estado': 'Abierto',
        'Área de interés': 'Agricultura Climáticamente Inteligente',
        'Enlace': 'https://www.ndf.int/csaf',
        'País objetivo': 'América Latina y Caribe'
    },
    # From FAO - Latin America without Hunger
    {
        'Nombre': 'América Latina y el Caribe Sin Hambre 2025',
        'Fuente': 'FAO',
        'Descripción': 'Programa de cooperación Brasil-FAO enfocado en seguridad alimentaria y nutricional, reducción de pobreza y asistencia técnica. Énfasis en agricultura familiar.',
        'Monto': 'USD 2,000,000',
        'Fecha cierre': '2025-12-31',
        'Estado': 'Abierto',
        'Área de interés': 'Seguridad Alimentaria',
        'Enlace': 'https://www.fao.org/alc-sin-hambre',
        'País objetivo': 'América Latina y Caribe'
    },
    # From Gates Foundation (via DevelopmentAid)
    {
        'Nombre': 'Gates Foundation - Agricultural Development Grant',
        'Fuente': 'Gates Foundation',
        'Descripción': 'Financiamiento para proyectos de desarrollo agrícola con enfoque en pequeños productores y sistemas alimentarios sostenibles.',
        'Monto': 'USD 1,000,000',
        'Fecha cierre': '2025-03-25',
        'Estado': 'Próximo',
        'Área de interés': 'Desarrollo Agrícola',
        'Enlace': 'https://www.developmentaid.org/grants/gates',
        'País objetivo': 'Global'
    },
    # From UN Indigenous Youth Forum
    {
        'Nombre': 'UN Global Indigenous Youth Forum 2026 - Sistemas Alimentarios',
        'Fuente': 'ONU',
        'Descripción': 'Convocatoria para jóvenes indígenas enfocada en sistemas alimentarios y conocimiento tradicional, biodiversidad, restauración de ecosistemas y resiliencia climática.',
        'Monto': 'USD 50,000',
        'Fecha cierre': '2026-06-30',
        'Estado': 'Abierto',
        'Área de interés': 'Conocimiento Indígena',
        'Enlace': 'https://www.fao.org/ungiyf',
        'País objetivo': 'Global'
    },
    # From CELAC
    {
        'Nombre': 'CELAC Plan SAN 2024-2030 - Erradicación del Hambre',
        'Fuente': 'CELAC',
        'Descripción': 'Marco regional para alcanzar los ODS relacionados con el hambre y la malnutrición. Financiamiento para proyectos nacionales alineados.',
        'Monto': 'USD 500,000',
        'Fecha cierre': '2026-12-31',
        'Estado': 'Abierto',
        'Área de interés': 'Erradicación del Hambre',
        'Enlace': 'https://www.cepal.org/celac-san',
        'País objetivo': 'América Latina y Caribe'
    },
    # Chile specific - from prior research
    {
        'Nombre': 'FIA - Convocatoria Nacional de Innovación 2026',
        'Fuente': 'FIA',
        'Descripción': 'Financiamiento para proyectos de innovación agrícola en Chile. Enfoque en digitalización, sustentabilidad y adaptación al cambio climático.',
        'Monto': 'CLP 200,000,000',
        'Fecha cierre': '2026-04-30',
        'Estado': 'Abierto',
        'Área de interés': 'Innovación Agrícola',
        'Enlace': 'https://www.fia.cl/convocatorias',
        'País objetivo': 'Chile'
    },
    # INDAP - Chile
    {
        'Nombre': 'INDAP - Programa de Desarrollo Rural 2026',
        'Fuente': 'INDAP',
        'Descripción': 'Programa para pequeños agricultores chilenos. Incluye asistencia técnica, financiamiento y capacitación.',
        'Monto': 'CLP 50,000,000',
        'Fecha cierre': '2026-03-31',
        'Estado': 'Abierto',
        'Área de interés': 'Desarrollo Rural',
        'Enlace': 'https://www.indap.cl/programas',
        'País objetivo': 'Chile'
    },
    # CORFO - Chile
    {
        'Nombre': 'CORFO Innova - Agroindustria Sustentable',
        'Fuente': 'CORFO',
        'Descripción': 'Financiamiento para proyectos de innovación en agroindustria chilena con enfoque en sustentabilidad y economía circular.',
        'Monto': 'CLP 300,000,000',
        'Fecha cierre': '2026-05-15',
        'Estado': 'Abierto',
        'Área de interés': 'Agroindustria',
        'Enlace': 'https://www.corfo.cl/innova-agro',
        'País objetivo': 'Chile'
    },
    # ANID - Chile
    {
        'Nombre': 'ANID FONDECYT - Investigación Agrícola 2026',
        'Fuente': 'ANID',
        'Descripción': 'Financiamiento para investigación científica en áreas agrícolas, incluyendo biotecnología, recursos hídricos y cambio climático.',
        'Monto': 'CLP 150,000,000',
        'Fecha cierre': '2026-06-30',
        'Estado': 'Abierto',
        'Área de interés': 'Investigación Agrícola',
        'Enlace': 'https://www.anid.cl/fondecyt',
        'País objetivo': 'Chile'
    }
]

def generate_excel_file():
    """Generate Excel file with funding opportunities"""
    df = pd.DataFrame(FUNDING_OPPORTUNITIES)
    
    # Ensure data directory exists
    data_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
    os.makedirs(data_dir, exist_ok=True)
    
    # Save to Excel
    output_path = os.path.join(data_dir, 'proyectos_reales_2026.xlsx')
    df.to_excel(output_path, index=False, engine='openpyxl')
    
    print(f"[OK] Generated {len(FUNDING_OPPORTUNITIES)} funding opportunities")
    print(f"[OK] Saved to: {output_path}")
    
    return output_path

if __name__ == '__main__':
    generate_excel_file()
