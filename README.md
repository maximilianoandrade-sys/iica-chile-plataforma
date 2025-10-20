# 🚀 Plataforma IICA Chile - Proyectos de Financiamiento

## 📋 Descripción

Plataforma web desarrollada para IICA Chile que centraliza y facilita el acceso a proyectos de financiamiento agrícola. La plataforma incluye funcionalidades avanzadas de búsqueda, notificaciones, seguimiento de aplicaciones y reportes detallados.

## ✨ Características Principales

- **🔍 Búsqueda Avanzada**: Filtros por área, fuente, monto y fecha
- **📊 136 Proyectos**: Base de datos completa con proyectos actualizados
- **💰 $90M+ USD**: En financiamiento total disponible
- **🔔 Notificaciones**: Sistema de alertas en tiempo real
- **📋 Seguimiento**: Gestión completa de aplicaciones
- **📈 Reportes**: Análisis detallados con gráficos interactivos
- **💾 Backup**: Sistema automático de respaldo
- **🌐 Responsive**: Diseño adaptable a todos los dispositivos

## 🛠️ Tecnologías Utilizadas

- **Backend**: Flask, Python 3.13
- **Frontend**: Bootstrap 5, Chart.js, JavaScript
- **Base de Datos**: Excel (proyectos_fortalecidos.xlsx)
- **Despliegue**: Render, Heroku, Railway
- **Cache**: LRU Cache para optimización

## 🚀 Instalación Local

### Prerrequisitos
- Python 3.13+
- pip (gestor de paquetes de Python)

### Pasos de Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/iica-chile-plataforma.git
cd iica-chile-plataforma
```

2. **Crear entorno virtual**
```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate
```

3. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

4. **Ejecutar la aplicación**
```bash
python app_final.py
```

5. **Abrir en el navegador**
```
http://127.0.0.1:5004/
```

## 🌐 Despliegue en la Nube

### Render (Recomendado)

1. **Conectar repositorio**
   - Ir a [Render](https://render.com)
   - Crear nueva cuenta o iniciar sesión
   - Conectar con GitHub

2. **Crear nuevo servicio Web**
   - Seleccionar "New Web Service"
   - Conectar el repositorio
   - Usar configuración automática

3. **Configuración**
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app_final:app --bind 0.0.0.0:$PORT`
   - **Python Version**: 3.13.0

### Heroku

1. **Instalar Heroku CLI**
```bash
# Windows
winget install Heroku.HerokuCLI
# Linux/Mac
curl https://cli.heroku.com/install.sh | sh
```

2. **Desplegar**
```bash
heroku login
heroku create iica-chile-plataforma
git push heroku main
heroku open
```

### Railway

1. **Conectar con GitHub**
   - Ir a [Railway](https://railway.app)
   - Conectar repositorio
   - Desplegar automáticamente

## 📁 Estructura del Proyecto

```
iica-chile-plataforma/
├── app_final.py              # Aplicación principal
├── requirements.txt          # Dependencias Python
├── Procfile                  # Configuración Heroku
├── runtime.txt              # Versión Python
├── render.yaml              # Configuración Render
├── .gitignore               # Archivos a ignorar
├── README.md                # Documentación
├── templates/               # Plantillas HTML
│   ├── home_ordenado.html
│   ├── dashboard_avanzado.html
│   ├── notificaciones.html
│   ├── mis_aplicaciones.html
│   ├── reportes.html
│   ├── backup.html
│   └── error.html
├── static/                  # Archivos estáticos
│   ├── documentos/
│   └── plantillas/
├── data/                    # Base de datos
│   └── proyectos_fortalecidos.xlsx
└── backups/                 # Backups automáticos
```

## 🔧 Configuración

### Variables de Entorno

Crear archivo `.env`:
```
FLASK_ENV=production
SECRET_KEY=tu-clave-secreta-aqui
DATABASE_URL=sqlite:///app.db
```

### Base de Datos

La plataforma utiliza un archivo Excel como base de datos. Para actualizar los proyectos:

1. Modificar `data/proyectos_fortalecidos.xlsx`
2. Reiniciar la aplicación
3. Los cambios se reflejarán automáticamente

## 📊 API Endpoints

- `GET /` - Página principal
- `GET /proyecto/<id>` - Detalles de proyecto
- `GET /notificaciones` - Sistema de notificaciones
- `GET /mis-aplicaciones` - Seguimiento de aplicaciones
- `GET /reportes` - Reportes avanzados
- `GET /backup` - Gestión de backups
- `GET /dashboard-avanzado` - Dashboard completo
- `GET /health` - Health check

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para nueva funcionalidad (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👥 Equipo

- **Desarrollador Principal**: [Tu Nombre]
- **Organización**: IICA Chile
- **Contacto**: [tu-email@ejemplo.com]

## 📞 Soporte

Para soporte técnico o preguntas:
- **Email**: soporte@iica-chile.com
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/iica-chile-plataforma/issues)
- **Documentación**: [Wiki del Proyecto](https://github.com/tu-usuario/iica-chile-plataforma/wiki)

## 🎯 Roadmap

- [ ] Integración con APIs externas
- [ ] Sistema de usuarios con autenticación
- [ ] Notificaciones por email reales
- [ ] Dashboard móvil optimizado
- [ ] Integración con base de datos SQL
- [ ] Sistema de métricas avanzado
- [ ] API REST completa
- [ ] Despliegue automático con CI/CD

---

**🚀 ¡La plataforma está lista para uso en producción!**