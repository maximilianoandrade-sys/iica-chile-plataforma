#!/usr/bin/env python3
"""
Sistema de búsqueda avanzada para la plataforma
"""

import re
from datetime import datetime, timedelta
from typing import List, Dict, Any
from utils_excel import leer_excel

class BuscadorAvanzado:
    def __init__(self, proyectos):
        # Acepta lista de diccionarios en lugar de DataFrame
        if isinstance(proyectos, list):
            self.proyectos = proyectos
        else:
            # Si no es lista, intentar convertir para compatibilidad con código antiguo
            # que podría pasar DataFrames u otros tipos iterables
            try:
                # Intentar convertir a lista si tiene método to_dict (pandas DataFrame)
                if hasattr(proyectos, 'to_dict'):
                    self.proyectos = proyectos.to_dict('records')
                # Si es iterable pero no lista, convertir a lista
                elif hasattr(proyectos, '__iter__') and not isinstance(proyectos, (str, bytes)):
                    self.proyectos = list(proyectos)
                else:
                    # Si no es iterable o es string/bytes, usar lista vacía
                    self.proyectos = []
            except Exception:
                # Si falla cualquier conversión, usar lista vacía
                self.proyectos = []
        self.palabras_clave_areas = {
            'agricultura': ['agricultura', 'cultivo', 'siembra', 'cosecha', 'rural'],
            'innovacion': ['innovación', 'tecnología', 'digital', 'agtech', 'precisión'],
            'sostenible': ['sostenible', 'ecológico', 'orgánico', 'biodiversidad', 'clima'],
            'rural': ['rural', 'campesino', 'comunidad', 'territorial', 'local'],
            'juventud': ['joven', 'juvenil', 'liderazgo', 'emprendimiento', 'capacitación'],
            'exportacion': ['exportación', 'internacional', 'mercado', 'comercialización'],
            'financiamiento': ['financiamiento', 'subsidio', 'crédito', 'capital', 'inversión']
        }
    
    def buscar_por_texto(self, texto_busqueda: str) -> List[Dict]:
        """Búsqueda por texto libre"""
        if not texto_busqueda:
            return []
        
        texto_busqueda = texto_busqueda.lower()
        resultados = []
        
        for proyecto in self.proyectos:
            # Buscar en nombre
            if 'Nombre' in proyecto and proyecto.get('Nombre') and texto_busqueda in str(proyecto['Nombre']).lower():
                resultados.append({
                    'proyecto': proyecto,
                    'relevancia': 10,
                    'criterio': 'nombre'
                })
            
            # Buscar en descripción
            descripcion = proyecto.get('Descripción', '')
            if descripcion and (not isinstance(descripcion, float) or str(descripcion) != 'nan'):
                if texto_busqueda in str(descripcion).lower():
                    resultados.append({
                        'proyecto': proyecto,
                        'relevancia': 8,
                        'criterio': 'descripción'
                    })
            
            # Buscar en palabras clave
            palabras_clave = proyecto.get('Palabras Clave', '')
            if palabras_clave and (not isinstance(palabras_clave, float) or str(palabras_clave) != 'nan'):
                if texto_busqueda in str(palabras_clave).lower():
                    resultados.append({
                        'proyecto': proyecto,
                        'relevancia': 9,
                        'criterio': 'palabras clave'
                    })
        
        # Ordenar por relevancia
        resultados.sort(key=lambda x: x['relevancia'], reverse=True)
        return resultados
    
    def buscar_por_area(self, area: str) -> List[Dict]:
        """Búsqueda por área de interés"""
        if not area:
            return []
        
        resultados = []
        for proyecto in self.proyectos:
            if proyecto.get('Área de interés') == area:
                resultados.append({
                    'proyecto': proyecto,
                    'relevancia': 10,
                    'criterio': 'área de interés'
                })
        
        return resultados
    
    def buscar_por_fuente(self, fuente: str) -> List[Dict]:
        """Búsqueda por fuente de financiamiento"""
        if not fuente:
            return []
        
        resultados = []
        for proyecto in self.proyectos:
            fuente_proyecto = proyecto.get('Fuente', '')
            if fuente.lower() in str(fuente_proyecto).lower():
                resultados.append({
                    'proyecto': proyecto,
                    'relevancia': 10,
                    'criterio': 'fuente'
                })
        
        return resultados
    
    def buscar_por_monto(self, monto_minimo: float = 0, monto_maximo: float = float('inf')) -> List[Dict]:
        """Búsqueda por rango de monto"""
        resultados = []
        
        for proyecto in self.proyectos:
            try:
                # Extraer monto numérico
                monto_str = str(proyecto.get('Monto', '0')).replace('$', '').replace(',', '').replace(' CLP', '').replace(' USD', '')
                monto_num = float(re.findall(r'\d+', monto_str)[0]) if re.findall(r'\d+', monto_str) else 0
                
                if monto_minimo <= monto_num <= monto_maximo:
                    resultados.append({
                        'proyecto': proyecto,
                        'relevancia': 10,
                        'criterio': 'monto'
                    })
            except:
                continue
        
        return resultados
    
    def buscar_por_estado(self, estado: str) -> List[Dict]:
        """Búsqueda por estado del proyecto"""
        if not estado:
            return []
        
        resultados = []
        for proyecto in self.proyectos:
            if proyecto.get('Estado') == estado:
                resultados.append({
                    'proyecto': proyecto,
                    'relevancia': 10,
                    'criterio': 'estado'
                })
        
        return resultados
    
    def buscar_por_fecha_cierre(self, dias_hasta_cierre: int = 30) -> List[Dict]:
        """Búsqueda por proyectos que cierran pronto"""
        resultados = []
        fecha_limite = datetime.now() + timedelta(days=dias_hasta_cierre)
        
        for proyecto in self.proyectos:
            try:
                fecha_cierre_str = proyecto.get('Fecha cierre', '')
                if not fecha_cierre_str:
                    continue
                # Intentar parsear fecha
                try:
                    fecha_cierre = datetime.strptime(str(fecha_cierre_str), '%Y-%m-%d')
                except:
                    try:
                        fecha_cierre = datetime.strptime(str(fecha_cierre_str), '%d/%m/%Y')
                    except:
                        continue
                if fecha_cierre <= fecha_limite:
                    resultados.append({
                        'proyecto': proyecto,
                        'relevancia': 10,
                        'criterio': 'fecha de cierre'
                    })
            except:
                continue
        
        return resultados
    
    def buscar_por_palabras_clave(self, palabras: List[str]) -> List[Dict]:
        """Búsqueda por palabras clave específicas"""
        if not palabras:
            return []
        
        resultados = []
        for proyecto in self.proyectos:
            relevancia = 0
            criterios = []
            
            # Buscar en nombre
            nombre = proyecto.get('Nombre', '')
            if nombre:
                for palabra in palabras:
                    if palabra.lower() in str(nombre).lower():
                        relevancia += 3
                        criterios.append('nombre')
            
            # Buscar en descripción
            descripcion = proyecto.get('Descripción', '')
            if descripcion and (not isinstance(descripcion, float) or str(descripcion) != 'nan'):
                for palabra in palabras:
                    if palabra.lower() in str(descripcion).lower():
                        relevancia += 2
                        criterios.append('descripción')
            
            # Buscar en palabras clave
            palabras_clave = proyecto.get('Palabras Clave', '')
            if palabras_clave and (not isinstance(palabras_clave, float) or str(palabras_clave) != 'nan'):
                for palabra in palabras:
                    if palabra.lower() in str(palabras_clave).lower():
                        relevancia += 4
                        criterios.append('palabras clave')
            
            if relevancia > 0:
                resultados.append({
                    'proyecto': proyecto,
                    'relevancia': relevancia,
                    'criterio': ', '.join(set(criterios))
                })
        
        # Ordenar por relevancia
        resultados.sort(key=lambda x: x['relevancia'], reverse=True)
        return resultados
    
    def buscar_combinada(self, 
                         texto: str = None,
                         area: str = None,
                         fuente: str = None,
                         estado: str = None,
                         monto_minimo: float = 0,
                         monto_maximo: float = float('inf'),
                         dias_hasta_cierre: int = None,
                         palabras_clave: List[str] = None) -> List[Dict]:
        """Búsqueda combinada con múltiples criterios"""
        
        todos_resultados = []
        
        # Búsqueda por texto
        if texto:
            todos_resultados.extend(self.buscar_por_texto(texto))
        
        # Búsqueda por área
        if area:
            todos_resultados.extend(self.buscar_por_area(area))
        
        # Búsqueda por fuente
        if fuente:
            todos_resultados.extend(self.buscar_por_fuente(fuente))
        
        # Búsqueda por estado
        if estado:
            todos_resultados.extend(self.buscar_por_estado(estado))
        
        # Búsqueda por monto
        if monto_minimo > 0 or monto_maximo < float('inf'):
            todos_resultados.extend(self.buscar_por_monto(monto_minimo, monto_maximo))
        
        # Búsqueda por fecha de cierre
        if dias_hasta_cierre:
            todos_resultados.extend(self.buscar_por_fecha_cierre(dias_hasta_cierre))
        
        # Búsqueda por palabras clave
        if palabras_clave:
            todos_resultados.extend(self.buscar_por_palabras_clave(palabras_clave))
        
        # Eliminar duplicados y ordenar por relevancia
        proyectos_unicos = {}
        for resultado in todos_resultados:
            proyecto_id = resultado['proyecto']['ID']
            if proyecto_id not in proyectos_unicos:
                proyectos_unicos[proyecto_id] = resultado
            else:
                # Sumar relevancia si ya existe
                proyectos_unicos[proyecto_id]['relevancia'] += resultado['relevancia']
        
        resultados_finales = list(proyectos_unicos.values())
        resultados_finales.sort(key=lambda x: x['relevancia'], reverse=True)
        
        return resultados_finales
    
    def obtener_sugerencias(self, texto_busqueda: str) -> List[str]:
        """Obtiene sugerencias de búsqueda basadas en el texto"""
        if not texto_busqueda:
            return []
        
        sugerencias = []
        texto_busqueda = texto_busqueda.lower()
        
        # Sugerencias basadas en áreas
        for area, palabras in self.palabras_clave_areas.items():
            for palabra in palabras:
                if palabra in texto_busqueda:
                    sugerencias.extend(palabras)
        
        # Sugerencias basadas en fuentes
        fuentes = list(set([p.get('Fuente', '') for p in self.proyectos if p.get('Fuente')]))
        for fuente in fuentes:
            if fuente.lower() in texto_busqueda:
                sugerencias.append(fuente)
        
        # Sugerencias basadas en palabras clave existentes
        palabras_existentes = []
        for proyecto in self.proyectos:
            palabras_clave = proyecto.get('Palabras Clave', '')
            if palabras_clave and (not isinstance(palabras_clave, float) or str(palabras_clave) != 'nan'):
                palabras_existentes.extend(str(palabras_clave).split(', '))
        
        for palabra in palabras_existentes:
            if palabra.lower() in texto_busqueda:
                sugerencias.append(palabra)
        
        # Eliminar duplicados y limitar
        sugerencias = list(set(sugerencias))[:10]
        return sugerencias
    
    def obtener_estadisticas_busqueda(self, resultados: List[Dict]) -> Dict:
        """Obtiene estadísticas de los resultados de búsqueda"""
        if not resultados:
            return {}
        
        proyectos_resultados = [r['proyecto'] for r in resultados]
        
        # Calcular estadísticas manualmente
        por_fuente = {}
        por_area = {}
        por_estado = {}
        por_region = {}
        por_prioridad = {}
        
        for proyecto in proyectos_resultados:
            fuente = proyecto.get('Fuente', '')
            if fuente:
                por_fuente[fuente] = por_fuente.get(fuente, 0) + 1
            
            area = proyecto.get('Área de interés', '')
            if area:
                por_area[area] = por_area.get(area, 0) + 1
            
            estado = proyecto.get('Estado', '')
            if estado:
                por_estado[estado] = por_estado.get(estado, 0) + 1
            
            region = proyecto.get('Región', '')
            if region:
                por_region[region] = por_region.get(region, 0) + 1
            
            prioridad = proyecto.get('Prioridad', '')
            if prioridad:
                por_prioridad[prioridad] = por_prioridad.get(prioridad, 0) + 1
        
        estadisticas = {
            'total_resultados': len(resultados),
            'por_fuente': por_fuente,
            'por_area': por_area,
            'por_estado': por_estado,
            'por_region': por_region,
            'por_prioridad': por_prioridad
        }
        
        return estadisticas

