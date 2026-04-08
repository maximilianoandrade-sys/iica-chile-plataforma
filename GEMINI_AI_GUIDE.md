# Integración Google Gemini AI - Guía Completa

## 🤖 Funcionalidades de IA Implementadas

### 1. Chatbot Asistente Agrícola
- **Ruta:** `/chatbot`
- **Modelo:** `gemini-2.0-flash-exp`
- **Características:**
  - Respuestas contextualizadas según perfil del usuario
  - Lenguaje simple para agricultores
  - Preguntas rápidas predefinidas
  - Interfaz de chat moderna

### 2. Recomendaciones Inteligentes
- **Endpoint:** `/api/ai/recomendaciones`
- **Funcionalidad:** Analiza perfil del usuario y recomienda fondos relevantes
- **Algoritmo:** Gemini AI + scoring personalizado

### 3. Generador de Cartas
- **Endpoint:** `/api/ai/generar-carta/<fondo_id>`
- **Funcionalidad:** Genera carta de presentación profesional
- **Personalización:** Basada en perfil y fondo específico

### 4. Validador de Elegibilidad
- **Endpoint:** `/api/ai/validar-elegibilidad/<fondo_id>`
- **Funcionalidad:** Valida si el usuario cumple requisitos
- **Output:** JSON con requisitos cumplidos/faltantes

---

## 🔧 Configuración

### 1. Obtener API Key de Google Gemini

```bash
# Visitar: https://makersuite.google.com/app/apikey
# Crear nueva API key
# Copiar la key
```

### 2. Configurar Variables de Entorno

```bash
# En .env (desarrollo local)
GEMINI_API_KEY=tu-api-key-aqui

# En Render (producción)
# Dashboard → Environment → Add Environment Variable
# Key: GEMINI_API_KEY
# Value: tu-api-key-aqui
```

### 3. Instalar Dependencias

```bash
pip install google-generativeai>=0.3.0
```

---

## 📝 Uso del Servicio

### Ejemplo: Chatbot

```python
from gemini_service import gemini_service

# Contexto del usuario
contexto = {
    'region': 'O\'Higgins',
    'tipo_predio': 'pequeño',
    'cultivos': ['viñedos', 'frutales']
}

# Obtener respuesta
respuesta = gemini_service.chat_asistente_agricola(
    "¿Qué fondos hay para riego tecnificado?",
    contexto
)

print(respuesta)
```

### Ejemplo: Recomendaciones

```python
# Perfil del usuario
perfil = {
    'region': 'Maule',
    'tipo_predio': 'mediano',
    'cultivos': ['trigo', 'maíz'],
    'necesidades': 'maquinaria agrícola'
}

# Fondos disponibles (desde BD)
fondos = Fondo.query.filter_by(estado='Abierto').all()

# Generar recomendaciones
recomendados = gemini_service.generar_recomendaciones_fondos(
    perfil,
    [f.to_dict() for f in fondos]
)
```

---

## 🎯 Parámetros Optimizados

```python
generation_config = {
    'temperature': 0.3,      # Precisión técnica
    'top_k': 40,             # Diversidad controlada
    'top_p': 0.95,           # Nucleus sampling
    'max_output_tokens': 8192  # Respuestas completas
}
```

### ¿Por qué estos valores?

- **temperature=0.3**: Respuestas más precisas y consistentes (vs. creativas)
- **top_k=40**: Balance entre variedad y coherencia
- **top_p=0.95**: Evita respuestas muy improbables
- **max_tokens=8192**: Permite respuestas detalladas

---

## 🔌 Endpoints API

| Endpoint | Método | Autenticación | Descripción |
|----------|--------|---------------|-------------|
| `/api/ai/chat` | POST | Requerida | Chatbot conversacional |
| `/api/ai/recomendaciones` | GET | Requerida | Fondos recomendados con IA |
| `/api/ai/generar-carta/<id>` | POST | Requerida | Generar carta de presentación |
| `/api/ai/validar-elegibilidad/<id>` | GET | Requerida | Validar requisitos |

### Ejemplo de Request

```bash
# Chat
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"mensaje": "¿Qué fondos hay para riego?"}'

# Recomendaciones
curl http://localhost:5000/api/ai/recomendaciones

# Generar carta
curl -X POST http://localhost:5000/api/ai/generar-carta/1

# Validar elegibilidad
curl http://localhost:5000/api/ai/validar-elegibilidad/1
```

---

## 🎨 UI del Chatbot

### Características
- ✅ Interfaz de chat moderna con burbujas
- ✅ Preguntas rápidas predefinidas
- ✅ Indicador de "escribiendo..."
- ✅ Scroll automático
- ✅ Responsive design

### Acceso
1. Iniciar sesión en la plataforma
2. Click en "🤖 Asistente IA" en el navbar
3. Escribir pregunta o usar preguntas rápidas

---

## ⚡ Performance y Límites

### Rate Limits (Google Gemini Free Tier)
- **Requests por minuto:** 60
- **Requests por día:** 1,500
- **Tokens por minuto:** 32,000

### Optimizaciones Implementadas
- Cache de respuestas comunes (futuro)
- Timeout de 30 segundos
- Manejo de errores robusto
- Fallback a respuestas predefinidas

---

## 🐛 Troubleshooting

### Error: "GEMINI_API_KEY no configurada"
```bash
# Verificar .env
cat .env | grep GEMINI

# Configurar
echo "GEMINI_API_KEY=tu-key" >> .env
```

### Error: "Rate limit exceeded"
```python
# El servicio maneja esto automáticamente
# Respuesta: "El asistente está ocupado, intenta en un momento"
```

### Error: "Module 'google.generativeai' not found"
```bash
pip install google-generativeai
```

---

## 📊 Métricas de IA

### Tracking Recomendado

```python
# En producción, agregar analytics
import logging

logger.info(f"Chat: {mensaje} → {len(respuesta)} chars")
logger.info(f"Recomendaciones: {len(fondos_recomendados)} fondos")
logger.info(f"Carta generada: {fondo_id}")
```

---

## 🚀 Próximas Mejoras

1. **Cache de respuestas** con Redis
2. **Fine-tuning** con datos agrícolas chilenos
3. **Multimodal** (análisis de documentos con imágenes)
4. **Voice input** para agricultores con baja alfabetización
5. **Traducción** a lenguas indígenas (Mapudungun)

---

## 📚 Recursos

- [Google Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Prompt Engineering Guide](https://ai.google.dev/gemini-api/docs/prompting-strategies)
- [Python SDK](https://github.com/google/generative-ai-python)

---

**Versión:** 1.0  
**Última actualización:** Enero 2026
