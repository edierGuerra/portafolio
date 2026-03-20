#!/bin/bash
# Script de verificación previa para CI/CD
# Uso: ./verify-ci-cd-setup.sh

set -e

echo "🔍 GitHub Actions CI/CD - Verificador de Configuración"
echo "================================================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅${NC} $1"
    else
        echo -e "${RED}❌${NC} $1"
        return 1
    fi
}

warn() {
    echo -e "${YELLOW}⚠️${NC} $1"
}

# Verificaciones
echo "📋 Verificando configuración..."
echo ""

# 1. CI/CD workflow existe
if [ -f ".github/workflows/ci-cd.yml" ]; then
    echo -e "${GREEN}✅${NC} Workflow CI/CD encontrado: .github/workflows/ci-cd.yml"
else
    echo -e "${RED}❌${NC} Workflow CI/CD no encontrado"
fi

# 2. Documentación
if [ -f ".github/CICD_SETUP.md" ]; then
    echo -e "${GREEN}✅${NC} Documentación de configuración: .github/CICD_SETUP.md"
else
    echo -e "${RED}❌${NC} Falta documentación"
fi

# 3. Variables de entorno por rama
echo ""
echo "🌿 Verificando variables de entorno..."

for file in .env.development.example .env.staging.example .env.production.example backend/.env.development.example backend/.env.staging.example backend/.env.production.example; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${YELLOW}⚠️${NC} Falta: $file"
    fi
done

# 4. Docker compose files
echo ""
echo "🐳 Verificando Docker Compose..."

for file in docker-compose.yml docker-compose.dev.yml docker-compose.staging.yml docker-compose.prod.yml; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${YELLOW}⚠️${NC} Falta: $file"
    fi
done

# 5. Backend y frontend Dockerfile
echo ""
echo "📦 Verificando Dockerfiles..."

[ -f "backend/Dockerfile" ] && echo -e "${GREEN}✅${NC} backend/Dockerfile" || echo -e "${RED}❌${NC} Falta backend/Dockerfile"
[ -f "frontend/Dockerfile" ] && echo -e "${GREEN}✅${NC} frontend/Dockerfile" || echo -e "${RED}❌${NC} Falta frontend/Dockerfile"

# 6. Python dependencies
echo ""
echo "🔧 Verificando dependencias..."

if [ -f "backend/requirements.txt" ]; then
    echo -e "${GREEN}✅${NC} backend/requirements.txt encontrado"
    if grep -q "pytest" backend/requirements.txt; then
        echo -e "${YELLOW}ℹ️${NC}  pytest no encontrado - agrega para testing"
    fi
else
    echo -e "${RED}❌${NC} Falta backend/requirements.txt"
fi

if [ -f "frontend/package.json" ]; then
    echo -e "${GREEN}✅${NC} frontend/package.json encontrado"
else
    echo -e "${RED}❌${NC} Falta frontend/package.json"
fi

# 7. Git branches
echo ""
echo "🔀 Verificando ramas Git..."

if git branch | grep -q "main"; then
    echo -e "${GREEN}✅${NC} Rama 'main' existe"
else
    warn "Rama 'main' no existe (puede estar en otro nombre como 'master')"
fi

if git branch | grep -q "develop"; then
    echo -e "${GREEN}✅${NC} Rama 'develop' existe"
else
    warn "Rama 'develop' no existe (crearla con: git checkout -b develop && git push -u origin develop)"
fi

# 8. GitHub CLI
echo ""
echo "🌐 Verificando GitHub CLI..."

if command -v gh &> /dev/null; then
    if gh auth status &> /dev/null; then
        echo -e "${GREEN}✅${NC} GitHub CLI autenticado"
    else
        warn "GitHub CLI instalado pero no autenticado (ejecuta: gh auth login)"
    fi
else
    warn "GitHub CLI no instalado (descargarlo de: https://cli.github.com/)"
fi

# 9. Verificar secretos (si estamos autenticados)
if command -v gh &> /dev/null && gh auth status &> /dev/null 2>&1; then
    echo ""
    echo "🔐 Verificando secretos en GitHub..."
    
    secrets=$(gh secret list 2>/dev/null || echo "")
    
    if echo "$secrets" | grep -q "STAGING_DEPLOY_KEY"; then
        echo -e "${GREEN}✅${NC} STAGING_DEPLOY_KEY configurado"
    else
        warn "STAGING_DEPLOY_KEY no configurado"
    fi
    
    if echo "$secrets" | grep -q "PRODUCTION_DEPLOY_KEY"; then
        echo -e "${GREEN}✅${NC} PRODUCTION_DEPLOY_KEY configurado"
    else
        warn "PRODUCTION_DEPLOY_KEY no configurado"
    fi
fi

# Resumen
echo ""
echo "================================================================="
echo "📋 Resumen de configuración"
echo "================================================================="
echo ""
echo "Para completar la configuración:"
echo ""
echo "1. Lee: .github/CICD_QUICK_START.md"
echo "   └─ Resumen rápido del flujo"
echo ""
echo "2. Lee: .github/CICD_SETUP.md"
echo "   └─ Instrucciones detalladas"
echo ""
echo "3. Configura secretos:"
echo "   └─ bash .github/setup-ci-cd-secrets.sh"
echo ""
echo "4. Actualiza URLs en: .github/workflows/ci-cd.yml"
echo "   └─ Busca 'tu-dominio.com' y reemplaza"
echo ""
echo "5. Haz push a develop para probar:"
echo "   └─ git push origin develop"
echo ""
echo "✨ ¡Listo para CI/CD!"
echo ""
