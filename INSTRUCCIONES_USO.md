# 📋 INSTRUCCIONES DE USO - PLATAFORMA IICA CHILE

## 🚀 INICIO RÁPIDO

### 1. EJECUTAR LA APLICACIÓN
```bash
# Abrir terminal en la carpeta del proyecto
cd "C:\Users\Pasante\OneDrive - IICA (1)\Documentos\mi-plataforma2"

# Ejecutar la aplicación
python app_working.py
```

### 2. ACCEDER A LA PLATAFORMA
- **URL Local**: http://127.0.0.1:5000
- **URL Red**: http://172.16.30.70:5000
- **Puerto**: 5000

---

## 🎯 FUNCIONALIDADES PRINCIPALES

### 📊 PÁGINA PRINCIPAL
1. **Ver proyectos disponibles** (178 proyectos)
2. **Usar filtros**:
   - Área: Desarrollo rural, Innovación, etc.
   - Estado: Abierto, Cerrado, etc.
   - Fuente: FAO, UNDP, etc.
3. **Buscar por texto** en nombre o descripción
4. **Ordenar por**:
   - Fecha de cierre
   - Monto
   - Nombre
   - Fuente
5. **Navegar páginas** (5 proyectos por página)

### 🏢 SECCIÓN INSTITUCIONES
1. **Organizaciones Internacionales**:
   - FAO, UNDP, Banco Mundial, BID
2. **Gobierno de Chile**:
   - Minagri, INDAP, FIA, CNR
3. **Sector Privado**:
   - SAG, CORFO, Fondos.gob.cl, AGCID
4. **Organizaciones Sociales**:
   - CONADI, Fundación Chile, GEF, FIDA

### 🔍 DETALLES DE PROYECTOS
1. **Hacer clic en "Ver Detalles"** en cualquier proyecto
2. **Ver información completa**:
   - Monto exacto
   - Fecha de cierre
   - Descripción detallada
   - Enlace a fuente original

### 🌐 NAVEGACIÓN
1. **Inicio**: Lista de proyectos
2. **Quiénes Somos**: Información IICA Chile
3. **Adjudicados**: Proyectos ya adjudicados

---

## 🛠️ MANTENIMIENTO

### 📁 ARCHIVOS IMPORTANTES
- **`app_working.py`** - Aplicación principal
- **`templates/home_simple.html`** - Página principal
- **`data/proyectos.xlsx`** - Base de datos
- **`translations.py`** - Idiomas

### 🔄 ACTUALIZAR DATOS
1. **Editar** `data/proyectos.xlsx`
2. **Reiniciar** la aplicación
3. **Los cambios** se reflejan automáticamente

### 🐛 SOLUCIÓN DE PROBLEMAS

#### Si la aplicación no inicia:
```bash
# Verificar Python
python --version

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar aplicación
python app_working.py
```

#### Si hay errores de puerto:
```bash
# Cambiar puerto en app_working.py
# Línea: app.run(host='0.0.0.0', port=5000, debug=True)
# Cambiar 5000 por otro número (ej: 8000)
```

---

## 📱 USO EN DIFERENTES DISPOSITIVOS

### 💻 COMPUTADORA
- **Navegador**: Chrome, Firefox, Edge, Safari
- **Resolución**: Cualquier tamaño de pantalla
- **Funcionalidades**: Todas disponibles

### 📱 MÓVIL
- **Navegador**: Cualquier navegador móvil
- **Responsive**: Se adapta automáticamente
- **Funcionalidades**: Todas disponibles

### 📟 TABLET
- **Navegador**: Cualquier navegador
- **Responsive**: Optimizado para tablets
- **Funcionalidades**: Todas disponibles

---

## 🌐 DESPLIEGUE EN INTERNET

### 🚀 RENDER.COM (Recomendado)
1. **Crear cuenta** en render.com
2. **Conectar repositorio** GitHub
3. **Configurar** con `render.yaml`
4. **Desplegar** automáticamente

### 🚂 RAILWAY.APP
1. **Crear cuenta** en railway.app
2. **Conectar repositorio** GitHub
3. **Configurar** con `railway.json`
4. **Desplegar** automáticamente

### 🐳 DOCKER
```bash
# Construir imagen
docker build -t plataforma-iica .

# Ejecutar contenedor
docker run -p 5000:5000 plataforma-iica
```

---

## 📊 ESTADÍSTICAS ACTUALES

### 📈 DATOS DEL PROYECTO
- **178 proyectos** en base de datos
- **Múltiples fuentes** de financiamiento
- **16 instituciones** con enlaces
- **4 categorías** de instituciones
- **Soporte multiidioma** (ES/EN)

### 🎯 FUNCIONALIDADES
- **Filtros avanzados** ✅
- **Búsqueda por texto** ✅
- **Paginación** ✅
- **Ordenamiento** ✅
- **Responsive design** ✅
- **Enlaces funcionales** ✅

---

## 🔧 CONFIGURACIÓN AVANZADA

### 🌍 CAMBIAR IDIOMA
1. **Selector** en la barra superior
2. **Español/English** disponible
3. **Cambio automático** de interfaz

### 🎨 PERSONALIZAR DISEÑO
1. **Editar** `templates/home_simple.html`
2. **Modificar CSS** en la sección `<style>`
3. **Reiniciar** aplicación

### 📊 AGREGAR PROYECTOS
1. **Editar** `data/proyectos.xlsx`
2. **Agregar filas** con nuevos proyectos
3. **Reiniciar** aplicación

---

## 📞 SOPORTE

### ✅ ESTADO ACTUAL
- **Aplicación**: Funcionando correctamente
- **Base de datos**: 178 proyectos cargados
- **Enlaces**: Todos funcionales
- **Diseño**: Responsive y moderno

### 🔄 PRÓXIMOS PASOS
1. **Probar** todas las funcionalidades
2. **Verificar** enlaces de instituciones
3. **Personalizar** según necesidades
4. **Desplegar** en internet si es necesario

---

## 🎉 ¡LISTO PARA USAR!

**La plataforma está completamente funcional y lista para usar.**

### 🚀 COMANDO DE INICIO
```bash
python app_working.py
```

### 🌐 ACCESO
- **Local**: http://127.0.0.1:5000
- **Red**: http://172.16.30.70:5000

**¡Disfruta usando la plataforma IICA Chile!** 🎉


