# 🔍 GUÍA DE VERIFICACIÓN EN PRODUCCIÓN

**URL:** https://iica-chile-plataforma.vercel.app/  
**Fecha:** 30 Enero 2026  
**Última actualización:** Commit `fc2e8f9`

---

## 🎯 PASOS PARA VERIFICAR LA PLATAFORMA

### 1. **Limpiar Caché del Navegador**

Antes de empezar, asegúrate de que estás viendo la versión más reciente:

**Chrome/Edge:**
1. Presiona `Ctrl + Shift + Delete` (Windows) o `Cmd + Shift + Delete` (Mac)
2. Selecciona "Imágenes y archivos en caché"
3. Haz clic en "Borrar datos"

**O simplemente:**
- Presiona `Ctrl + Shift + R` (Windows) o `Cmd + Shift + R` (Mac) para hard refresh

---

### 2. **Verificar Página Principal**

#### ✅ Header
- [ ] Logo "IICA Chile" visible
- [ ] Navegación con 6 links: Inicio, Convocatorias, Mi Maletín, Consultores, Recursos, Contacto
- [ ] Hero banner con imagen de fondo de campo agrícola
- [ ] Botón "Ver Convocatorias Abiertas" funcional

#### ✅ Asistente de Perfilamiento
- [ ] Banner azul grande con texto "Encuentra tu fondo ideal en 3 pasos"
- [ ] Botón "Comenzar Ahora" visible
- [ ] Al hacer clic, se abre modal con:
  - Paso 1: Selección de Objetivo (4 opciones)
  - Paso 2: Selección de Región (17 regiones)
  - Paso 3: Selección de Perfil (3 opciones)
- [ ] Botones "Anterior", "Siguiente", "Omitir" funcionan
- [ ] Al completar, filtra los proyectos automáticamente

#### ✅ Lista de Proyectos
- [ ] Tabla visible en desktop (columnas: Nombre, Institución, Categoría, Monto, Cierre, Acciones)
- [ ] Tarjetas visibles en mobile
- [ ] Badges de "Días Restantes":
  - Rojo pulsante si cierra en <7 días
  - Azul si cierra en >7 días
- [ ] Texto pequeño "IA: Postulación Fácil/Media" debajo de institución
- [ ] Botón "Calcular Elegibilidad" debajo de "Ver Bases"
- [ ] Al hacer clic en "Calcular Elegibilidad", se abre modal con quiz
- [ ] Sistema de favoritos (estrella) funciona
- [ ] Comparador de proyectos (checkbox) funciona

#### ✅ Filtros
- [ ] Barra de búsqueda funciona
- [ ] Filtro por Categoría funciona
- [ ] Filtro por Región funciona
- [ ] Filtro por Beneficiario funciona
- [ ] Filtro por Institución funciona
- [ ] Filtro por Agrovoc funciona
- [ ] Botón "Solo Favoritos" funciona

#### ✅ Footer
- [ ] 3 columnas: IICA Chile, Enlaces Rápidos, Contacto
- [ ] Iconos de Facebook y Twitter visibles
- [ ] Links a Mi Maletín y Consultores presentes
- [ ] Email clickeable (abre cliente de correo)
- [ ] Teléfono clickeable (abre marcador)
- [ ] Links a Política de Privacidad y Términos de Uso

---

### 3. **Verificar Mi Maletín**

**URL:** https://iica-chile-plataforma.vercel.app/maletin

#### ✅ Dashboard
- [ ] Header con título "Mi Maletín Digital"
- [ ] Link "Volver al Inicio" funciona
- [ ] 3 tarjetas de estadísticas:
  - Documentos Listos (3/4)
  - Nivel de Preparación (75%)
  - Tarjeta verde con link a Consultores

#### ✅ Lista de Documentos
- [ ] 4 documentos listados:
  1. Carpeta Tributaria (Válido)
  2. Certificado de Vigencia (Por vencer)
  3. Derechos de Agua (Válido)
  4. Rol de Avalúo Fiscal (Pendiente)
- [ ] Estados visuales correctos (verde, amarillo, rojo)
- [ ] Botones "Ver" y "Descargar" en documentos válidos
- [ ] Botón "Subir Archivo" en documento pendiente
- [ ] Al hacer clic en "Subir Archivo", muestra alerta de simulación

---

### 4. **Verificar Directorio de Consultores**

**URL:** https://iica-chile-plataforma.vercel.app/consultores

#### ✅ Header
- [ ] Título "Directorio de Consultores"
- [ ] Link "Volver al Inicio" funciona
- [ ] Botón "Ir a Mi Maletín" visible

#### ✅ Búsqueda y Filtros
- [ ] Barra de búsqueda presente
- [ ] Filtros: Todos, Riego, Suelos, Maule, Araucanía
- [ ] Al hacer clic en filtro, actualiza la lista

