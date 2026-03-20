#!/bin/bash
# Script para facilitar la configuración de secretos en GitHub Actions
# Uso: ./setup-ci-cd-secrets.sh

set -e

echo "🔧 GitHub Actions CI/CD - Configurador de Secretos"
echo "================================================================="
echo ""

# Verificar si gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI no está instalado."
    echo "Instálalo desde: https://cli.github.com/"
    exit 1
fi

# Verificar autenticación
if ! gh auth status &> /dev/null; then
    echo "❌ No estás autenticado con GitHub CLI."
    echo "Ejecuta: gh auth login"
    exit 1
fi

echo "Configurando secretos para el repositorio..."
echo ""

# Leer valores interactivamente
read -p "🔐 Introduce la ruta de la llave SSH privada de Staging (ej: ~/.ssh/staging_key): " STAGING_KEY_PATH
read -p "🌐 Host de Staging (ej: staging.ejemplo.com): " STAGING_HOST
read -p "👤 Usuario SSH de Staging [deploy]: " STAGING_USER
STAGING_USER=${STAGING_USER:-deploy}

read -p "🔐 Introduce la ruta de la llave SSH privada de Producción (ej: ~/.ssh/prod_key): " PROD_KEY_PATH
read -p "🌐 Host de Producción (ej: produccion.ejemplo.com): " PROD_HOST
read -p "👤 Usuario SSH de Producción [deploy]: " PROD_USER
PROD_USER=${PROD_USER:-deploy}

read -p "💬 URL del webhook de Slack (opcional, deja vacío para saltar): " SLACK_WEBHOOK

echo ""
echo "📝 Resumen:"
echo "  Staging Key: $STAGING_KEY_PATH"
echo "  Staging Host: $STAGING_HOST @ $STAGING_USER"
echo "  Production Key: $PROD_KEY_PATH"
echo "  Production Host: $PROD_HOST @ $PROD_USER"
echo "  Slack Webhook: ${SLACK_WEBHOOK:-[No configurado]}"
echo ""

read -p "¿Continuar? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Abortado."
    exit 1
fi

echo ""
echo "🔄 Creando secretos..."

# Validar que los archivos existen
if [ ! -f "$STAGING_KEY_PATH" ]; then
    echo "❌ No se encontró: $STAGING_KEY_PATH"
    exit 1
fi

if [ ! -f "$PROD_KEY_PATH" ]; then
    echo "❌ No se encontró: $PROD_KEY_PATH"
    exit 1
fi

# Crear secretos
gh secret set STAGING_DEPLOY_KEY < "$STAGING_KEY_PATH"
echo "✅ STAGING_DEPLOY_KEY"

gh secret set STAGING_DEPLOY_HOST --body "$STAGING_HOST"
echo "✅ STAGING_DEPLOY_HOST"

gh secret set STAGING_DEPLOY_USER --body "$STAGING_USER"
echo "✅ STAGING_DEPLOY_USER"

gh secret set PRODUCTION_DEPLOY_KEY < "$PROD_KEY_PATH"
echo "✅ PRODUCTION_DEPLOY_KEY"

gh secret set PRODUCTION_DEPLOY_HOST --body "$PROD_HOST"
echo "✅ PRODUCTION_DEPLOY_HOST"

gh secret set PRODUCTION_DEPLOY_USER --body "$PROD_USER"
echo "✅ PRODUCTION_DEPLOY_USER"

if [ ! -z "$SLACK_WEBHOOK" ]; then
    gh secret set SLACK_WEBHOOK --body "$SLACK_WEBHOOK"
    echo "✅ SLACK_WEBHOOK"
fi

echo ""
echo "✨ ¡Secretos configurados exitosamente!"
echo ""
echo "📚 Próximos pasos:"
echo "  1. Actualiza las URLs en .github/workflows/ci-cd.yml:"
echo "     - Reemplaza 'tu-dominio.com' con tu dominio real"
echo "     - Reemplaza 'staging.tu-dominio.com' con tu dominio staging"
echo ""
echo "  2. Haz un push a develop para probar el despliegue a Staging:"
echo "     git push origin develop"
echo ""
echo "  3. Monitorea el deployment en: Settings → Deployments"
echo ""
