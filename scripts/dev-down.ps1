$ErrorActionPreference = 'Stop'

Set-Location (Join-Path $PSScriptRoot '..')

$baseArgs = @(
  '--project-name', 'portafolio_dev',
  '--env-file', '.env.development.example',
  '-f', 'docker-compose.yml',
  '-f', 'docker-compose.dev.yml'
)

docker compose @baseArgs down
