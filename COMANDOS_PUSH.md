# 📤 COMANDOS PARA HACER PUSH - COPIA Y PEGA

## 🚀 COMANDOS RÁPIDOS (COPIA Y PEGA TODO)

Abre PowerShell o Terminal y ejecuta estos comandos uno por uno:

```powershell
# 1. Ir al proyecto
cd "C:\Users\Pasante\OneDrive - IICA (1)\Documentos\mi-plataforma2"

# 2. Ver qué cambió
git status

# 3. Agregar todos los cambios
git add .

# 4. Guardar cambios (commit)
git commit -m "fix: Solución completa - Transferencia de datos y despliegue corregido"

# 5. Subir a GitHub (push)
git push origin main
```

## ⚠️ SI HAY ERRORES

### Error: "not a git repository"
```powershell
git init
```

### Error: "Please tell me who you are"
```powershell
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### Error: "remote origin already exists"
```powershell
# Ver el remoto actual
git remote -v

# Si está mal, cambiarlo (reemplaza con tu URL)
git remote set-url origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
```

### Error: "authentication failed"
1. Ve a: https://github.com/settings/tokens
2. Crea un "Personal Access Token"
3. Úsalo como contraseña cuando Git te la pida

## ✅ DESPUÉS DEL PUSH

1. Ve a: https://dashboard.render.com
2. Selecciona "plataforma-iica-proyectos"
3. Verifica que aparezca "New commit detected"
4. Espera 2-5 minutos
5. Verifica el sitio: https://iica-chile-plataforma.onrender.com/

## 🎯 VERIFICACIÓN

Después del despliegue, el sitio debe mostrar:
- ✅ MÁS de 16 proyectos
- ✅ Filtros funcionando
- ✅ Diseño mejorado
- ✅ Paginación configurable

