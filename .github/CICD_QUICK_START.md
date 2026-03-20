# CI/CD Pipeline - Guía Rápida

## ¿Qué es que?

Este proyecto tiene **GitHub Actions configurado** para desplegar automáticamente según la rama que hagas push:

| Rama | Acción |
|------|--------|
| `feature/*` | ✅ Valida + Build + Test (no publica) |
| `develop` | ✅ Valida + Build + Test → 🚀 Deploy a **Staging** |
| `main` | ✅ Valida + Build + Test → 🚀 Deploy a **Producción** |

## Flujo normal de trabajo

```
1. git checkout -b feature/mi-cambio
   └─ [ Haces cambios ]
   
2. git push origin feature/mi-cambio
   └─ GitHub Actions: Valida + Build + Test
   
3. Abres PR a develop en GitHub
   └─ Code review y checks automáticos
   
4. Merge a develop
   └─ GitHub Actions: Valida + Build + Test + Deploy a Staging 🎯
   
5. Verificas en https://staging.tu-dominio.com ✨
   
6. Cuando esté listo, creas PR de develop → main
   └─ Code review final
   
7. Merge a main
   └─ GitHub Actions: Valida + Build + Test + Deploy a Producción 🚀
```

## Configuración mínima

### 1️⃣ Antes del primer push

Lee: [.github/CICD_SETUP.md](.github/CICD_SETUP.md)

Necesitas:
- Dos servidores con Docker (Staging y Producción)
- Llaves SSH configuradas
- Secretos en GitHub Actions

### 2️⃣ Crear secretos

Opción A (automática):
```bash
bash .github/setup-ci-cd-secrets.sh
```

Opción B (manual):
```bash
# Ver en Settings → Secrets and variables → Actions
# Agregar:
# - STAGING_DEPLOY_KEY
# - STAGING_DEPLOY_HOST
# - STAGING_DEPLOY_USER
# - PRODUCTION_DEPLOY_KEY
# - PRODUCTION_DEPLOY_HOST
# - PRODUCTION_DEPLOY_USER
```

### 3️⃣ Actualizar URLs

Actualiza en [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml):

```yaml
# Busca y reemplaza:
- staging.tu-dominio.com → TU URL DE STAGING
- tu-dominio.com → TU URL DE PRODUCCIÓN
```

### 4️⃣ Primer push

```bash
git push origin develop
```

Ve a **Actions** en GitHub y observa el despliegue en tiempo real.

## Monitoreo

**Durante el desarrollo:**
- GitHub Actions tab → Ver logs en vivo
- Deployments tab → Ver historial de despliegues

**Después del merge:**
- Verifica que la app esté funcionando en el servidor
- Revisa logs del contenedor: `docker compose logs -f`

## Troubleshooting rápido

**❌ SSH Permission Denied**
```bash
# En el servidor
chmod 600 ~/.ssh/authorized_keys
ssh-keyscan -t rsa $(hostname) >> ~/.ssh/known_hosts
```

**❌ Contenedor no inicia**
```bash
# En el servidor
docker compose logs
docker compose down -v  # Reinicia todo
docker compose up -d
```

**❌ API no conecta a BD**
```bash
# Verifica que la BD está healthy
docker compose exec db mysqladmin ping -h localhost -uroot -proot
```

## Variables de entorno por entorno

El pipeline automáticamente usa:
- `.env.development.example` para feature branches
- `.env.staging.example` para develop branch
- `.env.production.example` para main branch

El servidor realiza automáticamente:
```bash
cp .env.xxx.example .env
```

Puedes agregar un archivo `.env.prod.secrets` para mantener secretos sensibles.

## Control de calidad

Cada rama chequea automáticamente:
1. **Linting** (flake8, black para Python; ESLint para JS)
2. **Build** (Docker images)
3. **Tests** (pytest para backend, jest para frontend)
4. **Deploy** (solo si todo pasa)

No se puede hacer merge a main/develop sin que pasen los checks.

## Preguntas frecuentes

**¿Puedo desplegar manualmente sin cambiar código?**
- No es recomendado. Usa un tag: `git tag v1.0.0 && git push --tags`

**¿Cómo hago rollback?**
```bash
git revert <commit>
git push origin main  # Automáticamente redeploy
```

**¿Cómo agrego notificaciones a Slack?**
1. Ve a: https://api.slack.com/apps → Create App
2. Incoming Webhooks → Add Webhook
3. Agrega el webhook como secreto `SLACK_WEBHOOK`

**¿Por qué falló el deploy de Staging?**
- Ve a Actions → Ver el job que falló
- Busca por "Permission denied" o errores de conexión SSH

---

**Para configuración completa**, ve a: [.github/CICD_SETUP.md](.github/CICD_SETUP.md)
