"""
Script de validacion de credenciales de DigitalOcean Spaces.
Uso:
    python verify_spaces.py
Requiere que el archivo .env este en el mismo directorio.
"""
import os
import sys
from pathlib import Path


def _load_env(filepath: Path) -> None:
    """Carga variables desde un archivo .env sin dependencias externas."""
    if not filepath.exists():
        print(f"[ERROR] No se encontro el archivo: {filepath}")
        sys.exit(1)
    with filepath.open(encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            os.environ.setdefault(key.strip(), value.strip())


def main() -> None:
    env_path = Path(__file__).parent / ".env"
    _load_env(env_path)

    endpoint   = os.getenv("DO_SPACES_ENDPOINT", "")
    region     = os.getenv("DO_SPACES_REGION", "")
    bucket     = os.getenv("DO_SPACES_BUCKET", "")
    access_key = os.getenv("DO_SPACES_KEY", "")
    secret_key = os.getenv("DO_SPACES_SECRET", "")

    # ── 1. Verificar que las variables esten definidas ──────────────────────
    missing = [name for name, val in [
        ("DO_SPACES_ENDPOINT", endpoint),
        ("DO_SPACES_REGION",   region),
        ("DO_SPACES_BUCKET",   bucket),
        ("DO_SPACES_KEY",      access_key),
        ("DO_SPACES_SECRET",   secret_key),
    ] if not val]

    if missing:
        print("[ERROR] Faltan las siguientes variables en .env:")
        for name in missing:
            print(f"  - {name}")
        sys.exit(1)

    print(f"  Endpoint : {endpoint}")
    print(f"  Region   : {region}")
    print(f"  Bucket   : {bucket}")
    print(f"  Key      : {access_key[:6]}{'*' * (len(access_key) - 6)}")
    print()

    # ── 2. Intentar conexion con boto3 ───────────────────────────────────────
    try:
        import boto3
        from botocore.config import Config
        from botocore.exceptions import ClientError, BotoCoreError
    except ImportError:
        print("[ERROR] boto3 no esta instalado. Ejecuta: pip install boto3")
        sys.exit(1)

    client = boto3.client(
        "s3",
        region_name=region,
        endpoint_url=endpoint,
        aws_access_key_id=access_key,
        aws_secret_access_key=secret_key,
        config=Config(signature_version="s3v4"),
    )

    # ── 3. Verificar que el bucket existe y es accesible ────────────────────
    print(f"Verificando acceso al bucket '{bucket}'...")
    try:
        client.head_bucket(Bucket=bucket)
        print(f"[OK] Bucket '{bucket}' encontrado y accesible.")
    except ClientError as exc:
        code = exc.response["Error"]["Code"]
        if code == "404":
            print(f"[ERROR] El bucket '{bucket}' no existe.")
        elif code in ("403", "AccessDenied"):
            print("[ERROR] Credenciales invalidas o sin permisos sobre el bucket.")
        else:
            print(f"[ERROR] ClientError ({code}): {exc}")
        sys.exit(1)
    except BotoCoreError as exc:
        print(f"[ERROR] No se pudo conectar al endpoint '{endpoint}': {exc}")
        sys.exit(1)

    # ── 4. Prueba de escritura: subir un objeto de prueba ───────────────────
    test_key = "portfolio/__verify_spaces_test__.txt"
    print(f"\nSubiendo objeto de prueba: {test_key} ...")
    try:
        client.put_object(
            Bucket=bucket,
            Key=test_key,
            Body=b"spaces_ok",
            ContentType="text/plain",
        )
        print("[OK] Escritura exitosa.")
    except (ClientError, BotoCoreError) as exc:
        print(f"[ERROR] No se pudo subir el archivo de prueba: {exc}")
        sys.exit(1)

    # ── 5. Leer el objeto subido ─────────────────────────────────────────────
    print(f"Leyendo objeto de prueba: {test_key} ...")
    try:
        resp = client.get_object(Bucket=bucket, Key=test_key)
        body = resp["Body"].read()
        assert body == b"spaces_ok", f"Contenido inesperado: {body}"
        print("[OK] Lectura exitosa.")
    except (ClientError, BotoCoreError) as exc:
        print(f"[ERROR] No se pudo leer el archivo de prueba: {exc}")
        sys.exit(1)

    # ── 6. Eliminar el objeto de prueba ──────────────────────────────────────
    print(f"Eliminando objeto de prueba: {test_key} ...")
    try:
        client.delete_object(Bucket=bucket, Key=test_key)
        print("[OK] Eliminacion exitosa.")
    except (ClientError, BotoCoreError) as exc:
        print(f"[ADVERTENCIA] No se pudo eliminar el objeto de prueba: {exc}")

    print("\n✓ Todas las verificaciones pasaron. Las credenciales son correctas.")


if __name__ == "__main__":
    main()
