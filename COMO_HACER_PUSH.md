# 📤 CÓMO HACER PUSH A GIT Y DESPLEGAR EN RENDER

## 🎯 OBJETIVO
Subir tus cambios locales a GitHub para que Render los detecte y despliegue automáticamente.

---

## 📋 PASO A PASO COMPLETO

### **PASO 1: Abrir Terminal/PowerShell**

En Windows:
- Presiona `Windows + X`
- Selecciona "Windows PowerShell" o "Terminal"
- O busca "PowerShell" en el menú inicio

### **PASO 2: Navegar a tu Proyecto**

```powershell
# Cambiar al directorio del proyecto
cd "C:\Users\Pasante\OneDrive - IICA (1)\Documentos\mi-plataforma2"
```

### **PASO 3: Verificar Estado de Git**

```powershell
# Ver qué archivos cambiaron
git status
```

Deberías ver archivos en rojo (sin agregar) o verde (agregados pero sin commit).

### **PASO 4: Agregar Archivos al Repositorio**

```powershell
# Opción 1: Agregar archivos específicos importantes
git add app_enhanced.py
git add templates/home_ordenado_mejorado.html
git add render.yaml
git add wsgi.py
git add requirements.txt

# Opción 2: Agregar TODOS los archivos modificados (más fácil)
git add .
```

### **PASO 5: Hacer Commit (Guardar Cambios Localmente)**

```powershell
git commit -m "fix: Corregir despliegue - Mostrar todos los proyectos con mejoras

- Corregida lógica: filtros antes de paginación
- Template actualizado a home_ordenado_mejorado.html
- Eliminados límites de proyectos (ahora muestra TODOS)
- Filtros mejorados (búsqueda, área, fuente, estado)
- Paginación configurable (20 por defecto)
- Diseño institucional IICA completo"
```

### **PASO 6: Verificar Remoto (Primera Vez)**

```powershell
# Ver si tienes un repositorio remoto configurado
git remote -v
```

**Si NO aparece nada**, necesitas conectar tu repositorio local con GitHub:

```powershell
# Reemplaza TU_USUARIO y TU_REPOSITORIO con los tuyos
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
```

### **PASO 7: Hacer Push (Subir a GitHub)**

```powershell
# Subir cambios a GitHub
git push origin main
```

**Si tu rama se llama "master" en lugar de "main":**
```powershell
git push origin master
```

**Si es la primera vez y te pide autenticación:**
- GitHub ahora requiere un Personal Access Token
- Ve a: https://github.com/settings/tokens
- Crea un nuevo token con permisos de "repo"
- Úsalo como contraseña cuando Git te la pida

### **PASO 8: Verificar en Render**

1. **Ir a Render Dashboard**: https://dashboard.render.com
2. **Seleccionar tu servicio**: "plataforma-iica-proyectos"
3. **Verificar que aparezca**: "New commit detected" o similar
4. **El build debería iniciarse automáticamente**
5. **Esperar 2-5 minutos** para que complete
6. **Revisar logs** si hay errores

### **PASO 9: Verificar el Sitio**

Después de 2-5 minutos, ir a:
**https://iica-chile-plataforma.onrender.com/**

**Verificar que:**
- ✅ Muestra MÁS de 16 proyectos
- ✅ Tiene filtros mejorados
- ✅ Tiene paginación
- ✅ Diseño institucional visible

---

## 🔧 SOLUCIÓN DE PROBLEMAS

### **Error: "fatal: not a git repository"**
```powershell
# Inicializar Git (solo primera vez)
git init
```

### **Error: "Please tell me who you are"**
```powershell
# Configurar tu nombre y email (solo primera vez)
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### **Error: "remote origin already exists"**
```powershell
# Ver el remoto actual
git remote -v

# Si está mal, cambiarlo
git remote set-url origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
```

### **Error al hacer push: "authentication failed"**
1. Ve a: https://github.com/settings/tokens
2. Crea un nuevo "Personal Access Token"
3. Úsalo como contraseña cuando Git te la pida

### **Render no detecta cambios**
1. Verificar en Render Dashboard → Logs
2. Verificar que el commit esté en GitHub
3. Hacer "Manual Deploy" en Render Dashboard

---

## ✅ CHECKLIST RÁPIDO

Antes de hacer push, verifica:

- [ ] `app_enhanced.py` está modificado y guardado
- [ ] `templates/home_ordenado_mejorado.html` existe
- [ ] `render.yaml` está correcto
- [ ] Cambios guardados en los archivos
- [ ] Terminal abierta en el directorio correcto

Después de hacer push:

- [ ] `git status` muestra "nothing to commit"
- [ ] `git push` fue exitoso
- [ ] Render Dashboard muestra nuevo build
- [ ] El sitio muestra los cambios

---

## 🎯 COMANDOS RÁPIDOS (COPIA Y PEGA)

```powershell
# 1. Ir al proyecto
cd "C:\Users\Pasante\OneDrive - IICA (1)\Documentos\mi-plataforma2"

# 2. Ver estado
git status

# 3. Agregar todo
git add .

# 4. Hacer commit
git commit -m "fix: Actualizar con todas las mejoras"

# 5. Hacer push
git push origin main
```

---

## 📝 NOTAS IMPORTANTES

1. **Render detecta automáticamente** los cambios cuando haces push a `main` o `master`
2. **El build tarda 2-5 minutos** en completarse
3. **Los cambios se ven inmediatamente** después del build exitoso
4. **Si no ves cambios**, verifica los logs en Render Dashboard

---

**¡Listo! Después de estos pasos, tus cambios deberían estar desplegados en Render.** 🚀

