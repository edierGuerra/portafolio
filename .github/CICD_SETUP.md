# GitHub Actions CI/CD - Configuración de Secretos

Este documento explica cómo configurar GitHub Actions para despliegues automáticos a Staging y Producción.

## Estructura de flujo

```
Feature branch → Validación + Tests
Develop branch → Validación + Tests + Deploy Staging
Main branch    → Validación + Tests + Deploy Producción
```

## Requisitos previos

### 1. Servidor de Staging y Producción

Necesitas dos servidores (máquinas Linux con Docker):

- **Staging:** servidor-staging.ejemplo.com
- **Producción:** servidor-produccion.ejemplo.com

Cada servidor debe tener en su directorio `/app/portafolio`:
```bash
git clone https://github.com/tu-usuario/tu-repositorio.git
cd portafolio
```

### 2. Configurar llaves SSH para despliegue sin contraseña

En cada servidor, ejecuta:

```bash
# Crear usuario de despliegue (recomendado)
sudo useradd -m -s /bin/bash deploy
sudo usermod -aG docker deploy

# Generar llave SSH sin passphrase
ssh-keygen -t rsa -b 4096 -f ~/.ssh/deploy_key -N ""

# Copiar llave pública a authorized_keys
cat ~/.ssh/deploy_key.pub >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Mostrar llave privada (para copiar)
cat ~/.ssh/deploy_key
```

## Variables de entorno requeridas

Configura estas variables en **Settings → Secrets and variables → Actions**:

### Secretos comunes

| Variable | Valor | Ejemplo |
|----------|-------|---------|
| `SLACK_WEBHOOK` | Webhook de Slack (opcional) | `https://hooks.slack.com/services/T00000000/B00000000/XX` |

### Secretos para Staging

| Variable | Valor |
|----------|-------|
| `STAGING_DEPLOY_KEY` | Contenido de `~/.ssh/deploy_key` privada |
| `STAGING_DEPLOY_HOST` | Dominio o IP del servidor staging |
| `STAGING_DEPLOY_USER` | Usuario SSH (default: `deploy`) |

**Ejemplo:**
```bash
# Host
staging.ejemplo.com

# User
deploy

# Deploy Key (contenido completo del archivo privado)
-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEA...
...
-----END RSA PRIVATE KEY-----
```

### Secretos para Producción

| Variable | Valor |
|----------|-------|
| `PRODUCTION_DEPLOY_KEY` | Contenido de `~/.ssh/deploy_key` privada |
| `PRODUCTION_DEPLOY_HOST` | Dominio o IP del servidor producción |
| `PRODUCTION_DEPLOY_USER` | Usuario SSH (default: `deploy`) |

**Ejemplo:** Igual al de Staging pero valores de producción.

## Configurar secretos en GitHub

### Opción 1: vía GitHub Web UI

1. Ve a tu repositorio
2. **Settings → Secrets and variables → Actions**
3. Click en **New repository secret**
4. Nombre: `STAGING_DEPLOY_KEY`
5. Valor: (pega contenido completo de la llave privada)
6. Repite para cada secreto

### Opción 2: vía GitHub CLI

```bash
# Instalar GitHub CLI
# https://cli.github.com/

# Autenticarse
gh auth login

# Crear secretos
gh secret set STAGING_DEPLOY_KEY < ~/.ssh/staging_deploy_key
gh secret set STAGING_DEPLOY_HOST --body "staging.ejemplo.com"
gh secret set STAGING_DEPLOY_USER --body "deploy"

gh secret set PRODUCTION_DEPLOY_KEY < ~/.ssh/production_deploy_key
gh secret set PRODUCTION_DEPLOY_HOST --body "produccion.ejemplo.com"
gh secret set PRODUCTION_DEPLOY_USER --body "deploy"
```

## Proteger ramas

Para mayor seguridad, protege las ramas main y develop:

1. **Settings → Branches → Branch protection rules**
2. Crear regla para `main`:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass (`validate`, `build`, `test`)
   - ✅ Require branches to be up to date before merging
3. Repetir para `develop`

## Flujo de desarrollo

### Feature en rama feature/*

```bash
git checkout -b feature/nueva-funcionalidad
# ... haces cambios ...
git push origin feature/nueva-funcionalidad

# GitHub Actions ejecuta:
# 1. Validación (flake8, black, isort)
# 2. Build Docker
# 3. Tests
```

### Merge a develop → Staging automático

```bash
# Crear PR desde feature/* a develop
# Después de reviews y checks pasen:

git checkout develop
git merge --squash feature/nueva-funcionalidad
git push origin develop

# GitHub Actions ejecuta:
# 1. Validación ✅
# 2. Build Docker ✅
# 3. Tests ✅
# 4. Deploy a Staging 🚀
```

### Merge a main → Producción automática

```bash
# (Preferible hacer esto desde GitHub Web UI con release tags)

git checkout main
git merge --squash develop
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin main --tags

# GitHub Actions ejecuta:
# 1. Validación ✅
# 2. Build Docker ✅
# 3. Tests ✅
# 4. Deploy a Producción 🚀
```

## Troubleshooting

### El despliegue falla con "Permission denied"

- [ ] Verifica que la llave privada fue copiada **completa** (including `-----BEGIN` y `-----END`)
- [ ] Verifica permisos del archivo en el servidor: `chmod 600 ~/.ssh/authorized_keys`
- [ ] Prueba SSH manualmente: `ssh -i deploy_key deploy@servidor.com`

### El contenedor no inicia después del deploy

```bash
# En el servidor, ver logs:
docker compose logs -f

# Revisar estado:
docker ps
docker ps -a  # Ver contenedores parados
```

### GitHub Actions dice "Connection refused"

- [ ] El servidor está online y accesible
- [ ] El puerto SSH (22) está abierto
- [ ] La llave SSH está configurada correctamente
- [ ] El usuario tiene permisos docker: `groups deploy` debe incluir `docker`

## Monitoreo y alertas

### Integración con Slack

Si tienes Slack, puedes recibir notificaciones:

1. Crear webhook en tu workspace Slack:
   - https://api.slack.com/apps → Create App → From scratch
   - Incoming Webhooks → Add New Webhook to Workspace
   - Copiar URL del webhook

2. Agregar secreto `SLACK_WEBHOOK` con la URL

3. El pipeline notificará despliegues a un canal

### Dashboard de GitHub

Puedes ver el estado de todos los deploys en:
- **Actions** tab del repositorio
- **Deployments** tab (si configuraste `github.rest.repos.createDeployment`)

## Variables de entorno del pipeline

El fichero `.github/workflows/ci-cd.yml` soporte variables que puedes personalizar:

```yaml
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}
```

Si tienes Docker Hub registry diferente, actualiza `REGISTRY` y autenticación en el step `Log in to Container Registry`.

## Rollback automático (opcional)

Si un deploy falla en producción, puedes hacer rollback:

```bash
# En el servidor de producción
git reset --hard HEAD~1
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

O configurar un workflow adicional que escuche eventos de deployment failure.

## Próximos pasos

1. ✅ Crear servidores con Docker
2. ✅ Configurar llaves SSH
3. ✅ Agregar secretos a GitHub
4. ✅ Realizar un push a develop para probar Staging
5. ✅ Realizar un push a main para probar Producción
6. ⚠️ Estar pendiente de los logs en GitHub Actions
7. 🔒 Proteger ramas main y develop

