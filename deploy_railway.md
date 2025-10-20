# 🚂 DESPLEGAR EN RAILWAY.APP (GRATIS)

## 📋 **PASOS PARA HACER TU PÁGINA REAL:**

### **1. PREPARAR ARCHIVOS:**
```bash
# Crear requirements.txt
pip freeze > requirements.txt

# Crear railway.json
echo '{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "gunicorn app_working:app",
    "healthcheckPath": "/"
  }
}' > railway.json
```

### **2. SUBIR A GITHUB:**
1. Crea repositorio en GitHub
2. Sube todos los archivos

### **3. DESPLEGAR EN RAILWAY:**
1. Ve a https://railway.app
2. Regístrate con GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Selecciona tu repositorio
5. Railway detectará automáticamente que es Python

### **4. CONFIGURAR:**
- Railway detectará automáticamente `app_working.py`
- Generará un dominio como: `plataforma-iica-chile.railway.app`

### **5. ¡LISTO!**
Tu página estará disponible en el dominio generado

---

## 🎯 **VENTAJAS DE RAILWAY:**
- ✅ **Completamente GRATIS**
- ✅ **Detección automática**
- ✅ **Muy fácil de usar**
- ✅ **Despliegue instantáneo**
- ✅ **Base de datos incluida**

---

## 📱 **DOMINIO PERSONALIZADO:**
1. En Railway, ve a tu proyecto
2. Click en "Settings" → "Domains"
3. Agrega tu dominio personalizado
4. Configura DNS en tu proveedor
