"""
Servicio de IA con Google Gemini
Chatbot y recomendaciones inteligentes para agricultores
"""

import os
import google.generativeai as genai
from typing import List, Dict, Optional
import logging

logger = logging.getLogger(__name__)

class GeminiService:
    """Servicio para interactuar con Google Gemini AI"""
    
    def __init__(self):
        """Inicializar servicio Gemini"""
        api_key = os.environ.get('GEMINI_API_KEY')
        if not api_key:
            logger.warning("⚠️ GEMINI_API_KEY no configurada")
            self.enabled = False
            return
        
        genai.configure(api_key=api_key)
        
        # Configuración optimizada para precisión técnica
        self.generation_config = {
            'temperature': 0.3,  # Precisión técnica
            'top_k': 40,
            'top_p': 0.95,
            'max_output_tokens': 8192,
        }
        
        # Modelo optimizado para velocidad
        self.model = genai.GenerativeModel(
            'gemini-2.0-flash-exp',
            generation_config=self.generation_config
        )
        
        self.enabled = True
        logger.info("✅ Gemini AI inicializado")
    
    def chat_asistente_agricola(self, mensaje_usuario: str, contexto_usuario: Optional[Dict] = None) -> str:
        """
        Chatbot asistente para agricultores
        
        Args:
            mensaje_usuario: Pregunta del usuario
            contexto_usuario: Información del perfil (región, cultivos, etc.)
        
        Returns:
            Respuesta del chatbot
        """
        if not self.enabled:
            return "El asistente de IA no está disponible en este momento."
        
        # System instruction optimizado para agricultura chilena
        system_instruction = """
        Eres un Asistente Experto en Financiamiento Agrícola de IICA Chile.
        
        Tu rol:
        - Ayudar a agricultores chilenos a encontrar fondos de financiamiento
        - Explicar requisitos y procesos de postulación de forma simple
        - Recomendar fondos según perfil del agricultor
        - Usar lenguaje claro, sin tecnicismos
        
        Contexto:
        - Trabajas para IICA Chile (Instituto Interamericano de Cooperación para la Agricultura)
        - Conoces fondos de INDAP, FIA, CORFO, FONTAGRO
        - Entiendes la realidad de pequeños y medianos agricultores chilenos
        
        Estilo:
        - Respuestas cortas y directas (máximo 3 párrafos)
        - Usa emojis ocasionalmente (🌾 💰 📋)
        - Sé empático y motivador
        - Si no sabes algo, recomienda contactar directamente a la fuente
        """
        
        # Construir prompt con contexto
        prompt = f"{mensaje_usuario}"
        
        if contexto_usuario:
            contexto_str = f"""
            Información del usuario:
            - Región: {contexto_usuario.get('region', 'No especificada')}
            - Tipo de predio: {contexto_usuario.get('tipo_predio', 'No especificado')}
            - Cultivos: {', '.join(contexto_usuario.get('cultivos', []))}
            """
            prompt = f"{contexto_str}\n\nPregunta: {mensaje_usuario}"
        
        try:
            # Crear chat con system instruction
            chat = self.model.start_chat(history=[])
            response = chat.send_message(
                f"{system_instruction}\n\n{prompt}"
            )
            
            return response.text
            
        except Exception as e:
            logger.error(f"❌ Error en chat Gemini: {e}")
            return "Lo siento, hubo un error procesando tu consulta. Por favor intenta de nuevo."
    
    def generar_recomendaciones_fondos(self, perfil_usuario: Dict, fondos_disponibles: List[Dict]) -> List[Dict]:
        """
        Generar recomendaciones inteligentes de fondos usando IA
        
        Args:
            perfil_usuario: Perfil del agricultor
            fondos_disponibles: Lista de fondos disponibles
        
        Returns:
            Lista de fondos con score de relevancia
        """
        if not self.enabled or not fondos_disponibles:
            return fondos_disponibles[:5]  # Fallback simple
        
        try:
            # Crear descripción del perfil
            perfil_str = f"""
            Agricultor en {perfil_usuario.get('region', 'Chile')}
            Tipo de predio: {perfil_usuario.get('tipo_predio', 'pequeño')}
            Cultivos: {', '.join(perfil_usuario.get('cultivos', []))}
            Necesidades: {perfil_usuario.get('necesidades', 'financiamiento general')}
            """
            
            # Crear lista de fondos para análisis
            fondos_str = "\n".join([
                f"{i+1}. {f['nombre']} - {f['fuente']} - {f.get('area_interes', 'General')}"
                for i, f in enumerate(fondos_disponibles[:20])  # Limitar a 20 para no exceder tokens
            ])
            
            prompt = f"""
            Analiza qué fondos son más relevantes para este agricultor.
            
            PERFIL DEL AGRICULTOR:
            {perfil_str}
            
            FONDOS DISPONIBLES:
            {fondos_str}
            
            Responde SOLO con los números de los 5 fondos más relevantes, separados por comas.
            Ejemplo: 1,3,7,12,15
            """
            
            response = self.model.generate_content(prompt)
            
            # Parsear respuesta
            numeros = [int(n.strip()) for n in response.text.split(',') if n.strip().isdigit()]
            
            # Reordenar fondos según recomendación
            fondos_recomendados = []
            for num in numeros:
                if 0 < num <= len(fondos_disponibles):
                    fondo = fondos_disponibles[num - 1].copy()
                    fondo['ai_score'] = 100 - (numeros.index(num) * 10)  # Score decreciente
                    fondos_recomendados.append(fondo)
            
            # Agregar fondos restantes
            for fondo in fondos_disponibles:
                if fondo not in fondos_recomendados:
                    fondo_copy = fondo.copy()
                    fondo_copy['ai_score'] = 0
                    fondos_recomendados.append(fondo_copy)
            
            return fondos_recomendados
            
        except Exception as e:
            logger.error(f"❌ Error generando recomendaciones: {e}")
            return fondos_disponibles
    
    def generar_carta_presentacion(self, fondo: Dict, perfil_usuario: Dict) -> str:
        """
        Generar carta de presentación para postulación
        
        Args:
            fondo: Información del fondo
            perfil_usuario: Perfil del agricultor
        
        Returns:
            Carta de presentación generada
        """
        if not self.enabled:
            return "Servicio de generación de cartas no disponible."
        
        prompt = f"""
        Genera una carta de presentación profesional pero cercana para postular a este fondo.
        
        FONDO:
        - Nombre: {fondo['nombre']}
        - Fuente: {fondo['fuente']}
        - Descripción: {fondo.get('descripcion', '')}
        
        PERFIL DEL POSTULANTE:
        - Nombre: {perfil_usuario.get('nombre', 'Agricultor')}
        - Región: {perfil_usuario.get('region', 'Chile')}
        - Tipo de predio: {perfil_usuario.get('tipo_predio', 'pequeño')}
        - Cultivos: {', '.join(perfil_usuario.get('cultivos', []))}
        
        Requisitos:
        - Máximo 300 palabras
        - Tono profesional pero cercano
        - Destacar por qué el agricultor es buen candidato
        - Incluir motivación y compromiso
        - Formato carta formal chilena
        """
        
        try:
            response = self.model.generate_content(prompt)
            return response.text
            
        except Exception as e:
            logger.error(f"❌ Error generando carta: {e}")
            return "Error generando carta de presentación."
    
    def validar_elegibilidad(self, fondo: Dict, perfil_usuario: Dict) -> Dict:
        """
        Validar si el usuario cumple requisitos del fondo
        
        Returns:
            {
                'elegible': bool,
                'requisitos_cumplidos': list,
                'requisitos_faltantes': list,
                'recomendaciones': str
            }
        """
        if not self.enabled:
            return {
                'elegible': None,
                'requisitos_cumplidos': [],
                'requisitos_faltantes': [],
                'recomendaciones': 'Servicio no disponible'
            }
        
        prompt = f"""
        Analiza si este agricultor cumple los requisitos para postular a este fondo.
        
        FONDO:
        - Nombre: {fondo['nombre']}
        - Beneficiarios: {fondo.get('beneficiarios', 'No especificado')}
        - Criterios: {fondo.get('criterios_elegibilidad', 'No especificado')}
        - Región: {fondo.get('region', 'Nacional')}
        
        PERFIL:
        - Región: {perfil_usuario.get('region')}
        - Tipo predio: {perfil_usuario.get('tipo_predio')}
        - Hectáreas: {perfil_usuario.get('hectareas', 'No especificado')}
        
        Responde en formato JSON:
        {{
            "elegible": true/false,
            "requisitos_cumplidos": ["req1", "req2"],
            "requisitos_faltantes": ["req3"],
            "recomendaciones": "texto breve"
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            # Parsear JSON de la respuesta
            import json
            import re
            
            # Extraer JSON de la respuesta
            json_match = re.search(r'\{.*\}', response.text, re.DOTALL)
            if json_match:
                return json.loads(json_match.group())
            else:
                return {
                    'elegible': None,
                    'requisitos_cumplidos': [],
                    'requisitos_faltantes': [],
                    'recomendaciones': response.text
                }
                
        except Exception as e:
            logger.error(f"❌ Error validando elegibilidad: {e}")
            return {
                'elegible': None,
                'requisitos_cumplidos': [],
                'requisitos_faltantes': [],
                'recomendaciones': 'Error en validación'
            }

# Instancia global
gemini_service = GeminiService()
