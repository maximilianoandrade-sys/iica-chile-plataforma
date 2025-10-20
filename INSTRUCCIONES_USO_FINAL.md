# 📖 INSTRUCCIONES DE USO - PLATAFORMA IICA CHILE

## 🚀 INICIO RÁPIDO

### **1. Ejecutar la Aplicación**
```bash
# Navegar al directorio del proyecto
cd "C:\Users\Pasante\OneDrive - IICA (1)\Documentos\mi-plataforma2"

# Activar entorno virtual (si existe)
venv\Scripts\activate

# Ejecutar la aplicación
python app_working.py
```

### **2. Acceder a la Plataforma**
- **URL Principal**: http://127.0.0.1:5000/
- **Dashboard**: http://127.0.0.1:5000/dashboard
- **Búsqueda IA**: http://127.0.0.1:5000/ai-search

---

## 🎯 FUNCIONALIDADES PRINCIPALES

### **🏠 PÁGINA PRINCIPAL**
- **Logo IICA** oficial y funcional
- **Navegación intuitiva** con 4 secciones principales
- **Búsqueda inteligente** con campo de texto
- **Búsqueda rápida** por categorías predefinidas
- **Estadísticas en tiempo real** del sistema
- **Proyectos destacados** con enlaces directos

### **📊 DASHBOARD**
- **Estadísticas completas** del sistema
- **Gráficos interactivos** con Chart.js
- **Filtros avanzados** por país, palabra clave, recursos
- **Tabla de proyectos** con paginación
- **Métricas de rendimiento** en tiempo real

### **🔍 BÚSQUEDA INTELIGENTE**
- **Lenguaje natural** para consultas
- **Sugerencias automáticas** de proyectos
- **Filtros por área** de interés
- **Resultados relevantes** con IA
- **Enlaces directos** a fuentes oficiales

### **📋 TODOS LOS PROYECTOS**
- **Vista completa** de todos los proyectos
- **Organización por categorías**:
  - Nacionales
  - Internacionales
  - IICA
  - Regionales
  - Privados
  - Académicos
  - Gubernamentales
  - Especializados
- **Filtros avanzados** por fuente y área
- **Exportación** a Excel, CSV, JSON

---

## 🔍 CÓMO BUSCAR PROYECTOS

### **🔎 Búsqueda Básica**
1. **Ir a la página principal**
2. **Escribir** en el campo de búsqueda
3. **Hacer clic** en "Buscar"
4. **Revisar resultados** en la página de búsqueda IA

### **⚡ Búsqueda Rápida**
1. **Usar botones** de categorías predefinidas:
   - 🌱 Agricultura Sostenible
   - 👥 Juventudes Rurales
   - 🚀 Innovación Tecnológica
   - 💧 Gestión Hídrica
   - 🏘️ Desarrollo Rural
   - 🍽️ Seguridad Alimentaria

### **🧠 Búsqueda Inteligente**
1. **Ir a**: http://127.0.0.1:5000/ai-search
2. **Escribir** consultas en lenguaje natural:
   - "Proyectos para jóvenes agricultores"
   - "Financiamiento para tecnología agrícola"
   - "Programas de desarrollo rural"
3. **Obtener resultados** relevantes con IA

---

## 📊 NAVEGACIÓN POR DASHBOARD

### **📈 Estadísticas Principales**
- **Total de Proyectos**: Número total disponible
- **Proyectos Abiertos**: Disponibles para postulación
- **Fuentes Únicas**: Diferentes organismos financiadores
- **Monto Total**: Suma de todos los financiamientos

### **📊 Gráficos Interactivos**
- **Distribución por Área**: Gráfico de dona
- **Fuentes de Financiamiento**: Gráfico de barras
- **Tendencias Temporales**: Líneas de tiempo
- **Análisis Geográfico**: Mapa de proyectos

### **🔍 Filtros Avanzados**
- **Por País**: Filtrar por ubicación
- **Por Palabra Clave**: Búsqueda específica
- **Por Recursos**: Monto de financiamiento
- **Por Fecha**: Rango temporal

---

## 📋 SISTEMA DE POSTULACIONES

### **📝 Postular a un Proyecto**
1. **Seleccionar** un proyecto de la lista
2. **Hacer clic** en "Ver Detalles"
3. **Completar** el formulario de postulación
4. **Adjuntar** documentos requeridos
5. **Enviar** la aplicación

### **📄 Documentos Requeridos**
- **Documentos Personales**: Cédula, CV, certificados
- **Documentos Empresariales**: RUT, estatutos, balances
- **Documentos Técnicos**: Propuesta, presupuesto, cronograma

