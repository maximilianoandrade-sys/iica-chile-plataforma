"""
Sistema de Reportes Avanzados para IICA Chile
Genera reportes detallados, análisis de tendencias y métricas de rendimiento
"""

import pandas as pd
import json
import os
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
import matplotlib.pyplot as plt
import seaborn as sns
from io import BytesIO
import base64

class AdvancedReporting:
    def __init__(self):
        self.reports_dir = 'static/reportes'
        os.makedirs(self.reports_dir, exist_ok=True)
        
    def generate_comprehensive_report(self, projects_data: List[Dict]) -> Dict[str, Any]:
        """Generar reporte comprensivo de la plataforma"""
        df = pd.DataFrame(projects_data)
        
        # Análisis básico
        total_projects = len(df)
        total_amount = df['Monto'].sum() if 'Monto' in df.columns else 0
        unique_sources = df['Fuente'].nunique() if 'Fuente' in df.columns else 0
        
        # Análisis por área
        area_analysis = self._analyze_by_area(df)
        
        # Análisis temporal
        temporal_analysis = self._analyze_temporal_trends(df)
        
        # Análisis de montos
        financial_analysis = self._analyze_financial_data(df)
        
        # Análisis de fuentes
        source_analysis = self._analyze_sources(df)
        
        # Recomendaciones
        recommendations = self._generate_recommendations(df)
        
        report = {
            'metadata': {
                'generated_at': datetime.now().isoformat(),
                'total_projects': total_projects,
                'total_amount': total_amount,
                'unique_sources': unique_sources
            },
            'area_analysis': area_analysis,
            'temporal_analysis': temporal_analysis,
            'financial_analysis': financial_analysis,
            'source_analysis': source_analysis,
            'recommendations': recommendations,
            'charts': self._generate_charts(df)
        }
        
        # Guardar reporte
        self._save_report(report, 'comprehensive_report.json')
        
        return report
        
    def _analyze_by_area(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analizar proyectos por área de interés"""
        if 'Área de interés' not in df.columns:
            return {}
            
        area_counts = df['Área de interés'].value_counts()
        area_amounts = df.groupby('Área de interés')['Monto'].sum() if 'Monto' in df.columns else {}
        
        return {
            'top_areas': area_counts.head(10).to_dict(),
            'area_amounts': area_amounts.to_dict(),
            'total_areas': len(area_counts)
        }
        
    def _analyze_temporal_trends(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analizar tendencias temporales"""
        if 'Fecha cierre' not in df.columns:
            return {}
            
        # Convertir fechas
        df['Fecha cierre'] = pd.to_datetime(df['Fecha cierre'], errors='coerce')
        df = df.dropna(subset=['Fecha cierre'])
        
        # Análisis por mes
        df['Mes'] = df['Fecha cierre'].dt.to_period('M')
        monthly_counts = df['Mes'].value_counts().sort_index()
        
        # Proyectos que cierran pronto (próximos 30 días)
        future_date = datetime.now() + timedelta(days=30)
        closing_soon = df[df['Fecha cierre'] <= future_date]
        
        return {
            'monthly_trends': monthly_counts.to_dict(),
            'closing_soon_count': len(closing_soon),
            'closing_soon_projects': closing_soon[['Nombre', 'Fecha cierre']].to_dict('records') if len(closing_soon) > 0 else []
        }
        
    def _analyze_financial_data(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analizar datos financieros"""
        if 'Monto' not in df.columns:
            return {}
            
        amounts = pd.to_numeric(df['Monto'], errors='coerce').dropna()
        
        return {
            'total_amount': amounts.sum(),
            'average_amount': amounts.mean(),
            'median_amount': amounts.median(),
            'min_amount': amounts.min(),
            'max_amount': amounts.max(),
            'amount_ranges': self._categorize_amounts(amounts)
        }
        
    def _categorize_amounts(self, amounts: pd.Series) -> Dict[str, int]:
        """Categorizar montos en rangos"""
        ranges = {
            'Menos de $10,000': len(amounts[amounts < 10000]),
            '$10,000 - $50,000': len(amounts[(amounts >= 10000) & (amounts < 50000)]),
            '$50,000 - $100,000': len(amounts[(amounts >= 50000) & (amounts < 100000)]),
            '$100,000 - $500,000': len(amounts[(amounts >= 100000) & (amounts < 500000)]),
            'Más de $500,000': len(amounts[amounts >= 500000])
        }
        return ranges
        
    def _analyze_sources(self, df: pd.DataFrame) -> Dict[str, Any]:
        """Analizar fuentes de financiamiento"""
        if 'Fuente' not in df.columns:
            return {}
            
        source_counts = df['Fuente'].value_counts()
        source_amounts = df.groupby('Fuente')['Monto'].sum() if 'Monto' in df.columns else {}
        
        return {
            'top_sources': source_counts.head(10).to_dict(),
            'source_amounts': source_amounts.to_dict(),
            'total_sources': len(source_counts)
        }
        
    def _generate_recommendations(self, df: pd.DataFrame) -> List[str]:
        """Generar recomendaciones basadas en el análisis"""
        recommendations = []
        
        # Recomendación basada en áreas
        if 'Área de interés' in df.columns:
            top_area = df['Área de interés'].mode().iloc[0] if not df['Área de interés'].empty else None
            if top_area:
                recommendations.append(f"Enfocar esfuerzos en '{top_area}' - área con mayor número de proyectos")
        
        # Recomendación basada en fuentes
        if 'Fuente' in df.columns:
            top_source = df['Fuente'].mode().iloc[0] if not df['Fuente'].empty else None
            if top_source:
                recommendations.append(f"Fortalecer relación con '{top_source}' - fuente más activa")
        
        # Recomendación basada en montos
        if 'Monto' in df.columns:
            amounts = pd.to_numeric(df['Monto'], errors='coerce').dropna()
            if not amounts.empty:
                avg_amount = amounts.mean()
                if avg_amount > 100000:
                    recommendations.append("Considerar proyectos de menor escala para mayor accesibilidad")
                elif avg_amount < 10000:
                    recommendations.append("Explorar fuentes de financiamiento de mayor escala")
        
        # Recomendación general
        recommendations.append("Implementar sistema de seguimiento de aplicaciones para mejorar tasa de éxito")
        recommendations.append("Crear alertas automáticas para proyectos que cierran pronto")
        
        return recommendations
        
    def _generate_charts(self, df: pd.DataFrame) -> Dict[str, str]:
        """Generar gráficos y convertirlos a base64"""
        charts = {}
        
        try:
            # Gráfico de áreas
            if 'Área de interés' in df.columns:
                area_counts = df['Área de interés'].value_counts().head(10)
                plt.figure(figsize=(10, 6))
                area_counts.plot(kind='bar')
                plt.title('Proyectos por Área de Interés')
                plt.xticks(rotation=45)
                plt.tight_layout()
                
                buffer = BytesIO()
                plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
                buffer.seek(0)
                charts['areas'] = base64.b64encode(buffer.getvalue()).decode()
                plt.close()
            
            # Gráfico de fuentes
            if 'Fuente' in df.columns:
                source_counts = df['Fuente'].value_counts().head(10)
                plt.figure(figsize=(10, 6))
                source_counts.plot(kind='pie', autopct='%1.1f%%')
                plt.title('Distribución por Fuente de Financiamiento')
                plt.tight_layout()
                
                buffer = BytesIO()
                plt.savefig(buffer, format='png', dpi=150, bbox_inches='tight')
                buffer.seek(0)
                charts['sources'] = base64.b64encode(buffer.getvalue()).decode()
                plt.close()
                
        except Exception as e:
            print(f"Error generando gráficos: {e}")
            
        return charts
        
    def _save_report(self, report: Dict[str, Any], filename: str):
        """Guardar reporte en archivo"""
        filepath = os.path.join(self.reports_dir, filename)
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(report, f, ensure_ascii=False, indent=2)
            
    def generate_user_report(self, user_email: str, applications: List[Dict]) -> Dict[str, Any]:
        """Generar reporte personalizado para usuario"""
        if not applications:
            return {'message': 'No hay aplicaciones para este usuario'}
            
        df = pd.DataFrame(applications)
        
        # Estadísticas del usuario
        total_applications = len(df)
        status_counts = df['status'].value_counts()
        
        # Proyectos más aplicados
        project_counts = df['project_name'].value_counts()
        
        # Timeline de aplicaciones
        df['created_at'] = pd.to_datetime(df['created_at'])
        df = df.sort_values('created_at')
        
        report = {
            'user_email': user_email,
            'generated_at': datetime.now().isoformat(),
            'total_applications': total_applications,
            'status_breakdown': status_counts.to_dict(),
            'most_applied_projects': project_counts.head(5).to_dict(),
            'application_timeline': df[['project_name', 'status', 'created_at']].to_dict('records'),
            'success_rate': self._calculate_user_success_rate(df)
        }
        
        return report
        
    def _calculate_user_success_rate(self, df: pd.DataFrame) -> float:
        """Calcular tasa de éxito del usuario"""
        if df.empty:
            return 0.0
            
        successful = len(df[df['status'].isin(['aprobada', 'adjudicada'])])
        return (successful / len(df)) * 100

# Instancia global del sistema de reportes
advanced_reporting = AdvancedReporting()
