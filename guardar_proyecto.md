# 💾 Guía para Guardar el Proyecto IICA

## 🚀 **OPCIÓN 1: GitHub (Recomendado)**

### Paso 1: Crear repositorio en GitHub
1. Ir a https://github.com
2. Hacer clic en "New repository"
3. Nombre: `plataforma-iica-chile`
4. Descripción: "Plataforma de búsqueda de proyectos de financiamiento IICA Chile"
5. Marcar "Public" o "Private"
6. **NO** marcar "Add README"
7. Hacer clic en "Create repository"

### Paso 2: Subir el proyecto
```bash
# En la carpeta del proyecto
git init
git add .
git commit -m "Primera versión de la Plataforma IICA Chile"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/plataforma-iica-chile.git
git push -u origin main
```

### Paso 3: Para continuar otro día
```bash
# Descargar cambios
git pull origin main

# Hacer cambios
# ... trabajar en el proyecto ...

# Guardar cambios
git add .
git commit -m "Descripción de los cambios"
git push origin main
```

## 📁 **OPCIÓN 2: Copia de Seguridad Local**

### Crear backup completo
```bash
# Crear carpeta de backup
mkdir "C:\Backup_IICA_$(Get-Date -Format 'yyyy-MM-dd')"

# Copiar todo el proyecto
xcopy "C:\Users\Pasante\OneDrive - IICA (1)\Documentos\mi-plataforma2" "C:\Backup_IICA_$(Get-Date -Format 'yyyy-MM-dd')\" /E /I /H /Y
```

### Para restaurar
```bash
# Copiar de vuelta cuando quieras continuar
xcopy "C:\Backup_IICA_2024-10-08\*" "C:\Users\Pasante\OneDrive - IICA (1)\Documentos\mi-plataforma2\" /E /I /H /Y
```

## ☁️ **OPCIÓN 3: OneDrive (Ya tienes esto)**

Tu proyecto ya está en OneDrive, así que:
- ✅ **Se guarda automáticamente**
- ✅ **Acceso desde cualquier dispositivo**
- ✅ **Sincronización automática**

### Para continuar:
1. Abrir OneDrive en cualquier computadora
2. Ir a la carpeta del proyecto
3. Continuar trabajando

## 🔧 **OPCIÓN 4: Crear Archivo de Configuración**

### Crear archivo de configuración
```bash
# Crear archivo de configuración
echo "Plataforma IICA Chile - Configuración" > config.txt
echo "Fecha de creación: $(Get-Date)" >> config.txt
echo "Versión: 1.0" >> config.txt
echo "Estado: Funcional" >> config.txt
echo "Puerto: 5000" >> config.txt
echo "URL: http://127.0.0.1:5000" >> config.txt
```

## 📋 **CHECKLIST PARA GUARDAR EL PROYECTO**

### ✅ **Antes de cerrar:**
- [ ] Verificar que la aplicación funciona
- [ ] Probar todas las rutas (/quienes-somos, /adjudicados)
- [ ] Guardar cambios en OneDrive
- [ ] Crear backup local (opcional)
- [ ] Documentar cambios realizados

### ✅ **Para continuar otro día:**
- [ ] Abrir OneDrive
- [ ] Navegar a la carpeta del proyecto
- [ ] Ejecutar: `python app_working.py`
- [ ] Verificar que funciona en http://127.0.0.1:5000

## 🎯 **RECOMENDACIÓN FINAL**

**Usa OneDrive + GitHub** para máxima seguridad:

1. **OneDrive**: Para trabajo diario y sincronización automática
2. **GitHub**: Para versionado y respaldo en la nube
3. **Backup local**: Para seguridad adicional

## 📝 **NOTAS IMPORTANTES**

- **Archivo principal**: `app_working.py` (el que funciona)
- **Templates**: `home_simple.html`, `quienes_somos.html`, `adjudicados.html`
- **Datos**: Se guardan en `data/proyectos.xlsx`
- **Puerto**: 5000 (http://127.0.0.1:5000)

## 🚀 **COMANDOS RÁPIDOS**

### Para iniciar el proyecto:
```bash
cd "C:\Users\Pasante\OneDrive - IICA (1)\Documentos\mi-plataforma2"
python app_working.py
```

### Para parar el proyecto:
```
Ctrl + C
```

### Para verificar que funciona:
```
Abrir navegador en: http://127.0.0.1:5000
```



