#!/bin/bash

# Script de despliegue automatizado para la Plataforma IICA
# Uso: ./deploy.sh [development|production]

set -e

ENVIRONMENT=${1:-development}
PROJECT_NAME="plataforma-iica"
DOMAIN=${2:-"proyectos-iica.cl"}

echo "🚀 Iniciando despliegue en modo: $ENVIRONMENT"
echo "🌐 Dominio: $DOMAIN"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar dependencias
check_dependencies() {
    print_status "Verificando dependencias..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker no está instalado"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose no está instalado"
        exit 1
    fi
    
    print_success "Dependencias verificadas"
}

# Configurar variables de entorno
setup_environment() {
    print_status "Configurando variables de entorno..."
    
    cat > .env << EOF
# Configuración de la aplicación
FLASK_ENV=$ENVIRONMENT
SECRET_KEY=$(openssl rand -hex 32)
DATABASE_URL=postgresql://postgres:password@db:5432/plataforma

# Configuración de email
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-password

# Configuración del dominio
DOMAIN=$DOMAIN
SSL_EMAIL=admin@$DOMAIN

# Configuración de Redis
REDIS_URL=redis://redis:6379/0
EOF
    
    print_success "Variables de entorno configuradas"
}

# Construir y desplegar
deploy() {
    print_status "Construyendo imagen Docker..."
    docker-compose build
    
    print_status "Deteniendo servicios existentes..."
    docker-compose down
    
    print_status "Iniciando servicios..."
    docker-compose up -d
    
    print_status "Esperando a que los servicios estén listos..."
    sleep 30
    
    print_status "Ejecutando migraciones de base de datos..."
    docker-compose exec web python -c "
from app_new import app, db
with app.app_context():
    db.create_all()
    print('Base de datos inicializada')
"
    
    print_success "Despliegue completado"
}

# Configurar SSL con Let's Encrypt
setup_ssl() {
    if [ "$ENVIRONMENT" = "production" ]; then
        print_status "Configurando SSL con Let's Encrypt..."
        
        # Crear directorio para certificados
        mkdir -p ssl
        
        # Generar certificados autofirmados para desarrollo
        if [ ! -f ssl/cert.pem ]; then
            openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=CL/ST=Chile/L=Santiago/O=IICA/CN=$DOMAIN"
        fi
        
        print_success "SSL configurado"
    fi
}

# Verificar salud del sistema
health_check() {
    print_status "Verificando salud del sistema..."
    
    # Esperar a que la aplicación esté lista
    for i in {1..30}; do
        if curl -f http://localhost:5000/ > /dev/null 2>&1; then
            print_success "Aplicación funcionando correctamente"
            return 0
        fi
        print_status "Esperando... ($i/30)"
        sleep 10
    done
    
    print_error "La aplicación no está respondiendo"
    return 1
}

# Mostrar información del despliegue
show_info() {
    print_success "🎉 Despliegue completado exitosamente!"
    echo ""
    echo "📋 Información del despliegue:"
    echo "   🌐 URL: http://localhost:5000"
    echo "   🔧 Modo: $ENVIRONMENT"
    echo "   📊 Admin: http://localhost:5000/admin"
    echo "   📧 Login: admin/admin123"
    echo ""
    echo "📝 Comandos útiles:"
    echo "   Ver logs: docker-compose logs -f"
    echo "   Detener: docker-compose down"
    echo "   Reiniciar: docker-compose restart"
    echo ""
    echo "🔧 Para producción:"
    echo "   1. Configurar dominio en DNS"
    echo "   2. Configurar email en .env"
    echo "   3. Configurar SSL real"
    echo "   4. Configurar backup de base de datos"
}

# Función principal
main() {
    print_status "🚀 Iniciando despliegue de la Plataforma IICA"
    
    check_dependencies
    setup_environment
    setup_ssl
    deploy
    
    if health_check; then
        show_info
    else
        print_error "El despliegue falló. Revisa los logs con: docker-compose logs"
        exit 1
    fi
}

# Ejecutar función principal
main "$@"
