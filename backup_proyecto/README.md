# Plataforma IICA Chile

Sistema de gestión de proyectos y oportunidades de financiamiento para el Instituto Interamericano de Cooperación para la Agricultura (IICA) en Chile.

## 🚀 Instalación y Ejecución

### Opción 1: Ejecución Automática (Recomendada)
```bash
python run.py
```

### Opción 2: Ejecución Manual

1. **Instalar dependencias:**
```bash
pip install -r requirements.txt
```

2. **Ejecutar la aplicación:**
```bash
python app_working.py
```

## 📋 Requisitos del Sistema

- Python 3.7 o superior
- pip (gestor de paquetes de Python)

## 📦 Dependencias

- Flask 2.3.3
- pandas 2.0.3
- openpyxl 3.1.2
- Werkzeug 2.3.7

## 🌐 Acceso a la Aplicación

Una vez ejecutada, la aplicación estará disponible en:
- **URL Local:** http://localhost:5000
- **URL Red:** http://0.0.0.0:5000

## 📁 Estructura del Proyecto

```
backup_proyecto/
├── app_working.py          # Aplicación principal Flask
├── utils.py                # Utilidades auxiliares
├── requirements.txt        # Dependencias del proyecto
├── run.py                  # Script de ejecución automática
├── README.md              # Este archivo
├── data/                  # Directorio de datos (se crea automáticamente)
│   └── proyectos.xlsx    # Base de datos de proyectos
└── templates/            # Plantillas HTML
    └── home_simple.html  # Página principal
```

## 🎯 Funcionalidades

- **Gestión de Proyectos:** Visualización y filtrado de proyectos
- **Búsqueda Avanzada:** Por nombre, descripción, área de interés
- **Filtros:** Por estado, área de interés, fecha
- **Ordenamiento:** Por fecha, monto, nombre, fuente
- **Paginación:** Navegación por páginas
- **Estadísticas:** Resumen de proyectos y métricas

## 🔧 Configuración

La aplicación se ejecuta en modo debug por defecto. Para producción, modifica las siguientes líneas en `app_working.py`:

```python
app.run(debug=False, host='0.0.0.0', port=5000)
```

## 📊 Datos de Ejemplo

La aplicación incluye proyectos de ejemplo de diferentes fuentes:
- IICA Chile
- FIA (Fundación para la Innovación Agraria)
- CNR (Comisión Nacional de Riego)
- INDAP (Instituto de Desarrollo Agropecuario)
- Fondos.gob.cl

## 🛠️ Desarrollo

Para modificar o extender la aplicación:

1. **Agregar nuevas rutas:** Modifica `app_working.py`
2. **Cambiar estilos:** Edita `templates/home_simple.html`
3. **Agregar funcionalidades:** Extiende las funciones existentes

## 📞 Soporte

Para soporte técnico o consultas sobre la plataforma, contacta al equipo de desarrollo.

## 📝 Notas

- Los datos se almacenan en formato Excel en el directorio `data/`
- La aplicación incluye datos de ejemplo para demostración
- El sistema es compatible con navegadores modernos
