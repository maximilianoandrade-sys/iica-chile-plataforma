# IICA Chile - Plataforma de Financiamiento Agrícola MVP

![IICA Chile](https://img.shields.io/badge/IICA-Chile-green)
![Python](https://img.shields.io/badge/Python-3.9+-blue)
![Flask](https://img.shields.io/badge/Flask-2.3.3-lightgrey)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)

Plataforma web para conectar agricultores chilenos con oportunidades de financiamiento agrícola de fuentes como INDAP, FIA, CORFO, FONTAGRO y más.

## 🌟 Características MVP

- ✅ **Base de datos PostgreSQL** con SQLAlchemy ORM
- ✅ **Autenticación de usuarios** con Flask-Login
- ✅ **Perfiles agrícolas** (región, tipo de predio, cultivos)
- ✅ **Búsqueda avanzada** con filtros por fuente, área y estado
- ✅ **Sistema de favoritos** para guardar fondos de interés
- ✅ **Dashboard personalizado** con recomendaciones
- ✅ **Scrapers automatizados** para INDAP y otras fuentes
- ✅ **API REST** para integraciones
- ✅ **Diseño responsive** optimizado para móviles

## 🚀 Inicio Rápido

### Requisitos Previos

- Python 3.9+
- pip
- PostgreSQL (para producción) o SQLite (para desarrollo)

### Instalación Local

```bash
# Clonar repositorio
git clone <tu-repo>
cd iica-chile-plataforma

# Crear entorno virtual
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Inicializar base de datos
flask --app app_mvp init-db

# Migrar datos de Excel (opcional)
flask --app app_mvp migrate-data

# Ejecutar servidor
python app_mvp.py
```

Acceder en: http://localhost:5000

## 📁 Estructura del Proyecto

```
iica-chile-plataforma/
├── app_mvp.py                 # Aplicación Flask principal
├── models.py                  # Modelos SQLAlchemy
├── config_db.py               # Configuración de BD
├── migrate_to_postgres.py     # Script de migración
├── requirements.txt           # Dependencias Python
├── .env.example               # Variables de entorno ejemplo
├── DEPLOY_MVP.md              # Guía de despliegue
│
├── templates/                 # Templates HTML
│   ├── base_mvp.html         # Template base
│   ├── home_mvp.html         # Página principal
│   ├── login.html            # Inicio de sesión
│   ├── registro.html         # Registro
│   ├── dashboard.html        # Dashboard usuario
│   └── detalle_fondo.html    # Detalle de fondo
│
├── scrapers/                  # Scrapers de datos
│   └── indap_mejorado.py     # Scraper INDAP
│
└── data/                      # Datos Excel (legacy)
    └── proyectos_reales_2026.xlsx
```

## 🗄️ Modelos de Base de Datos

### Usuario
- Email, contraseña (hasheada)
- Perfil agrícola: región, tipo de predio, cultivos
- Relaciones: favoritos, postulaciones

### Fondo
- Información completa del fondo
- Monto, fechas, clasificación
- Enlaces a convocatoria y postulación

### Favorito
- Relación usuario-fondo
- Notas personales

### Postulacion
- Seguimiento de aplicaciones
- Estados: En preparación, Enviada, Aprobada, etc.

## 🔌 API Endpoints

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/` | GET | Página principal con búsqueda |
| `/registro` | GET/POST | Registro de usuarios |
| `/login` | GET/POST | Inicio de sesión |
| `/dashboard` | GET | Dashboard personalizado |
| `/fondo/<id>` | GET | Detalle de fondo |
| `/api/fondos` | GET | Búsqueda de fondos (JSON) |
| `/api/favorito/toggle/<id>` | POST | Agregar/quitar favorito |

## 🌐 Despliegue en Render

### 1. Crear PostgreSQL

1. En Render Dashboard: **New** → **PostgreSQL**
2. Name: `iica-chile-db`
3. Plan: **Free**
4. Copiar **Internal Database URL**

### 2. Crear Web Service

1. **New** → **Web Service**
2. Conectar repositorio GitHub
3. Configuración:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app_mvp:app`

### 3. Variables de Entorno

```
DATABASE_URL=<Internal Database URL>
SECRET_KEY=<generar-clave-aleatoria>
FLASK_ENV=production
```

### 4. Inicializar BD

En Render Shell:
```bash
flask --app app_mvp init-db
flask --app app_mvp migrate-data
```

Ver guía completa en [`DEPLOY_MVP.md`](DEPLOY_MVP.md)

## 🤖 Scrapers

### INDAP Scraper

```bash
python scrapers/indap_mejorado.py
```

Características:
- Múltiples selectores CSS (fallback automático)
- Parsing robusto de fechas y montos
- Logging detallado
- Manejo de errores

## 🔧 Comandos Útiles

```bash
# Inicializar BD
flask --app app_mvp init-db

# Migrar datos Excel → PostgreSQL
flask --app app_mvp migrate-data

# Ejecutar servidor desarrollo
python app_mvp.py

# Ejecutar scraper INDAP
python scrapers/indap_mejorado.py
```

## 📊 Roadmap

### ✅ Fase MVP (Completada)
- Base de datos PostgreSQL
- Autenticación de usuarios
- Búsqueda y filtros
- Sistema de favoritos
- Scraper INDAP

### 🔄 Fase 1.0 (Próxima)
- Matching automático con IA
- Integración CORFO y FIA
- Mapa interactivo por región
- Calculadora de elegibilidad
- Notificaciones por email

### 🚀 Fase 2.0 (Futuro)
- Chatbot con GPT-4
- Generador de postulaciones
- API pública
- App móvil (PWA)
- Analytics avanzado

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la licencia MIT.

## 👥 Equipo

Desarrollado para **IICA Chile** - Instituto Interamericano de Cooperación para la Agricultura

## 📧 Contacto

Para consultas: [contacto@iica.int](mailto:contacto@iica.int)

---

**Versión:** MVP 1.0  
**Última actualización:** Enero 2026