### **✅ Checklist de Postulación**
- **Revisar** requisitos del proyecto
- **Preparar** documentación necesaria
- **Completar** formulario de postulación
- **Verificar** información antes de enviar
- **Guardar** copia de la aplicación

---

## 🔄 BÚSQUEDA AUTOMÁTICA

### **🤖 Sistema Automático**
- **Búsqueda diaria** a las 6:00 AM
- **Búsqueda cada 6 horas** para actualizaciones
- **Monitoreo** de 6 fuentes principales:
  - Corfo
  - INDAP
  - FIA
  - Minagri
  - FAO
  - Banco Mundial

### **📊 Estado del Sistema**
- **Indicador verde**: Sistema activo
- **Actualización automática**: Cada 30 segundos
- **Log de actividades**: Registro de búsquedas
- **Estadísticas**: Proyectos encontrados

---

## 🛠️ CONFIGURACIÓN AVANZADA

### **⚙️ Variables de Entorno**
```bash
# Puerto de la aplicación
FLASK_PORT=5000

# Modo debug
FLASK_DEBUG=True

# Host de acceso
FLASK_HOST=0.0.0.0
```

### **📁 Archivos de Configuración**
- **requirements.txt**: Dependencias Python
- **app_working.py**: Aplicación principal
- **data/proyectos_completos.xlsx**: Base de datos
- **static/logo_iica_oficial.svg**: Logo oficial

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### **❌ Error: Puerto en uso**
```bash
# Encontrar proceso usando puerto 5000
netstat -an | findstr :5000

# Terminar proceso
taskkill /F /PID [número_del_proceso]
```

### **❌ Error: Módulo no encontrado**
```bash
# Instalar dependencias
pip install -r requirements.txt

# Verificar instalación
pip list
```

### **❌ Error: Base de datos no encontrada**
- **Verificar** que existe `data/proyectos_completos.xlsx`
- **Crear** archivo si no existe
- **Verificar** permisos de lectura

### **❌ Error: Logo no se muestra**
- **Verificar** que existe `static/logo_iica_oficial.svg`
- **Limpiar** caché del navegador
- **Verificar** permisos de archivos

---

## 📱 USO EN MÓVILES

### **📱 Acceso Móvil**
- **URL**: http://[IP_DEL_SERVIDOR]:5000
- **Diseño responsivo** automático
- **Navegación táctil** optimizada
- **Búsqueda** con teclado virtual

### **🔍 Búsqueda Móvil**
- **Campo de búsqueda** adaptado
- **Botones grandes** para táctil
- **Resultados** optimizados para pantalla pequeña
- **Navegación** con gestos

---

## 📊 MÉTRICAS Y ESTADÍSTICAS

### **📈 Dashboard Móvil**
- **Estadísticas** en formato compacto
- **Gráficos** adaptados a pantalla pequeña
- **Navegación** por pestañas
- **Filtros** simplificados

### **📊 Exportación de Datos**
- **Excel**: Formato completo con formato
- **CSV**: Datos separados por comas
- **JSON**: Formato para APIs
- **PDF**: Reportes formateados

---

## 🔐 SEGURIDAD Y PRIVACIDAD

### **🛡️ Medidas de Seguridad**
- **Validación** de datos de entrada
- **Sanitización** de consultas
- **Rate limiting** en APIs
- **Logging** de actividades

### **🔒 Privacidad de Datos**
- **No se almacenan** datos personales
- **Conexiones seguras** HTTPS
- **Backup automático** de datos
- **Eliminación** de logs antiguos

---

## 📞 SOPORTE TÉCNICO

### **🆘 Problemas Comunes**
1. **Aplicación no inicia**: Verificar Python y dependencias
2. **Página no carga**: Verificar puerto y firewall
3. **Búsqueda no funciona**: Verificar conexión a internet
4. **Datos no se actualizan**: Verificar archivos de datos

### **📧 Contacto**
- **Desarrollador**: Asistente IA
- **Proyecto**: Plataforma IICA Chile
- **Versión**: 1.0 Final
- **Fecha**: 2024

---

## 🎉 ¡PLATAFORMA LISTA PARA USAR!

**Tu plataforma IICA Chile está completamente funcional con:**
- ✅ **Interfaz estética** moderna y profesional
- ✅ **Búsqueda automática** en páginas web
- ✅ **Sistema de IA** para búsqueda inteligente
- ✅ **Analytics avanzados** en tiempo real
- ✅ **Sistema de postulaciones** completo
- ✅ **Documentación completa** de uso

**¡Disfruta de tu nueva plataforma de financiamiento agrícola!** 🚀✨🌾


