# Guía de Despliegue MVP - IICA Chile

## Configuración en Render.com

### 1. Crear Base de Datos PostgreSQL

1. En Render Dashboard, ir a **New** → **PostgreSQL**
2. Configurar:
   - **Name**: `iica-chile-db`
   - **Database**: `iica_chile`
   - **User**: (auto-generado)
   - **Region**: Oregon (US West)
   - **Plan**: Free
3. Copiar la **Internal Database URL**

### 2. Configurar Web Service

1. En Render Dashboard, ir a **New** → **Web Service**
2. Conectar repositorio GitHub
3. Configurar:
   - **Name**: `iica-chile-plataforma`
   - **Environment**: Python 3
   - **Build Command**: 
     ```bash
     pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     gunicorn app_mvp:app
     ```

### 3. Variables de Entorno

Agregar en Render → Environment:

```
DATABASE_URL=<Internal Database URL de PostgreSQL>
SECRET_KEY=<generar clave secreta aleatoria>
FLASK_ENV=production
```

### 4. Inicializar Base de Datos

Después del primer deploy, ejecutar en Render Shell:

```bash
flask init-db
flask migrate-data
```

## Comandos Locales para Desarrollo

### Instalar Dependencias

```bash
pip install -r requirements.txt
```

### Configurar Variables de Entorno

Crear archivo `.env`:

```
DATABASE_URL=sqlite:///iica_chile.db
SECRET_KEY=dev-secret-key
FLASK_ENV=development
```

### Inicializar Base de Datos Local

```bash
python app_mvp.py
# O usar Flask CLI:
flask --app app_mvp init-db
flask --app app_mvp migrate-data
```

### Ejecutar Servidor Local

```bash
python app_mvp.py
# Acceder en: http://localhost:5000
```

## Estructura de Archivos MVP

```
iica-chile-plataforma/
├── app_mvp.py              # Aplicación principal
├── models.py               # Modelos SQLAlchemy
├── config_db.py            # Configuración BD
├── migrate_to_postgres.py  # Script migración
├── requirements.txt        # Dependencias
├── templates/
│   ├── base_mvp.html
│   ├── home_mvp.html
│   ├── registro.html
│   ├── login.html
│   └── dashboard.html
└── scrapers/
    └── indap_mejorado.py
```

## Próximos Pasos

1. ✅ Configurar PostgreSQL en Render
2. ✅ Deploy inicial
3. ✅ Migrar datos Excel → PostgreSQL
4. ⏳ Crear templates restantes (login, home_mvp, dashboard)
5. ⏳ Implementar scraper automático con cron
6. ⏳ Agregar búsqueda en tiempo real con JavaScript
7. ⏳ Optimizar UI responsive

## Troubleshooting

### Error: "relation does not exist"
```bash
flask --app app_mvp init-db
```

### Error: "No module named 'psycopg2'"
Verificar que `psycopg2-binary` esté en requirements.txt

### Error de conexión a PostgreSQL
Verificar que DATABASE_URL esté configurada correctamente en Render
