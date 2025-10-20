import re
import json
from datetime import datetime
from typing import List, Dict, Any
import pandas as pd

class AISearchEngine:
    """Motor de búsqueda inteligente similar a Perplexity"""
    
    def __init__(self):
        self.keywords_map = {
            # Agricultura y sostenibilidad
            'agricultura': ['Agricultura Sostenible', 'Desarrollo Rural', 'Seguridad Alimentaria'],
            'sostenible': ['Agricultura Sostenible', 'Gestión Hídrica', 'Innovación Tecnológica'],
            'orgánico': ['Agricultura Sostenible', 'Innovación Tecnológica'],
            'agroecología': ['Agricultura Sostenible', 'Innovación Tecnológica'],
            
            # Agua y recursos hídricos
            'agua': ['Gestión Hídrica', 'Agricultura Sostenible'],
            'riego': ['Gestión Hídrica', 'Agricultura Sostenible'],
            'hidroponía': ['Gestión Hídrica', 'Innovación Tecnológica'],
            'sequía': ['Gestión Hídrica', 'Agricultura Sostenible'],
            
            # Tecnología e innovación
            'tecnología': ['Innovación Tecnológica', 'Agricultura Sostenible'],
            'digital': ['Innovación Tecnológica', 'Agricultura Sostenible'],
            'IoT': ['Innovación Tecnológica'],
            'drones': ['Innovación Tecnológica'],
            'IA': ['Innovación Tecnológica'],
            'inteligencia artificial': ['Innovación Tecnológica'],
            
            # Desarrollo rural
            'rural': ['Desarrollo Rural', 'Juventudes Rurales'],
            'comunidad': ['Desarrollo Rural', 'Juventudes Rurales'],
            'campesino': ['Desarrollo Rural', 'Agricultura Sostenible'],
            'pequeño productor': ['Desarrollo Rural', 'Agricultura Sostenible'],
            
            # Juventudes
            'joven': ['Juventudes Rurales', 'Desarrollo Rural'],
            'juventud': ['Juventudes Rurales', 'Desarrollo Rural'],
            'emprendimiento': ['Juventudes Rurales', 'Innovación Tecnológica'],
            'startup': ['Juventudes Rurales', 'Innovación Tecnológica'],
            
            # Comercio y exportación
            'comercio': ['Comercio Agrícola', 'Agricultura Sostenible'],
            'exportación': ['Comercio Agrícola', 'Agricultura Sostenible'],
            'mercado': ['Comercio Agrícola', 'Agricultura Sostenible'],
            'internacional': ['Comercio Agrícola', 'Agricultura Sostenible'],
            
            # Seguridad alimentaria
            'alimentario': ['Seguridad Alimentaria', 'Agricultura Sostenible'],
            'nutrición': ['Seguridad Alimentaria', 'Agricultura Sostenible'],
            'hambre': ['Seguridad Alimentaria'],
            'desnutrición': ['Seguridad Alimentaria'],
        }
        
        self.fuentes_prioritarias = {
            'IICA': 10,
            'FAO': 9,
            'Banco Mundial': 8,
            'BID': 8,
            'FIDA': 7,
            'INDAP': 7,
            'Minagri': 6,
            'Corfo': 6,
            'FIA': 5
        }
    
    def parse_query(self, query: str) -> Dict[str, Any]:
        """Analiza la consulta del usuario y extrae intenciones"""
        query_lower = query.lower()
        
        # Detectar tipo de consulta
        intent = self._detect_intent(query_lower)
        
        # Extraer palabras clave
        keywords = self._extract_keywords(query_lower)
        
        # Detectar filtros específicos
        filters = self._extract_filters(query_lower)
        
        # Detectar rango de montos
        monto_range = self._extract_monto_range(query_lower)
        
        return {
            'original_query': query,
            'intent': intent,
            'keywords': keywords,
            'filters': filters,
            'monto_range': monto_range,
            'suggested_areas': self._suggest_areas(keywords)
        }
    
    def _detect_intent(self, query: str) -> str:
        """Detecta la intención del usuario"""
        if any(word in query for word in ['proyecto', 'financiamiento', 'fondo', 'subsidio']):
            return 'buscar_proyectos'
        elif any(word in query for word in ['cómo', 'como', 'ayuda', 'guía', 'tutorial']):
            return 'buscar_ayuda'
        elif any(word in query for word in ['requisitos', 'documentos', 'postular']):
            return 'buscar_requisitos'
        elif any(word in query for word in ['contacto', 'teléfono', 'email', 'dirección']):
            return 'buscar_contacto'
        else:
            return 'buscar_general'
    
    def _extract_keywords(self, query: str) -> List[str]:
        """Extrae palabras clave relevantes"""
        keywords = []
        for keyword, areas in self.keywords_map.items():
            if keyword in query:
                keywords.extend(areas)
        return list(set(keywords))
    
    def _extract_filters(self, query: str) -> Dict[str, str]:
        """Extrae filtros específicos de la consulta"""
        filters = {}
        
        # Detectar fuentes específicas
        fuentes = ['IICA', 'FAO', 'Banco Mundial', 'BID', 'INDAP', 'Minagri', 'Corfo', 'FIA']
        for fuente in fuentes:
            if fuente.lower() in query:
                filters['fuente'] = fuente
                break
        
        # Detectar estados
        if 'abierto' in query:
            filters['estado'] = 'Abierto'
        elif 'cerrado' in query:
            filters['estado'] = 'Cerrado'
        
        return filters
    
    def _extract_monto_range(self, query: str) -> Dict[str, float]:
        """Extrae rango de montos de la consulta"""
        # Buscar patrones de montos
        monto_patterns = [
            r'(\d+(?:\.\d+)?)\s*millones?',
            r'(\d+(?:\.\d+)?)\s*M',
            r'desde\s*(\d+(?:\.\d+)?)',
            r'hasta\s*(\d+(?:\.\d+)?)',
            r'más\s*de\s*(\d+(?:\.\d+)?)',
            r'menos\s*de\s*(\d+(?:\.\d+)?)'
        ]
        
        monto_range = {}
        for pattern in monto_patterns:
            match = re.search(pattern, query)
            if match:
                value = float(match.group(1))
                if 'desde' in query or 'más de' in query:
                    monto_range['min'] = value * 1000000  # Convertir a USD
                elif 'hasta' in query or 'menos de' in query:
                    monto_range['max'] = value * 1000000
                else:
                    monto_range['target'] = value * 1000000
        
        return monto_range
    
    def _suggest_areas(self, keywords: List[str]) -> List[str]:
        """Sugiere áreas basadas en las palabras clave"""
        area_scores = {}
        for keyword in keywords:
            for area in keyword:
                area_scores[area] = area_scores.get(area, 0) + 1
        
        return sorted(area_scores.keys(), key=lambda x: area_scores[x], reverse=True)[:3]
    
    def search_projects(self, proyectos: List[Dict], parsed_query: Dict) -> List[Dict]:
        """Busca proyectos basado en la consulta parseada"""
        results = []
        
        for proyecto in proyectos:
            score = self._calculate_relevance_score(proyecto, parsed_query)
            if score > 0:
                proyecto['relevance_score'] = score
                results.append(proyecto)
        
        # Ordenar por relevancia
        results.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        return results
    
    def _calculate_relevance_score(self, proyecto: Dict, parsed_query: Dict) -> float:
        """Calcula la puntuación de relevancia de un proyecto"""
        score = 0.0
        
        # Búsqueda en nombre
        nombre = proyecto.get('Nombre', '').lower()
        for keyword in parsed_query['keywords']:
            if keyword.lower() in nombre:
                score += 10
        
        # Búsqueda en descripción
        descripcion = proyecto.get('Descripción', '').lower()
        for keyword in parsed_query['keywords']:
            if keyword.lower() in descripcion:
                score += 5
        
        # Búsqueda en área de interés
        area = proyecto.get('Área de interés', '').lower()
        for keyword in parsed_query['keywords']:
            if keyword.lower() in area:
                score += 8
        
        # Filtros específicos
        if 'fuente' in parsed_query['filters']:
            if proyecto.get('Fuente') == parsed_query['filters']['fuente']:
                score += 15
        
        if 'estado' in parsed_query['filters']:
            if proyecto.get('Estado') == parsed_query['filters']['estado']:
                score += 5
        
        # Prioridad por fuente
        fuente = proyecto.get('Fuente', '')
        if fuente in self.fuentes_prioritarias:
            score += self.fuentes_prioritarias[fuente]
        
        # Filtro por monto
        if parsed_query['monto_range']:
            monto_str = proyecto.get('Monto', '0')
            monto_value = self._parse_monto(monto_str)
            if monto_value:
                if 'min' in parsed_query['monto_range'] and monto_value >= parsed_query['monto_range']['min']:
                    score += 3
                if 'max' in parsed_query['monto_range'] and monto_value <= parsed_query['monto_range']['max']:
                    score += 3
        
        return score
    
    def _parse_monto(self, monto_str: str) -> float:
        """Parsea el monto de string a float"""
        try:
            # Remover USD y comas
            monto_clean = re.sub(r'[USD,\s]', '', monto_str)
            # Buscar números
            numbers = re.findall(r'\d+(?:\.\d+)?', monto_clean)
            if numbers:
                return float(numbers[0])
        except:
            pass
        return 0.0
    
    def generate_suggestions(self, parsed_query: Dict) -> List[str]:
        """Genera sugerencias de búsqueda"""
        suggestions = []
        
        # Sugerencias basadas en intención
        if parsed_query['intent'] == 'buscar_proyectos':
            suggestions.extend([
                "Proyectos de agricultura sostenible",
                "Financiamiento para jóvenes rurales",
                "Programas de innovación tecnológica",
                "Fondos para gestión hídrica"
            ])
        
        # Sugerencias basadas en áreas sugeridas
        for area in parsed_query['suggested_areas'][:2]:
            suggestions.append(f"Proyectos de {area}")
        
        return suggestions[:5]
    
    def generate_insights(self, proyectos: List[Dict], parsed_query: Dict) -> Dict[str, Any]:
        """Genera insights sobre los resultados"""
        if not proyectos:
            return {"message": "No se encontraron proyectos relevantes"}
        
        # Estadísticas básicas
        total_proyectos = len(proyectos)
        monto_total = sum(self._parse_monto(p.get('Monto', '0')) for p in proyectos)
        
        # Fuentes más comunes
        fuentes = [p.get('Fuente', '') for p in proyectos]
        fuente_counts = {}
        for fuente in fuentes:
            fuente_counts[fuente] = fuente_counts.get(fuente, 0) + 1
        
        # Áreas más comunes
        areas = [p.get('Área de interés', '') for p in proyectos]
        area_counts = {}
        for area in areas:
            area_counts[area] = area_counts.get(area, 0) + 1
        
        return {
            "total_proyectos": total_proyectos,
            "monto_total": monto_total,
            "fuentes_principales": sorted(fuente_counts.items(), key=lambda x: x[1], reverse=True)[:3],
            "areas_principales": sorted(area_counts.items(), key=lambda x: x[1], reverse=True)[:3],
            "proyecto_destacado": max(proyectos, key=lambda x: x.get('relevance_score', 0)) if proyectos else None
        }