#### ✅ Grid de Consultores
- [ ] 4 tarjetas de consultores visibles
- [ ] Cada tarjeta muestra:
  - Foto de perfil
  - Nombre
  - Especialidad
  - Región
  - Calificación con estrellas
  - Número de reseñas
  - Tags de expertise
  - Botones "Chat" y "Llamar"

---

### 5. **Verificar PWA**

#### ✅ Instalación
- [ ] En Chrome/Edge, aparece ícono de "Instalar" en barra de direcciones
- [ ] Al hacer clic, muestra diálogo de instalación
- [ ] Después de instalar, la app se abre en ventana independiente

#### ✅ Offline
- [ ] Desconecta internet
- [ ] Recarga la página
- [ ] La página debería cargar (aunque con datos en caché)

---

### 6. **Verificar Responsive Design**

#### ✅ Mobile (< 768px)
- [ ] Abre DevTools (F12)
- [ ] Cambia a vista mobile (iPhone/Android)
- [ ] Header se adapta (menú hamburguesa)
- [ ] Proyectos se muestran como tarjetas
- [ ] Asistente se ve bien en pantalla pequeña
- [ ] Footer se apila verticalmente

#### ✅ Tablet (768px - 1024px)
- [ ] Cambia a vista tablet (iPad)
- [ ] Layout se adapta correctamente
- [ ] Navegación visible
- [ ] Grid de consultores en 2 columnas

#### ✅ Desktop (> 1024px)
- [ ] Cambia a vista desktop
- [ ] Tabla de proyectos visible
- [ ] Grid de consultores en 4 columnas
- [ ] Todo el contenido centrado con max-width

---

### 7. **Verificar Performance**

#### ✅ Lighthouse (Chrome DevTools)
1. Abre DevTools (F12)
2. Ve a pestaña "Lighthouse"
3. Selecciona "Desktop" o "Mobile"
4. Haz clic en "Analyze page load"
5. Verifica scores:
   - [ ] Performance: >80
   - [ ] Accessibility: >90
   - [ ] Best Practices: >90
   - [ ] SEO: >90

---

### 8. **Verificar Links Externos**

Abre cada link en nueva pestaña y verifica que funcione:

- [ ] https://chile.iica.int/
- [ ] https://repositorio.iica.int/
- [ ] https://www.facebook.com/IICAChile
- [ ] https://twitter.com/IICAChile
- [ ] Links a bases oficiales de proyectos (INDAP, CORFO, etc.)

---

### 9. **Verificar SEO**

#### ✅ Metadatos
1. Ve a "View Page Source" (Ctrl+U)
2. Busca en el `<head>`:
   - [ ] `<title>` presente
   - [ ] `<meta name="description">` presente
   - [ ] `<meta property="og:title">` presente
   - [ ] `<meta property="og:description">` presente
   - [ ] `<link rel="manifest">` presente

#### ✅ Structured Data
- [ ] Busca `<script type="application/ld+json">`
- [ ] Debe contener información de la organización

---

### 10. **Verificar Accesibilidad**

#### ✅ Navegación por Teclado
- [ ] Presiona `Tab` repetidamente
- [ ] Todos los elementos interactivos deben ser alcanzables
- [ ] El foco debe ser visible

#### ✅ Contraste
- [ ] Texto legible sobre fondos
- [ ] Botones con suficiente contraste
- [ ] Links distinguibles

#### ✅ Alt Text
- [ ] Inspecciona imágenes
- [ ] Todas deben tener atributo `alt`

---

## 🐛 REPORTE DE BUGS

Si encuentras algún problema, anota:

1. **URL exacta:** ___________________________
2. **Navegador y versión:** ___________________________
3. **Dispositivo:** ___________________________
4. **Descripción del problema:** 
   ___________________________
   ___________________________
5. **Pasos para reproducir:**
   1. ___________________________
   2. ___________________________
   3. ___________________________
6. **Comportamiento esperado:** ___________________________
7. **Screenshot (si aplica):** Adjuntar

---

## ✅ CHECKLIST RÁPIDO

- [ ] Página principal carga correctamente
- [ ] Asistente de Perfilamiento funciona
- [ ] Lista de proyectos se muestra
- [ ] Filtros funcionan
- [ ] Calculadora de Elegibilidad se abre
- [ ] Mi Maletín carga
- [ ] Directorio de Consultores carga
- [ ] Navegación entre páginas funciona
- [ ] Footer tiene todos los links
- [ ] PWA se puede instalar
- [ ] Responsive en mobile
- [ ] Performance aceptable

---

## 🎉 RESULTADO ESPERADO

Si todos los checkboxes están marcados, la plataforma está funcionando **perfectamente** y lista para uso en producción.

**¡Felicidades!** 🚀

---

**Última actualización:** 30 Enero 2026, 14:10 PM
