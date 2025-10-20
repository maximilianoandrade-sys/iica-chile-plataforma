import pandas as pd
import os

# Crear directorio si no existe
os.makedirs('data', exist_ok=True)

# Datos de proyectos completos para IICA Chile
proyectos = [
    # PROYECTOS NACIONALES CHILE
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
    {'Nombre': 'Crédito Empresas Certificadas', 'Fuente': 'Minagri', 'Fecha cierre': '2025-10-15', 'Enlace': 'https://minagri.gob.cl', 'Estado': 'Abierto', 'Monto': 'USD 18,000,000', 'Área de interés': 'Agricultura Sostenible'},
    {'Nombre': 'Crédito Enlace Riego', 'Fuente': 'Minagri', 'Fecha cierre': '2025-11-15', 'Enlace': 'https://minagri.gob.cl', 'Estado': 'Abierto', 'Monto': 'USD 25,000,000', 'Área de interés': 'Gestión Hídrica'},
    {'Nombre': 'Crédito Enlace Suelos', 'Fuente': 'Minagri', 'Fecha cierre': '2025-12-31', 'Enlace': 'https://minagri.gob.cl', 'Estado': 'Abierto', 'Monto': 'USD 22,000,000', 'Área de interés': 'Agricultura Sostenible'},
    {'Nombre': 'Plan Condonación Deudas', 'Fuente': 'INDAP', 'Fecha cierre': '2025-06-30', 'Enlace': 'https://www.indap.gob.cl', 'Estado': 'Abierto', 'Monto': 'USD 50,000,000', 'Área de interés': 'Desarrollo Rural'},
    {'Nombre': 'Consorcio Desierto', 'Fuente': 'CONICYT', 'Fecha cierre': '2025-08-31', 'Enlace': 'https://www.conicyt.cl', 'Estado': 'Abierto', 'Monto': 'USD 30,000,000', 'Área de interés': 'Innovación Tecnológica'},
    {'Nombre': 'Programa Mujeres Rurales', 'Fuente': 'INDAP-PRODEMU', 'Fecha cierre': '2025-07-31', 'Enlace': 'https://www.indap.gob.cl', 'Estado': 'Abierto', 'Monto': 'USD 15,000,000', 'Área de interés': 'Desarrollo Rural'},
    {'Nombre': 'Eliminación Carbono Atmosférico', 'Fuente': 'Ministerio Ambiente', 'Fecha cierre': '2025-09-30', 'Enlace': 'https://mma.gob.cl', 'Estado': 'Abierto', 'Monto': 'USD 40,000,000', 'Área de interés': 'Agricultura Sostenible'},
    {'Nombre': 'NAMA Chile Silvicultura', 'Fuente': 'Ministerio Ambiente', 'Fecha cierre': '2025-10-31', 'Enlace': 'https://mma.gob.cl', 'Estado': 'Abierto', 'Monto': 'USD 35,000,000', 'Área de interés': 'Agricultura Sostenible'},
    {'Nombre': 'Crédito Compra Tierras', 'Fuente': 'INDAP', 'Fecha cierre': '2025-11-30', 'Enlace': 'https://www.indap.gob.cl', 'Estado': 'Abierto', 'Monto': 'USD 30,000,000', 'Área de interés': 'Desarrollo Rural'},
    {'Nombre': 'Crédito Inversión Activos', 'Fuente': 'INDAP', 'Fecha cierre': '2025-12-15', 'Enlace': 'https://www.indap.gob.cl', 'Estado': 'Abierto', 'Monto': 'USD 25,000,000', 'Área de interés': 'Innovación Tecnológica'},
    
    # PROYECTOS INTERNACIONALES
    {'Nombre': 'Programa FAO Seguridad Alimentaria', 'Fuente': 'FAO', 'Fecha cierre': '2025-08-31', 'Enlace': 'https://www.fao.org', 'Estado': 'Abierto', 'Monto': 'USD 50,000,000', 'Área de interés': 'Seguridad Alimentaria'},
    {'Nombre': 'Fondo Verde del Clima', 'Fuente': 'Banco Mundial', 'Fecha cierre': '2025-09-30', 'Enlace': 'https://www.worldbank.org', 'Estado': 'Abierto', 'Monto': 'USD 100,000,000', 'Área de interés': 'Agricultura Sostenible'},
    {'Nombre': 'Programa BID Agricultura', 'Fuente': 'BID', 'Fecha cierre': '2025-10-31', 'Enlace': 'https://www.iadb.org', 'Estado': 'Abierto', 'Monto': 'USD 75,000,000', 'Área de interés': 'Desarrollo Rural'},
    {'Nombre': 'Fondo FIDA Pequeños Productores', 'Fuente': 'FIDA', 'Fecha cierre': '2025-11-30', 'Enlace': 'https://www.ifad.org', 'Estado': 'Abierto', 'Monto': 'USD 60,000,000', 'Área de interés': 'Desarrollo Rural'},
    {'Nombre': 'Programa UNDP Desarrollo', 'Fuente': 'UNDP', 'Fecha cierre': '2025-12-31', 'Enlace': 'https://www.undp.org', 'Estado': 'Abierto', 'Monto': 'USD 40,000,000', 'Área de interés': 'Desarrollo Rural'},
    {'Nombre': 'Fondo GEF Biodiversidad', 'Fuente': 'GEF', 'Fecha cierre': '2025-07-31', 'Enlace': 'https://www.gef.org', 'Estado': 'Abierto', 'Monto': 'USD 30,000,000', 'Área de interés': 'Agricultura Sostenible'},
    {'Nombre': 'Programa UE Horizonte Europa', 'Fuente': 'UE', 'Fecha cierre': '2025-08-31', 'Enlace': 'https://ec.europa.eu', 'Estado': 'Abierto', 'Monto': 'USD 200,000,000', 'Área de interés': 'Innovación Tecnológica'},
    {'Nombre': 'Fondo Canadiense Desarrollo', 'Fuente': 'Canadá', 'Fecha cierre': '2025-09-30', 'Enlace': 'https://www.international.gc.ca', 'Estado': 'Abierto', 'Monto': 'USD 50,000,000', 'Área de interés': 'Desarrollo Rural'},
    {'Nombre': 'Programa Australia Agricultura', 'Fuente': 'Australia', 'Fecha cierre': '2025-10-31', 'Enlace': 'https://www.dfat.gov.au', 'Estado': 'Abierto', 'Monto': 'USD 30,000,000', 'Área de interés': 'Agricultura Sostenible'},
    {'Nombre': 'Fondo Japonés Cooperación', 'Fuente': 'Japón', 'Fecha cierre': '2025-11-30', 'Enlace': 'https://www.mofa.go.jp', 'Estado': 'Abierto', 'Monto': 'USD 40,000,000', 'Área de interés': 'Innovación Tecnológica'},
    
    # PROYECTOS ADICIONALES IICA
    {'Nombre': 'Programa IICA Innovación Agrícola', 'Fuente': 'IICA', 'Fecha cierre': '2025-12-31', 'Enlace': 'https://www.iica.int', 'Estado': 'Abierto', 'Monto': 'USD 25,000,000', 'Área de interés': 'Innovación Tecnológica'},
    {'Nombre': 'Fondo IICA Desarrollo Rural', 'Fuente': 'IICA', 'Fecha cierre': '2025-11-30', 'Enlace': 'https://www.iica.int', 'Estado': 'Abierto', 'Monto': 'USD 35,000,000', 'Área de interés': 'Desarrollo Rural'},
    {'Nombre': 'Programa IICA Sostenibilidad', 'Fuente': 'IICA', 'Fecha cierre': '2025-10-31', 'Enlace': 'https://www.iica.int', 'Estado': 'Abierto', 'Monto': 'USD 45,000,000', 'Área de interés': 'Agricultura Sostenible'},
    {'Nombre': 'Fondo IICA Gestión Hídrica', 'Fuente': 'IICA', 'Fecha cierre': '2025-09-30', 'Enlace': 'https://www.iica.int', 'Estado': 'Abierto', 'Monto': 'USD 20,000,000', 'Área de interés': 'Gestión Hídrica'},
    {'Nombre': 'Programa IICA Seguridad Alimentaria', 'Fuente': 'IICA', 'Fecha cierre': '2025-08-31', 'Enlace': 'https://www.iica.int', 'Estado': 'Abierto', 'Monto': 'USD 30,000,000', 'Área de interés': 'Seguridad Alimentaria'},
    {'Nombre': 'Fondo IICA Comercio Agrícola', 'Fuente': 'IICA', 'Fecha cierre': '2025-07-31', 'Enlace': 'https://www.iica.int', 'Estado': 'Abierto', 'Monto': 'USD 15,000,000', 'Área de interés': 'Comercio Agrícola'},
    
    # PROYECTOS REGIONALES
    {'Nombre': 'Programa CEPAL Desarrollo', 'Fuente': 'CEPAL', 'Fecha cierre': '2025-12-31', 'Enlace': 'https://www.cepal.org', 'Estado': 'Abierto', 'Monto': 'USD 25,000,000', 'Área de interés': 'Desarrollo Rural'},
    {'Nombre': 'Fondo OEA Agricultura', 'Fuente': 'OEA', 'Fecha cierre': '2025-11-30', 'Enlace': 'https://www.oas.org', 'Estado': 'Abierto', 'Monto': 'USD 20,000,000', 'Área de interés': 'Agricultura Sostenible'},
    {'Nombre': 'Programa SICA Innovación', 'Fuente': 'SICA', 'Fecha cierre': '2025-10-31', 'Enlace': 'https://www.sica.int', 'Estado': 'Abierto', 'Monto': 'USD 15,000,000', 'Área de interés': 'Innovación Tecnológica'},
    {'Nombre': 'Fondo CARICOM Desarrollo', 'Fuente': 'CARICOM', 'Fecha cierre': '2025-09-30', 'Enlace': 'https://www.caricom.org', 'Estado': 'Abierto', 'Monto': 'USD 18,000,000', 'Área de interés': 'Desarrollo Rural'},
    {'Nombre': 'Programa MERCOSUR Agricultura', 'Fuente': 'MERCOSUR', 'Fecha cierre': '2025-08-31', 'Enlace': 'https://www.mercosur.int', 'Estado': 'Abierto', 'Monto': 'USD 22,000,000', 'Área de interés': 'Agricultura Sostenible'},
    
    # PROYECTOS PRIVADOS
    {'Nombre': 'Fondo Bill & Melinda Gates', 'Fuente': 'Fundación Gates', 'Fecha cierre': '2025-12-31', 'Enlace': 'https://www.gatesfoundation.org', 'Estado': 'Abierto', 'Monto': 'USD 100,000,000', 'Área de interés': 'Seguridad Alimentaria'},
    {'Nombre': 'Programa Rockefeller Agricultura', 'Fuente': 'Fundación Rockefeller', 'Fecha cierre': '2025-11-30', 'Enlace': 'https://www.rockefellerfoundation.org', 'Estado': 'Abierto', 'Monto': 'USD 50,000,000', 'Área de interés': 'Agricultura Sostenible'},
    {'Nombre': 'Fondo Ford Desarrollo', 'Fuente': 'Fundación Ford', 'Fecha cierre': '2025-10-31', 'Enlace': 'https://www.fordfoundation.org', 'Estado': 'Abierto', 'Monto': 'USD 30,000,000', 'Área de interés': 'Desarrollo Rural'},
    {'Nombre': 'Programa Kellogg Innovación', 'Fuente': 'Fundación Kellogg', 'Fecha cierre': '2025-09-30', 'Enlace': 'https://www.wkkf.org', 'Estado': 'Abierto', 'Monto': 'USD 25,000,000', 'Área de interés': 'Innovación Tecnológica'},
    {'Nombre': 'Fondo MacArthur Sostenibilidad', 'Fuente': 'Fundación MacArthur', 'Fecha cierre': '2025-08-31', 'Enlace': 'https://www.macfound.org', 'Estado': 'Abierto', 'Monto': 'USD 20,000,000', 'Área de interés': 'Agricultura Sostenible'},
    
    # PROYECTOS CORPORATIVOS
    {'Nombre': 'Programa Nestlé Agricultura', 'Fuente': 'Nestlé', 'Fecha cierre': '2025-12-31', 'Enlace': 'https://www.nestle.com', 'Estado': 'Abierto', 'Monto': 'USD 40,000,000', 'Área de interés': 'Agricultura Sostenible'},
    {'Nombre': 'Fondo Unilever Desarrollo', 'Fuente': 'Unilever', 'Fecha cierre': '2025-11-30', 'Enlace': 'https://www.unilever.com', 'Estado': 'Abierto', 'Monto': 'USD 35,000,000', 'Área de interés': 'Desarrollo Rural'},
    {'Nombre': 'Programa Coca-Cola Sostenibilidad', 'Fuente': 'Coca-Cola', 'Fecha cierre': '2025-10-31', 'Enlace': 'https://www.coca-cola.com', 'Estado': 'Abierto', 'Monto': 'USD 30,000,000', 'Área de interés': 'Gestión Hídrica'},
    {'Nombre': 'Fondo PepsiCo Innovación', 'Fuente': 'PepsiCo', 'Fecha cierre': '2025-09-30', 'Enlace': 'https://www.pepsico.com', 'Estado': 'Abierto', 'Monto': 'USD 25,000,000', 'Área de interés': 'Innovación Tecnológica'},
    {'Nombre': 'Programa Walmart Agricultura', 'Fuente': 'Walmart', 'Fecha cierre': '2025-08-31', 'Enlace': 'https://www.walmart.com', 'Estado': 'Abierto', 'Monto': 'USD 20,000,000', 'Área de interés': 'Agricultura Sostenible'},
    
    # PROYECTOS ACADÉMICOS
    {'Nombre': 'Programa Harvard Innovación', 'Fuente': 'Universidad Harvard', 'Fecha cierre': '2025-12-31', 'Enlace': 'https://www.harvard.edu', 'Estado': 'Abierto', 'Monto': 'USD 15,000,000', 'Área de interés': 'Innovación Tecnológica'},
    {'Nombre': 'Fondo MIT Desarrollo', 'Fuente': 'MIT', 'Fecha cierre': '2025-11-30', 'Enlace': 'https://www.mit.edu', 'Estado': 'Abierto', 'Monto': 'USD 12,000,000', 'Área de interés': 'Desarrollo Rural'},
    {'Nombre': 'Programa Stanford Sostenibilidad', 'Fuente': 'Universidad Stanford', 'Fecha cierre': '2025-10-31', 'Enlace': 'https://www.stanford.edu', 'Estado': 'Abierto', 'Monto': 'USD 10,000,000', 'Área de interés': 'Agricultura Sostenible'},
    {'Nombre': 'Fondo Berkeley Investigación', 'Fuente': 'UC Berkeley', 'Fecha cierre': '2025-09-30', 'Enlace': 'https://www.berkeley.edu', 'Estado': 'Abierto', 'Monto': 'USD 8,000,000', 'Área de interés': 'Innovación Tecnológica'},
    {'Nombre': 'Programa Cornell Agricultura', 'Fuente': 'Universidad Cornell', 'Fecha cierre': '2025-08-31', 'Enlace': 'https://www.cornell.edu', 'Estado': 'Abierto', 'Monto': 'USD 6,000,000', 'Área de interés': 'Agricultura Sostenible'},
    
    # PROYECTOS GUBERNAMENTALES INTERNACIONALES
    {'Nombre': 'Programa USAID Agricultura', 'Fuente': 'USAID', 'Fecha cierre': '2025-12-31', 'Enlace': 'https://www.usaid.gov', 'Estado': 'Abierto', 'Monto': 'USD 80,000,000', 'Área de interés': 'Agricultura Sostenible'},
    {'Nombre': 'Fondo DFID Desarrollo', 'Fuente': 'DFID Reino Unido', 'Fecha cierre': '2025-11-30', 'Enlace': 'https://www.gov.uk', 'Estado': 'Abierto', 'Monto': 'USD 60,000,000', 'Área de interés': 'Desarrollo Rural'},
    {'Nombre': 'Programa GIZ Sostenibilidad', 'Fuente': 'GIZ Alemania', 'Fecha cierre': '2025-10-31', 'Enlace': 'https://www.giz.de', 'Estado': 'Abierto', 'Monto': 'USD 45,000,000', 'Área de interés': 'Agricultura Sostenible'},
    {'Nombre': 'Fondo AFD Innovación', 'Fuente': 'AFD Francia', 'Fecha cierre': '2025-09-30', 'Enlace': 'https://www.afd.fr', 'Estado': 'Abierto', 'Monto': 'USD 35,000,000', 'Área de interés': 'Innovación Tecnológica'},
    {'Nombre': 'Programa JICA Cooperación', 'Fuente': 'JICA Japón', 'Fecha cierre': '2025-08-31', 'Enlace': 'https://www.jica.go.jp', 'Estado': 'Abierto', 'Monto': 'USD 40,000,000', 'Área de interés': 'Desarrollo Rural'},
    
    # PROYECTOS ESPECIALIZADOS
    {'Nombre': 'Programa CGIAR Investigación', 'Fuente': 'CGIAR', 'Fecha cierre': '2025-12-31', 'Enlace': 'https://www.cgiar.org', 'Estado': 'Abierto', 'Monto': 'USD 200,000,000', 'Área de interés': 'Innovación Tecnológica'},
    {'Nombre': 'Fondo CIFOR Bosques', 'Fuente': 'CIFOR', 'Fecha cierre': '2025-11-30', 'Enlace': 'https://www.cifor.org', 'Estado': 'Abierto', 'Monto': 'USD 30,000,000', 'Área de interés': 'Agricultura Sostenible'},
    {'Nombre': 'Programa ICRAF Agroforestería', 'Fuente': 'ICRAF', 'Fecha cierre': '2025-10-31', 'Enlace': 'https://www.worldagroforestry.org', 'Estado': 'Abierto', 'Monto': 'USD 25,000,000', 'Área de interés': 'Agricultura Sostenible'},
    {'Nombre': 'Fondo IWMI Agua', 'Fuente': 'IWMI', 'Fecha cierre': '2025-09-30', 'Enlace': 'https://www.iwmi.cgiar.org', 'Estado': 'Abierto', 'Monto': 'USD 20,000,000', 'Área de interés': 'Gestión Hídrica'},
    {'Nombre': 'Programa ILRI Ganadería', 'Fuente': 'ILRI', 'Fecha cierre': '2025-08-31', 'Enlace': 'https://www.ilri.org', 'Estado': 'Abierto', 'Monto': 'USD 15,000,000', 'Área de interés': 'Agricultura Sostenible'}
]

# Crear DataFrame y guardar
df = pd.DataFrame(proyectos)
df.to_excel('data/proyectos_actualizados.xlsx', index=False, engine='openpyxl')
print('✅ Archivo Excel creado correctamente con', len(proyectos), 'proyectos para IICA Chile')
