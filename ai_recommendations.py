"""
Sistema de Recomendaciones con IA para la Plataforma IICA
Recomienda proyectos basado en comportamiento del usuario y patrones
"""

import json
import os
import sqlite3
import numpy as np
from datetime import datetime, timedelta
from collections import defaultdict, Counter
from typing import List, Dict, Any, Tuple
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.cluster import KMeans
import pickle

class AIRecommendationEngine:
    def __init__(self, db_path="recommendations.db"):
        self.db_path = db_path
        self.model_path = "models"
        if not os.path.exists(self.model_path):
            os.makedirs(self.model_path, exist_ok=True)
        self.init_database()
        self.vectorizer = None
        self.similarity_matrix = None
        self.project_clusters = None
    
    def init_database(self):
        """Inicializa la base de datos de recomendaciones"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Tabla de perfiles de usuario
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_profiles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT UNIQUE,
                areas_interes TEXT,
                fuentes_preferidas TEXT,
                monto_preferido REAL,
                comportamiento TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Tabla de interacciones
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_interactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                project_name TEXT,
                interaction_type TEXT,
                score REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES user_profiles (session_id)
            )
        ''')
        
        # Tabla de recomendaciones
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS recommendations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT,
                project_name TEXT,
                recommendation_score REAL,
                reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (session_id) REFERENCES user_profiles (session_id)
            )
        ''')
        
        conn.commit()
        conn.close()
    
    def update_user_profile(self, session_id: str, project: Dict, interaction_type: str, score: float = 1.0):
        """Actualiza el perfil del usuario basado en interacciones"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Registrar interacción
        cursor.execute('''
            INSERT INTO user_interactions 
            (session_id, project_name, interaction_type, score)
            VALUES (?, ?, ?, ?)
        ''', (session_id, project.get('Nombre', ''), interaction_type, score))
        
        # Obtener o crear perfil de usuario
        cursor.execute('SELECT * FROM user_profiles WHERE session_id = ?', (session_id,))
        profile = cursor.fetchone()
        
        if profile:
            # Actualizar perfil existente
            areas = json.loads(profile[2]) if profile[2] else []
            fuentes = json.loads(profile[3]) if profile[3] else []
            
            # Agregar nueva área si no existe
            new_area = project.get('Área de interés', '')
            if new_area and new_area not in areas:
                areas.append(new_area)
            
            # Agregar nueva fuente si no existe
            new_source = project.get('Fuente', '')
            if new_source and new_source not in fuentes:
                fuentes.append(new_source)
            
            # Actualizar comportamiento
            behavior = json.loads(profile[5]) if profile[5] else {}
            behavior[interaction_type] = behavior.get(interaction_type, 0) + 1
            
            cursor.execute('''
                UPDATE user_profiles 
                SET areas_interes = ?, fuentes_preferidas = ?, comportamiento = ?, updated_at = CURRENT_TIMESTAMP
                WHERE session_id = ?
            ''', (json.dumps(areas), json.dumps(fuentes), json.dumps(behavior), session_id))
        else:
            # Crear nuevo perfil
            areas = [project.get('Área de interés', '')] if project.get('Área de interés') else []
            fuentes = [project.get('Fuente', '')] if project.get('Fuente') else []
            behavior = {interaction_type: 1}
            
            cursor.execute('''
                INSERT INTO user_profiles 
                (session_id, areas_interes, fuentes_preferidas, comportamiento)
                VALUES (?, ?, ?, ?)
            ''', (session_id, json.dumps(areas), json.dumps(fuentes), json.dumps(behavior)))
        
        conn.commit()
        conn.close()
    
    def extract_features(self, project: Dict) -> str:
        """Extrae características de texto de un proyecto"""
        features = []
        
        # Nombre del proyecto
        if project.get('Nombre'):
            features.append(project['Nombre'])
        
        # Área de interés
        if project.get('Área de interés'):
            features.append(project['Área de interés'])
        
        # Fuente
        if project.get('Fuente'):
            features.append(project['Fuente'])
        
        # Descripción (si existe)
        if project.get('Descripción'):
            features.append(project['Descripción'])
        
        return ' '.join(features)
    
    def train_similarity_model(self, projects: List[Dict]):
        """Entrena el modelo de similitud"""
        if not projects:
            return
        
        # Extraer características de todos los proyectos
        project_texts = [self.extract_features(project) for project in projects]
        project_names = [project.get('Nombre', '') for project in projects]
        
        # Crear vectorizador TF-IDF
        self.vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 2)
        )
        
        # Entrenar vectorizador
        tfidf_matrix = self.vectorizer.fit_transform(project_texts)
        
        # Calcular matriz de similitud
        self.similarity_matrix = cosine_similarity(tfidf_matrix)
        
        # Guardar modelo
        self.save_model()
        
        # Crear clusters de proyectos
        self.create_project_clusters(projects, tfidf_matrix)
    
    def create_project_clusters(self, projects: List[Dict], tfidf_matrix):
        """Crea clusters de proyectos similares"""
        if len(projects) < 5:
            return
        
        # Determinar número óptimo de clusters
        n_clusters = min(5, len(projects) // 3)
        
        # Aplicar K-means
        kmeans = KMeans(n_clusters=n_clusters, random_state=42)
        cluster_labels = kmeans.fit_predict(tfidf_matrix)
        
        # Organizar proyectos por cluster
        self.project_clusters = defaultdict(list)
        for i, project in enumerate(projects):
            cluster_id = cluster_labels[i]
            self.project_clusters[cluster_id].append(project)
        
        # Guardar clusters
        with open(os.path.join(self.model_path, 'project_clusters.pkl'), 'wb') as f:
            pickle.dump(self.project_clusters, f)
    
    def save_model(self):
        """Guarda el modelo entrenado"""
        if self.vectorizer and self.similarity_matrix is not None:
            with open(os.path.join(self.model_path, 'vectorizer.pkl'), 'wb') as f:
                pickle.dump(self.vectorizer, f)
            
            with open(os.path.join(self.model_path, 'similarity_matrix.pkl'), 'wb') as f:
                pickle.dump(self.similarity_matrix, f)
    
    def load_model(self):
        """Carga el modelo entrenado"""
        try:
            with open(os.path.join(self.model_path, 'vectorizer.pkl'), 'rb') as f:
                self.vectorizer = pickle.load(f)
            
            with open(os.path.join(self.model_path, 'similarity_matrix.pkl'), 'rb') as f:
                self.similarity_matrix = pickle.load(f)
            
            with open(os.path.join(self.model_path, 'project_clusters.pkl'), 'rb') as f:
                self.project_clusters = pickle.load(f)
            
            return True
        except:
            return False
    
    def get_similar_projects(self, target_project: Dict, projects: List[Dict], top_k: int = 5) -> List[Tuple[Dict, float]]:
        """Obtiene proyectos similares a uno dado"""
        if not self.vectorizer or self.similarity_matrix is None:
            return []
        
        # Extraer características del proyecto objetivo
        target_features = self.extract_features(target_project)
        target_vector = self.vectorizer.transform([target_features])
        
        # Calcular similitudes
        similarities = cosine_similarity(target_vector, self.vectorizer.transform([
            self.extract_features(p) for p in projects
        ]))[0]
        
        # Obtener índices de los más similares
        similar_indices = np.argsort(similarities)[::-1][:top_k]
        
        # Retornar proyectos similares con sus scores
        similar_projects = []
        for idx in similar_indices:
            if idx < len(projects) and similarities[idx] > 0.1:  # Umbral mínimo de similitud
                similar_projects.append((projects[idx], similarities[idx]))
        
        return similar_projects
    
    def get_recommendations_for_user(self, session_id: str, projects: List[Dict], top_k: int = 10) -> List[Dict]:
        """Obtiene recomendaciones personalizadas para un usuario"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Obtener perfil del usuario
        cursor.execute('SELECT * FROM user_profiles WHERE session_id = ?', (session_id,))
        profile = cursor.fetchone()
        
        if not profile:
            # Si no hay perfil, retornar proyectos populares
            return self.get_popular_projects(projects, top_k)
        
        areas_interes = json.loads(profile[2]) if profile[2] else []
        fuentes_preferidas = json.loads(profile[3]) if profile[3] else []
        comportamiento = json.loads(profile[5]) if profile[5] else {}
        
        # Filtrar proyectos basado en preferencias
        recommended_projects = []
        
        for project in projects:
            score = 0
            
            # Puntuar por área de interés
            if project.get('Área de interés') in areas_interes:
                score += 3
            
            # Puntuar por fuente preferida
            if project.get('Fuente') in fuentes_preferidas:
                score += 2
            
            # Puntuar por comportamiento (proyectos similares a los que ha visto)
            if score > 0:
                recommended_projects.append((project, score))
        
        # Ordenar por score
        recommended_projects.sort(key=lambda x: x[1], reverse=True)
        
        # Retornar top_k recomendaciones
        return [project for project, score in recommended_projects[:top_k]]
    
    def get_popular_projects(self, projects: List[Dict], top_k: int = 10) -> List[Dict]:
        """Obtiene proyectos populares basado en interacciones"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Obtener proyectos más interactuados
        cursor.execute('''
            SELECT project_name, COUNT(*) as interaction_count
            FROM user_interactions 
            WHERE created_at >= datetime('now', '-30 days')
            GROUP BY project_name 
            ORDER BY interaction_count DESC 
            LIMIT ?
        ''', (top_k,))
        
        popular_projects = cursor.fetchall()
        popular_names = [row[0] for row in popular_projects]
        
        # Filtrar proyectos disponibles
        available_projects = [p for p in projects if p.get('Nombre') in popular_names]
        
        conn.close()
        return available_projects[:top_k]
    
    def get_trending_areas(self, days: int = 7) -> List[Tuple[str, int]]:
        """Obtiene áreas de interés trending"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT project_name, COUNT(*) as interactions
            FROM user_interactions 
            WHERE created_at >= datetime('now', '-{} days')
            GROUP BY project_name 
            ORDER BY interactions DESC
        '''.format(days))
        
        trending_projects = cursor.fetchall()
        
        # Agrupar por área (esto requeriría una tabla de proyectos con áreas)
        # Por ahora retornamos proyectos trending
        conn.close()
        return trending_projects[:10]
    
    def get_collaborative_recommendations(self, session_id: str, projects: List[Dict], top_k: int = 5) -> List[Dict]:
        """Obtiene recomendaciones colaborativas"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Obtener usuarios similares
        cursor.execute('''
            SELECT session_id, areas_interes, fuentes_preferidas
            FROM user_profiles 
            WHERE session_id != ?
        ''', (session_id,))
        
        similar_users = cursor.fetchall()
        
        # Encontrar usuarios con preferencias similares
        user_preferences = self.get_user_preferences(session_id)
        similar_user_scores = []
        
        for user_session, areas, fuentes in similar_users:
            user_areas = json.loads(areas) if areas else []
            user_fuentes = json.loads(fuentes) if fuentes else []
            
            # Calcular similitud
            similarity = self.calculate_user_similarity(user_preferences, user_areas, user_fuentes)
            if similarity > 0.3:  # Umbral de similitud
                similar_user_scores.append((user_session, similarity))
        
        # Obtener proyectos que les gustaron a usuarios similares
        recommended_projects = []
        for user_session, similarity in similar_user_scores:
            cursor.execute('''
                SELECT project_name, AVG(score) as avg_score
                FROM user_interactions 
                WHERE session_id = ? AND score > 0.5
                GROUP BY project_name 
                ORDER BY avg_score DESC
            ''', (user_session,))
            
            user_liked_projects = cursor.fetchall()
            
            for project_name, avg_score in user_liked_projects:
                # Buscar proyecto en la lista actual
                for project in projects:
                    if project.get('Nombre') == project_name:
                        recommended_projects.append((project, avg_score * similarity))
                        break
        
        # Ordenar y retornar
        recommended_projects.sort(key=lambda x: x[1], reverse=True)
        return [project for project, score in recommended_projects[:top_k]]
    
    def get_user_preferences(self, session_id: str) -> Tuple[List[str], List[str]]:
        """Obtiene preferencias del usuario"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('SELECT areas_interes, fuentes_preferidas FROM user_profiles WHERE session_id = ?', (session_id,))
        result = cursor.fetchone()
        
        if result:
            areas = json.loads(result[0]) if result[0] else []
            fuentes = json.loads(result[1]) if result[1] else []
            return areas, fuentes
        
        conn.close()
        return [], []
    
    def calculate_user_similarity(self, user1_prefs: Tuple[List[str], List[str]], 
                                 user2_areas: List[str], user2_fuentes: List[str]) -> float:
        """Calcula similitud entre usuarios"""
        user1_areas, user1_fuentes = user1_prefs
        
        # Similitud en áreas
        areas_intersection = len(set(user1_areas) & set(user2_areas))
        areas_union = len(set(user1_areas) | set(user2_areas))
        areas_similarity = areas_intersection / areas_union if areas_union > 0 else 0
        
        # Similitud en fuentes
        fuentes_intersection = len(set(user1_fuentes) & set(user2_fuentes))
        fuentes_union = len(set(user1_fuentes) | set(user2_fuentes))
        fuentes_similarity = fuentes_intersection / fuentes_union if fuentes_union > 0 else 0
        
        # Promedio ponderado
        return (areas_similarity * 0.6 + fuentes_similarity * 0.4)
    
    def generate_recommendation_explanation(self, project: Dict, user_session: str) -> str:
        """Genera explicación para una recomendación"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Obtener perfil del usuario
        cursor.execute('SELECT areas_interes, fuentes_preferidas FROM user_profiles WHERE session_id = ?', (user_session,))
        result = cursor.fetchone()
        
        if not result:
            return "Proyecto recomendado basado en popularidad general."
        
        areas = json.loads(result[0]) if result[0] else []
        fuentes = json.loads(result[1]) if result[1] else []
        
        reasons = []
        
        if project.get('Área de interés') in areas:
            reasons.append(f"coincide con tu interés en {project.get('Área de interés')}")
        
        if project.get('Fuente') in fuentes:
            reasons.append(f"es de una fuente que prefieres: {project.get('Fuente')}")
        
        if not reasons:
            return "Proyecto recomendado basado en similitud con otros proyectos."
        
        return f"Te recomendamos este proyecto porque {' y '.join(reasons)}."
    
    def get_recommendation_stats(self) -> Dict:
        """Obtiene estadísticas de recomendaciones"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Total de perfiles de usuario
        cursor.execute('SELECT COUNT(*) FROM user_profiles')
        total_profiles = cursor.fetchone()[0]
        
        # Total de interacciones
        cursor.execute('SELECT COUNT(*) FROM user_interactions')
        total_interactions = cursor.fetchone()[0]
        
        # Interacciones por tipo
        cursor.execute('''
            SELECT interaction_type, COUNT(*) as count
            FROM user_interactions 
            GROUP BY interaction_type
        ''')
        interaction_types = cursor.fetchall()
        
        conn.close()
        
        return {
            'total_profiles': total_profiles,
            'total_interactions': total_interactions,
            'interaction_types': dict(interaction_types)
        }

# Instancia global del motor de recomendaciones
recommendation_engine = AIRecommendationEngine()
