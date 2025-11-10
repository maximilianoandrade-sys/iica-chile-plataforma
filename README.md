# Plataforma IICA Chile - Fondos y Convocatorias

Plataforma web modular en Flask para recolección, clasificación y visualización automática de proyectos y convocatorias de financiamiento agrícola y desarrollo rural.

## 🚀 Características

- **Scraping en Tiempo Real**: Recolección automática desde múltiples fuentes internacionales y nacionales
- **Clasificación Inteligente**: Clasificación automática por áreas temáticas IICA
- **Búsqueda Avanzada**: Filtros por palabra clave, fuente, estado, área temática
- **Interfaz Moderna**: Diseño responsivo con Bootstrap 5
- **Histórico**: Guardado automático en Excel con detección de proyectos nuevos
- **API REST**: Endpoints para integración con otros sistemas

## 📋 Fuentes de Datos

La plataforma recolecta información de:

### Fuentes Especializadas IICA (Prioritarias)

1. **IICA Chile** - https://www.iica.int/es/paises/chile
2. **Agro América Emprende** - https://agroemprende.iica.int/
3. **INNOVA AF** - https://innova-af.iica.int/
4. **Agua y Agricultura IICA** - https://aguayagricultura.iica.int/
5. **Repositorio Institucional IICA** - https://apps.iica.int/

### Otras Fuentes

6. **Devex** - https://www.devex.com/
7. **DevelopmentAid** - https://www.developmentaid.org/
8. **UNGM** - https://www.ungm.org/Public/Notice
9. **MercadoPúblico** - https://www.mercadopublico.cl/Home
10. **FIA** - https://www.fia.cl/
11. **GlobalTenders** - https://www.globaltenders.com/
12. **Fondos.gob.cl** - https://fondos.gob.cl/
13. **INIA** - https://www.inia.cl/licitaciones/
14. **FAO** - https://www.fao.org/
15. **Banco Mundial** - https://www.worldbank.org/
16. **Perplexity** - Búsqueda inteligente (limitado)

## 🛠️ Instalación Local

### Requisitos

- Python 3.11 o superior
- pip (gestor de paquetes de Python)

### Pasos

1. **Clonar o descargar el proyecto**

```bash
cd mi-plataforma2
```

2. **Crear entorno virtual**

```bash
python -m venv venv
```

3. **Activar entorno virtual**

**Windows:**
```bash
venv\Scripts\activate
```

**Linux/Mac:**
```bash
source venv/bin/activate
```

4. **Instalar dependencias**

```bash
pip install -r requirements.txt
```

5. **Ejecutar la aplicación**

```bash
python app.py
```

6. **Acceder a la plataforma**

Abrir navegador en: `http://localhost:5000`

## 📦 Estructura del Proyecto

```
mi-plataforma2/
├── app.py                 # Aplicación Flask principal
├── utils.py               # Utilidades (clasificación, parsing)
├── update_proyectos.py    # Script de actualización automática
├── requirements.txt        # Dependencias Python
├── render.yaml            # Configuración para Render.com
├── scrapers/              # Módulos de scraping
│   ├── __init__.py
│   ├── devex.py
│   ├── developmentaid.py
│   ├── ungm.py
│   ├── mercadopublico.py
│   ├── fia.py
│   ├── globaltenders.py
│   ├── fondosgob.py
│   ├── inia.py
│   ├── fao.py
│   ├── worldbank.py
│   ├── perplexity.py
│   └── common.py
├── templates/             # Plantillas HTML
│   ├── home.html
│   └── error.html
├── data/                  # Datos (Excel, histórico)
└── logs/                  # Archivos de log
```

## 🌐 Despliegue en Render.com

### Configuración

1. **Crear cuenta en Render.com**

2. **Conectar repositorio Git**

3. **Crear nuevo Web Service**

   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app --bind 0.0.0.0:$PORT`
   - **Environment**: Python 3

4. **Configurar variables de entorno** (opcional)

   - `PORT`: 10000
   - `DEBUG`: False

5. **Desplegar**

   Render usará automáticamente el archivo `render.yaml` si está presente.

### Actualización Automática

Para configurar actualizaciones periódicas en Render:

1. **Crear Cron Job** en Render Dashboard
2. **Configurar comando**: `python update_proyectos.py`
3. **Programar frecuencia**: Diaria (ej: `0 2 * * *` para las 2 AM)

## 📊 Uso de la Plataforma

### Búsqueda y Filtros

1. **Búsqueda por palabra clave**: Escribe términos relacionados con el proyecto
2. **Filtro por área temática**: Selecciona entre las áreas IICA
3. **Filtro por estado**: Abierto/Cerrado
4. **Filtro por fuente**: Selecciona la fuente de financiamiento
5. **Ordenamiento**: Por fecha, monto o nombre

### Actualización Manual

Haz clic en el botón **"Actualizar Proyectos"** para recolectar información fresca de todas las fuentes.

### API REST

#### Obtener todos los proyectos
```
GET /api/proyectos
```

#### Buscar proyectos
```
GET /api/proyectos?query=agricultura&area=Innovación tecnológica&estado=Abierto
```

#### Health Check
```
GET /health
```

## 🔧 Áreas Temáticas IICA

La plataforma clasifica automáticamente los proyectos en:

1. **Agricultura familiar campesina**
2. **Innovación tecnológica**
3. **Gestión hídrica**
4. **Seguridad alimentaria**
5. **Juventud rural**
6. **Medio ambiente**

## 📝 Logs

Los logs se guardan en:
- `logs/app.log` - Logs de la aplicación
- `logs/update.log` - Logs de actualizaciones automáticas

## ⚠️ Notas Importantes

- **Scraping**: Algunos sitios pueden cambiar su estructura HTML, requiriendo actualización de selectores
- **Rate Limiting**: Los scrapers incluyen delays para evitar sobrecarga en los servidores
- **Datos**: La primera ejecución puede tomar varios minutos mientras recolecta de todas las fuentes
- **Perplexity**: Esta fuente tiene limitaciones ya que es un motor de búsqueda, no un portal de proyectos

## 🐛 Solución de Problemas

### Error: "No module named 'scrapers'"
- Asegúrate de ejecutar desde el directorio raíz del proyecto
- Verifica que `scrapers/__init__.py` existe

### Error: "Connection timeout"
- Algunas fuentes pueden estar temporalmente no disponibles
- Los scrapers manejan errores y continúan con otras fuentes

### Error al guardar Excel
- Verifica permisos de escritura en el directorio `data/`
- Asegúrate de que `openpyxl` está instalado

## 📄 Licencia

Este proyecto es desarrollado para IICA Chile.

## 👥 Contacto

Para más información sobre IICA Chile:
- Email: hernan.chiriboga@iica.int
- Teléfono: (56-2) 2225-2511
- Dirección: Calle Rancagua No.0320, Providencia, Santiago, Chile