def main():
    """Función principal para probar el buscador"""
    print("🔍 PROBANDO SISTEMA DE BÚSQUEDA AVANZADA")
    print("=" * 60)
    
    # Cargar datos
    proyectos = leer_excel('data/proyectos_fortalecidos.xlsx')
    print(f"📊 Cargados {len(proyectos)} proyectos")
    
    # Crear buscador
    buscador = BuscadorAvanzado(proyectos)
    
    # Pruebas de búsqueda
    print("\n🔍 Pruebas de búsqueda:")
    
    # Búsqueda por texto
    resultados_texto = buscador.buscar_por_texto('agricultura')
    print(f"Búsqueda 'agricultura': {len(resultados_texto)} resultados")
    
    # Búsqueda por área
    resultados_area = buscador.buscar_por_area('Agricultura Sostenible')
    print(f"Búsqueda área 'Agricultura Sostenible': {len(resultados_area)} resultados")
    
    # Búsqueda combinada
    resultados_combinada = buscador.buscar_combinada(
        texto='innovación',
        area='Innovación Tecnológica',
        estado='Abierto'
    )
    print(f"Búsqueda combinada: {len(resultados_combinada)} resultados")
    
    # Sugerencias
    sugerencias = buscador.obtener_sugerencias('agricultura')
    print(f"Sugerencias para 'agricultura': {sugerencias[:5]}")
    
    print("\n✅ Sistema de búsqueda avanzada funcionando correctamente")

if __name__ == "__main__":
    main()
