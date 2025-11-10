# Instrucciones de Instalación y Uso - Plataforma IICA Chile

## 📋 Requisitos Previos

- Python 3.11 o superior
- pip (gestor de paquetes de Python)
- Git (opcional, para clonar el repositorio)

## 🚀 Instalación Local

### Paso 1: Preparar el Entorno

**Windows:**
```powershell
# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
venv\Scripts\activate

# Actualizar pip
python -m pip install --upgrade pip
```

**Linux/Mac:**
```bash
# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
source venv/bin/activate

# Actualizar pip
python -m pip install --upgrade pip
```

### Paso 2: Instalar Dependencias

```bash
pip install -r requirements.txt
```

### Paso 3: Ejecutar la Aplicación

```bash
python app.py
```

La aplicación estará disponible en: `http://localhost:5000`

## 🌐 Despliegue en Render.com

### Configuración Paso a Paso

1. **Crear cuenta en Render.com**
   - Visita https://render.com
   - Crea una cuenta gratuita

2. **Conectar repositorio**
   - Ve a Dashboard → New → Web Service
   - Conecta tu repositorio Git (GitHub, GitLab, etc.)

3. **Configurar el servicio**
   - **Name**: `plataforma-iica-proyectos`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT`
   - **Plan**: Free (o el plan que prefieras)

4. **Variables de entorno** (opcional)
   - `PORT`: 10000
   - `DEBUG`: False
   - `SECRET_KEY`: (generar una clave secreta)

5. **Desplegar**
   - Haz clic en "Create Web Service"
   - Render construirá y desplegará automáticamente

### Actualización Automática con Cron Jobs

1. **Crear Cron Job en Render**
   - Ve a Dashboard → New → Cron Job
   - **Name**: `actualizar-proyectos-diario`
   - **Schedule**: `0 2 * * *` (diario a las 2 AM)
   - **Command**: `python update_proyectos.py`
   - **Environment**: `Python 3`

2. **Verificar logs**
   - Los logs de actualización se guardan en `logs/update.log`
   - También puedes verlos en Render Dashboard

## 📊 Uso de la Plataforma

### Búsqueda de Proyectos

1. **Búsqueda por palabra clave**
   - Escribe términos como "agricultura", "riego", "innovación", etc.
   - La búsqueda busca en nombre, área y fuente

2. **Filtros avanzados**
   - **Área Temática**: Filtra por áreas IICA
   - **Estado**: Abierto/Cerrado
   - **Fuente**: Selecciona la fuente de financiamiento
   - **Ordenamiento**: Por fecha, monto o nombre

3. **Actualización manual**
   - Haz clic en "Actualizar Proyectos"
   - Esto recolecta información fresca de todas las fuentes
   - Puede tomar varios minutos

### Áreas Temáticas IICA

Los proyectos se clasifican automáticamente en:

- **Agricultura familiar campesina**
- **Innovación tecnológica**
- **Gestión hídrica**
- **Seguridad alimentaria**
- **Juventud rural**
- **Medio ambiente**

## 🔧 Configuración Avanzada

### Modificar Fuentes

Para agregar o modificar fuentes, edita los archivos en `scrapers/`:

```python
# scrapers/nueva_fuente.py
from utils import clasificar_area, parsear_fecha, parsear_monto
from scrapers.common import fetch_html, parse_with_bs4

def obtener_proyectos_nueva_fuente():
    proyectos = []
    # Tu código de scraping aquí
    return proyectos
```

Luego agrega la importación en `app.py`:

```python
from scrapers.nueva_fuente import obtener_proyectos_nueva_fuente
```

### Modificar Clasificación

Edita `utils.py` para modificar las palabras clave de clasificación:

```python
areas_iica = {
    "Nueva Área": ["palabra1", "palabra2", ...],
    # ...
}
```

## 🐛 Solución de Problemas

### Error: "ModuleNotFoundError: No module named 'scrapers'"

**Solución:**
- Asegúrate de ejecutar desde el directorio raíz del proyecto
- Verifica que `scrapers/__init__.py` existe

### Error: "Connection timeout"

**Solución:**
- Algunas fuentes pueden estar temporalmente no disponibles
- Los scrapers manejan errores y continúan con otras fuentes
- Verifica tu conexión a internet

### Error al guardar Excel

**Solución:**
- Verifica permisos de escritura en el directorio `data/`
- Asegúrate de que `openpyxl` está instalado: `pip install openpyxl`

### La aplicación no inicia

**Solución:**
1. Verifica que todas las dependencias están instaladas: `pip install -r requirements.txt`
2. Revisa los logs en `logs/app.log`
3. Verifica que el puerto 5000 no está en uso

## 📝 Estructura de Datos

Los proyectos se guardan en `data/proyectos.xlsx` con la siguiente estructura:

| Campo | Descripción |
|-------|-------------|
| Nombre | Nombre del proyecto/convocatoria |
| Fuente | Fuente de financiamiento |
| Fecha cierre | Fecha de cierre (YYYY-MM-DD) |
| Enlace | URL del proyecto |
| Estado | Abierto/Cerrado |
| Monto | Monto del financiamiento |
| Área de interés | Área temática IICA |

El histórico se guarda en `data/proyectos_historico.xlsx` con un campo adicional:
- `Fecha_deteccion`: Fecha y hora en que se detectó el proyecto

## 📞 Soporte

Para más información sobre IICA Chile:
- Email: hernan.chiriboga@iica.int
- Teléfono: (56-2) 2225-2511
- Dirección: Calle Rancagua No.0320, Providencia, Santiago, Chile

## 📄 Licencia

Este proyecto es desarrollado para IICA Chile.

