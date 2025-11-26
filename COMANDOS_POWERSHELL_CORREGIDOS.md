# 🔧 COMANDOS CORREGIDOS PARA POWERSHELL

## ⚠️ PROBLEMA
PowerShell tiene problemas con rutas que tienen espacios y paréntesis como:
`C:\Users\Pasante\OneDrive - IICA (1)\Documentos\mi-plataforma2`

## ✅ SOLUCIÓN

### Opción 1: Usar comillas dobles (RECOMENDADO)

```powershell
# 1. Ir al proyecto (con comillas)
cd "C:\Users\Pasante\OneDrive - IICA (1)\Documentos\mi-plataforma2"

# 2. Verificar que estás en el directorio correcto
pwd

# 3. Ver estado de Git
git status

# 4. Agregar todos los cambios
git add .

# 5. Hacer commit
git commit -m "fix: Solución completa - Transferencia de datos y despliegue corregido"

# 6. Hacer push
git push origin main
```

### Opción 2: Usar comillas simples

```powershell
cd 'C:\Users\Pasante\OneDrive - IICA (1)\Documentos\mi-plataforma2'
```

### Opción 3: Escapar los caracteres especiales

```powershell
cd "C:\Users\Pasante\OneDrive` -` IICA` (`1`)\Documentos\mi-plataforma2"
```

## 🚀 COMANDOS COMPLETOS (COPIA Y PEGA)

```powershell
# Cambiar al directorio del proyecto
cd "C:\Users\Pasante\OneDrive - IICA (1)\Documentos\mi-plataforma2"

# Verificar ubicación
pwd

# Ver estado de Git
git status

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "fix: Solución completa - Transferencia de datos y despliegue"

# Hacer push
git push origin main
```

## 🔍 VERIFICACIÓN

Después de `cd`, ejecuta:
```powershell
pwd
```

Deberías ver:
```
C:\Users\Pasante\OneDrive - IICA (1)\Documentos\mi-plataforma2
```

Y después de `git status`, deberías ver los archivos modificados.

## ⚠️ SI SIGUE HABIENDO PROBLEMAS

### Problema: "not a git repository"
```powershell
cd "C:\Users\Pasante\OneDrive - IICA (1)\Documentos\mi-plataforma2"
git init
```

### Problema: "Please tell me who you are"
```powershell
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### Problema: "remote origin already exists" o no hay remoto
```powershell
# Ver remotos actuales
git remote -v

# Si no hay remoto, agregar uno (reemplaza con tu URL de GitHub)
git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
```

## 📝 NOTA IMPORTANTE

**SIEMPRE usa comillas dobles** alrededor de rutas con espacios:
- ✅ `cd "C:\Users\Pasante\OneDrive - IICA (1)\Documentos\mi-plataforma2"`
- ❌ `cd C:\Users\Pasante\OneDrive - IICA (1)\Documentos\mi-plataforma2`

