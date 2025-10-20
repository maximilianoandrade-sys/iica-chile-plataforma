# 🚀 DESPLEGAR EN RENDER.COM (GRATIS)

## 📋 **PASOS PARA HACER TU PÁGINA REAL:**

### **1. PREPARAR EL PROYECTO:**
```bash
# Crear archivo requirements.txt
pip freeze > requirements.txt

# Crear archivo de configuración
echo "web: gunicorn app_working:app" > Procfile
```

### **2. SUBIR A GITHUB:**
1. Ve a https://github.com
2. Crea una cuenta (si no tienes)
3. Crea un nuevo repositorio llamado "plataforma-iica-chile"
4. Sube todos los archivos de tu proyecto

### **3. DESPLEGAR EN RENDER:**
1. Ve a https://render.com
2. Regístrate con tu cuenta de GitHub
3. Click en "New +" → "Web Service"
4. Conecta tu repositorio de GitHub
5. Configuración:
   - **Name**: plataforma-iica-chile
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app_working:app`
   - **Plan**: Free

### **4. CONFIGURAR VARIABLES:**
- En Render, ve a tu servicio
- Click en "Environment"
- Agrega: `FLASK_ENV=production`

### **5. ¡LISTO!**
Tu página estará disponible en: `https://plataforma-iica-chile.onrender.com`

---

## 🎯 **VENTAJAS DE RENDER:**
- ✅ **Completamente GRATIS**
- ✅ **Fácil de usar**
- ✅ **Despliegue automático**
- ✅ **Dominio personalizado disponible**
- ✅ **SSL automático**

---

## 📱 **DOMINIO PERSONALIZADO:**
1. Compra un dominio (ej: `iica-chile.com`)
2. En Render, ve a "Settings" → "Custom Domains"
3. Agrega tu dominio
4. Configura los DNS en tu proveedor de dominio

---

## 🔧 **ARCHIVOS NECESARIOS:**
- `requirements.txt` - Dependencias
- `Procfile` - Comando de inicio
- `app_working.py` - Aplicación principal
- `templates/` - Páginas HTML
- `data/` - Datos de proyectos
