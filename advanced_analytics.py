import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
from collections import Counter
import re

class AdvancedAnalytics:
    """Sistema de análisis avanzado y métricas"""
    
    def __init__(self):
        self.metrics_cache = {}
        self.cache_duration = 3600  # 1 hora en segundos
    
    def get_comprehensive_analytics(self, proyectos):
        """Obtiene análisis completo de los proyectos"""
        if not proyectos:
            return {"error": "No hay proyectos disponibles"}
        
        df = pd.DataFrame(proyectos)
        
        analytics = {
            'overview': self._get_overview_metrics(df),
            'trends': self._get_trend_analysis(df),
            'geographic': self._get_geographic_analysis(df),
            'sectoral': self._get_sectoral_analysis(df),
            'financial': self._get_financial_analysis(df),
            'temporal': self._get_temporal_analysis(df),
            'recommendations': self._get_recommendations(df)
        }
        
        return analytics
    
    def _get_overview_metrics(self, df):
        """Métricas generales de la plataforma"""
        total_projects = len(df)
        open_projects = len(df[df['Estado'] == 'Abierto'])
        unique_sources = df['Fuente'].nunique()
        
        # Calcular monto total
        total_amount = self._calculate_total_amount(df)
        
        # Proyectos por área
        area_distribution = df['Área de interés'].value_counts().to_dict()
        
        # Fuentes más activas
        source_activity = df['Fuente'].value_counts().head(10).to_dict()
        
        return {
            'total_projects': total_projects,
            'open_projects': open_projects,
            'unique_sources': unique_sources,
            'total_amount': total_amount,
            'area_distribution': area_distribution,
            'source_activity': source_activity,
            'completion_rate': f"{(open_projects/total_projects)*100:.1f}%" if total_projects > 0 else "0%"
        }
    
    def _get_trend_analysis(self, df):
        """Análisis de tendencias"""
        # Tendencias por área
        area_trends = df['Área de interés'].value_counts().head(5)
        
        # Tendencias por fuente
        source_trends = df['Fuente'].value_counts().head(5)
        
        # Análisis de montos
        monto_trends = self._analyze_amount_trends(df)
        
        return {
            'top_areas': area_trends.to_dict(),
            'top_sources': source_trends.to_dict(),
            'amount_trends': monto_trends,
            'growth_indicators': self._calculate_growth_indicators(df)
        }
    
    def _get_geographic_analysis(self, df):
        """Análisis geográfico de proyectos"""
        # Clasificar por tipo de fuente (nacional/internacional)
        national_sources = ['Corfo', 'Minagri', 'INDAP', 'FIA', 'CONICYT', 'Gobierno Chile', 'Ministerio Ambiente', 'SAG', 'INIA', 'ProChile', 'SERNATUR', 'SUBPESCA']
        international_sources = ['FAO', 'Banco Mundial', 'BID', 'FIDA', 'UNDP', 'GEF', 'UE', 'Canadá', 'Australia', 'Japón', 'USAID', 'DFID Reino Unido', 'GIZ Alemania', 'AFD Francia', 'JICA Japón']
        iica_sources = ['IICA']
        
        national_projects = df[df['Fuente'].isin(national_sources)]
        international_projects = df[df['Fuente'].isin(international_sources)]
        iica_projects = df[df['Fuente'].isin(iica_sources)]
        
        return {
            'national': {
                'count': len(national_projects),
                'percentage': f"{(len(national_projects)/len(df))*100:.1f}%" if len(df) > 0 else "0%",
                'total_amount': self._calculate_total_amount(national_projects)
            },
            'international': {
                'count': len(international_projects),
                'percentage': f"{(len(international_projects)/len(df))*100:.1f}%" if len(df) > 0 else "0%",
                'total_amount': self._calculate_total_amount(international_projects)
            },
            'iica': {
                'count': len(iica_projects),
                'percentage': f"{(len(iica_projects)/len(df))*100:.1f}%" if len(df) > 0 else "0%",
                'total_amount': self._calculate_total_amount(iica_projects)
            }
        }
    
    def _get_sectoral_analysis(self, df):
        """Análisis sectoral de proyectos"""
        sector_analysis = {}
        
        for area in df['Área de interés'].unique():
            area_projects = df[df['Área de interés'] == area]
            sector_analysis[area] = {
                'count': len(area_projects),
                'percentage': f"{(len(area_projects)/len(df))*100:.1f}%" if len(df) > 0 else "0%",
                'total_amount': self._calculate_total_amount(area_projects),
                'avg_amount': self._calculate_average_amount(area_projects),
                'top_sources': area_projects['Fuente'].value_counts().head(3).to_dict()
            }
        
        return sector_analysis
    
    def _get_financial_analysis(self, df):
        """Análisis financiero detallado"""
        amounts = []
        for monto in df['Monto']:
            amount = self._parse_amount(monto)
            if amount > 0:
                amounts.append(amount)
        
        if not amounts:
            return {"error": "No se pudieron procesar los montos"}
        
        amounts = np.array(amounts)
        
        return {
            'total_amount': np.sum(amounts),
            'average_amount': np.mean(amounts),
            'median_amount': np.median(amounts),
            'min_amount': np.min(amounts),
            'max_amount': np.max(amounts),
            'std_deviation': np.std(amounts),
            'amount_distribution': self._get_amount_distribution(amounts),
            'top_funded_areas': self._get_top_funded_areas(df)
        }
    
    def _get_temporal_analysis(self, df):
        """Análisis temporal de proyectos"""
        # Convertir fechas de cierre
        df['Fecha_cierre_parsed'] = pd.to_datetime(df['Fecha cierre'], errors='coerce')
        
        # Análisis por mes
        monthly_analysis = df.groupby(df['Fecha_cierre_parsed'].dt.to_period('M')).size()
        
        # Proyectos por estado
        status_analysis = df['Estado'].value_counts().to_dict()
        
        # Análisis de urgencia (proyectos que cierran pronto)
        today = datetime.now()
        df['dias_restantes'] = (df['Fecha_cierre_parsed'] - today).dt.days
        urgent_projects = df[df['dias_restantes'] <= 30]
        
        return {
            'monthly_distribution': monthly_analysis.to_dict(),
            'status_breakdown': status_analysis,
            'urgent_projects': {
                'count': len(urgent_projects),
                'projects': urgent_projects[['Nombre', 'Fecha cierre', 'Fuente']].to_dict('records')
            },
            'upcoming_deadlines': self._get_upcoming_deadlines(df)
        }
    
    def _get_recommendations(self, df):
        """Genera recomendaciones basadas en el análisis"""
        recommendations = []
        
        # Recomendación basada en áreas con menos proyectos
        area_counts = df['Área de interés'].value_counts()
        underrepresented_areas = area_counts[area_counts < area_counts.median()].index.tolist()
        
        if underrepresented_areas:
            recommendations.append({
                'type': 'area_development',
                'title': 'Desarrollar más proyectos en áreas subrepresentadas',
                'description': f'Considerar agregar más proyectos en: {", ".join(underrepresented_areas[:3])}',
                'priority': 'medium'
            })
        
        # Recomendación basada en fuentes
        source_counts = df['Fuente'].value_counts()
        if len(source_counts) < 10:
            recommendations.append({
                'type': 'source_diversification',
                'title': 'Diversificar fuentes de financiamiento',
                'description': 'Agregar más fuentes de financiamiento para mayor diversidad',
                'priority': 'high'
            })
        
        # Recomendación basada en montos
        amounts = [self._parse_amount(m) for m in df['Monto'] if self._parse_amount(m) > 0]
        if amounts:
            avg_amount = np.mean(amounts)
            if avg_amount < 1000000:  # Menos de 1M USD
                recommendations.append({
                    'type': 'amount_optimization',
                    'title': 'Optimizar distribución de montos',
                    'description': 'Considerar proyectos de mayor envergadura para mayor impacto',
                    'priority': 'low'
                })
        
        return recommendations
    
    def _calculate_total_amount(self, df):
        """Calcula el monto total de un DataFrame"""
        total = 0
        for monto in df['Monto']:
            amount = self._parse_amount(monto)
            if amount > 0:
                total += amount
        return total
    
    def _calculate_average_amount(self, df):
        """Calcula el monto promedio de un DataFrame"""
        amounts = [self._parse_amount(m) for m in df['Monto'] if self._parse_amount(m) > 0]
        return np.mean(amounts) if amounts else 0
    
    def _parse_amount(self, monto_str):
        """Parsea un string de monto a número"""
        if pd.isna(monto_str) or monto_str == '':
            return 0
        
        try:
            # Remover USD y comas
            monto_clean = re.sub(r'[USD,\s]', '', str(monto_str))
            # Buscar números
            numbers = re.findall(r'\d+(?:\.\d+)?', monto_clean)
            if numbers:
                return float(numbers[0])
        except:
            pass
        return 0
    
    def _analyze_amount_trends(self, df):
        """Analiza tendencias en los montos"""
        amounts = [self._parse_amount(m) for m in df['Monto'] if self._parse_amount(m) > 0]
        
        if not amounts:
            return {"error": "No se pudieron analizar los montos"}
        
        amounts = np.array(amounts)
        
        return {
            'small_projects': len(amounts[amounts < 1000000]),  # < 1M
            'medium_projects': len(amounts[(amounts >= 1000000) & (amounts < 10000000)]),  # 1M-10M
            'large_projects': len(amounts[amounts >= 10000000]),  # > 10M
            'distribution': {
                'small': f"{(len(amounts[amounts < 1000000])/len(amounts))*100:.1f}%",
                'medium': f"{(len(amounts[(amounts >= 1000000) & (amounts < 10000000)])/len(amounts))*100:.1f}%",
                'large': f"{(len(amounts[amounts >= 10000000])/len(amounts))*100:.1f}%"
            }
        }
    
    def _get_amount_distribution(self, amounts):
        """Obtiene distribución de montos"""
        return {
            'quartiles': {
                'Q1': np.percentile(amounts, 25),
                'Q2': np.percentile(amounts, 50),
                'Q3': np.percentile(amounts, 75)
            },
            'ranges': {
                '0-1M': len(amounts[amounts < 1000000]),
                '1M-5M': len(amounts[(amounts >= 1000000) & (amounts < 5000000)]),
                '5M-10M': len(amounts[(amounts >= 5000000) & (amounts < 10000000)]),
                '10M+': len(amounts[amounts >= 10000000])
            }
        }
    
    def _get_top_funded_areas(self, df):
        """Obtiene las áreas con mayor financiamiento"""
        area_amounts = {}
        for area in df['Área de interés'].unique():
            area_projects = df[df['Área de interés'] == area]
            total_amount = self._calculate_total_amount(area_projects)
            area_amounts[area] = total_amount
        
        return dict(sorted(area_amounts.items(), key=lambda x: x[1], reverse=True)[:5])
    
    def _calculate_growth_indicators(self, df):
        """Calcula indicadores de crecimiento"""
        # Simular crecimiento basado en diversidad de fuentes y áreas
        unique_sources = df['Fuente'].nunique()
        unique_areas = df['Área de interés'].nunique()
        
        return {
            'diversity_score': (unique_sources + unique_areas) / 2,
            'source_diversity': unique_sources,
            'area_diversity': unique_areas,
            'growth_potential': 'high' if unique_sources > 10 and unique_areas > 5 else 'medium'
        }
    
    def _get_upcoming_deadlines(self, df):
        """Obtiene fechas de cierre próximas"""
        df['Fecha_cierre_parsed'] = pd.to_datetime(df['Fecha cierre'], errors='coerce')
        today = datetime.now()
        df['dias_restantes'] = (df['Fecha_cierre_parsed'] - today).dt.days
        
        upcoming = df[df['dias_restantes'] <= 60].sort_values('dias_restantes')
        
        return upcoming[['Nombre', 'Fecha cierre', 'Fuente', 'dias_restantes']].to_dict('records')
    
    def generate_insights_report(self, proyectos):
        """Genera un reporte completo de insights"""
        analytics = self.get_comprehensive_analytics(proyectos)
        
        report = {
            'generated_at': datetime.now().isoformat(),
            'summary': {
                'total_projects': analytics['overview']['total_projects'],
                'total_amount': analytics['overview']['total_amount'],
                'completion_rate': analytics['overview']['completion_rate']
            },
            'key_insights': self._extract_key_insights(analytics),
            'recommendations': analytics['recommendations'],
            'detailed_analytics': analytics
        }
        
        return report
    
    def _extract_key_insights(self, analytics):
        """Extrae insights clave del análisis"""
        insights = []
        
        # Insight sobre área principal
        top_area = max(analytics['overview']['area_distribution'].items(), key=lambda x: x[1])
        insights.append(f"El área con más proyectos es '{top_area[0]}' con {top_area[1]} proyectos")
        
        # Insight sobre fuente principal
        top_source = max(analytics['overview']['source_activity'].items(), key=lambda x: x[1])
        insights.append(f"La fuente más activa es '{top_source[0]}' con {top_source[1]} proyectos")
        
        # Insight sobre distribución geográfica
        national_pct = analytics['geographic']['national']['percentage']
        insights.append(f"Los proyectos nacionales representan el {national_pct} del total")
        
        # Insight sobre urgencia
        urgent_count = analytics['temporal']['urgent_projects']['count']
        if urgent_count > 0:
            insights.append(f"Hay {urgent_count} proyectos con fechas de cierre próximas")
        
        return insights

