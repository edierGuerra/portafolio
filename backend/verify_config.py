#!/usr/bin/env python
"""Script de verificación del sistema de configuración y base de datos."""
import asyncio
from main import app, config
from sqlalchemy import text

async def verify_setup():
    from config.database_config import engine
    
    print('✅ VERIFICACIÓN DEL SISTEMA')
    print('=' * 60)
    print(f'📋 Aplicación: {config.app.name} v{config.app.version}')
    print(f'🌍 Ambiente: {config.app.environment.value}')
    print(f'🔐 Debug: {config.app.debug}')
    print()
    print(f'💾 Base de Datos:')
    db_host = config.database.database_url.split('@')[1] if '@' in config.database.database_url else 'unknown'
    print(f'   URL: {db_host}')
    print(f'   Configurada: {config.database.is_fully_configured()}')
    
    try:
        async with engine.begin() as conn:
            result = await conn.execute(text('SELECT 1'))
            result.scalar()
        print(f'   Status: ✅ Conectada')
    except Exception as e:
        print(f'   Status: ❌ Error - {str(e)[:50]}')
    
    print()
    print(f'🌐 CORS Origins: {len(config.app.cors_origins)} origen(es)')
    for origin in config.app.cors_origins:
        print(f'   - {origin}')
    
    print()
    print(f'🔌 Servicios:')
    storage_status = '✅ Configurado' if config.storage.is_configured else '⚠️  Sin configurar'
    email_status = '✅ Habilitado' if config.email.enabled else '⚠️  Deshabilitado'
    print(f'   Storage: {storage_status}')
    print(f'   Email: {email_status}')
    
    print()
    print('✅ Sistema listo para usar')

asyncio.run(verify_setup())
