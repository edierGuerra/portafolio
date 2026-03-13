# Requerimientos Funcionales del Proyecto Portafolio

Este documento lista los requerimientos funcionales del sistema, derivados del análisis del frontend y alineados con los modelos definidos en backend.

## 1. Alcance funcional

El sistema debe cubrir dos frentes:

1. Sitio público de portafolio (frontend).
2. Gestión de contenido (CMS/API) para administrar la información que se muestra en el sitio.

## 2. Requerimientos funcionales del sitio público (frontend)

### 2.1 Navegación y estructura general

1. RF-001: El sistema debe mostrar una aplicación de una sola página con secciones: Inicio, Sobre mí, Proyectos, Blog y Contacto.
2. RF-002: El usuario debe poder cambiar de sección desde navegación de escritorio.
3. RF-003: El usuario debe poder abrir y cerrar menú de navegación móvil.
4. RF-004: Al seleccionar una opción del menú móvil, el sistema debe cerrar el panel lateral automáticamente.
5. RF-005: El sistema debe resaltar visualmente la sección activa en la navegación.

### 2.2 Tema y preferencias de usuario

1. RF-006: El sistema debe permitir alternar entre modo claro y modo oscuro.
2. RF-007: El sistema debe persistir la preferencia de tema en almacenamiento local del navegador.
3. RF-008: En primera carga, si no hay preferencia guardada, el sistema debe respetar la preferencia del sistema operativo.

### 2.3 Cabecera y acciones globales

1. RF-009: El sistema debe mostrar cabecera fija en la parte superior.
2. RF-010: El sistema debe incluir selector de idioma (Español/Inglés) en la cabecera.
3. RF-011: El sistema debe incluir acción para descarga de CV.

### 2.4 Sección Inicio

1. RF-012: El sistema debe mostrar datos de perfil profesional: nombre, rol, ubicación, resumen profesional y foto.
2. RF-013: El sistema debe mostrar un listado de habilidades principales como etiquetas.
3. RF-014: El sistema debe incluir llamados a la acción para ver proyectos y contactar.
4. RF-015: El sistema debe mostrar estado de disponibilidad para proyectos.

### 2.5 Sección Sobre mí

1. RF-016: El sistema debe mostrar línea de tiempo de experiencia profesional.
2. RF-017: El sistema debe mostrar habilidades técnicas con nivel porcentual.
3. RF-018: El sistema debe mostrar filosofía profesional.
4. RF-019: El sistema debe mostrar logros destacados.
5. RF-020: El sistema debe mostrar intereses personales/profesionales.

### 2.6 Sección Proyectos

1. RF-021: El sistema debe listar proyectos destacados y no destacados.
2. RF-022: El sistema debe mostrar por proyecto: título, descripción, imagen, tecnologías, estado, año y tamaño de equipo.
3. RF-023: El sistema debe mostrar estado del proyecto (por ejemplo En desarrollo o Completado) con estilo visual diferenciado.
4. RF-024: El sistema debe permitir acceder a demo y repositorio de cada proyecto.
5. RF-025: El sistema debe presentar proyectos destacados en formato de mayor jerarquía visual.

### 2.7 Sección Blog

1. RF-026: El sistema debe listar artículos destacados y artículos generales.
2. RF-027: El sistema debe mostrar por artículo: título, resumen, imagen, categoría y fecha.
3. RF-028: El sistema debe mostrar tiempo estimado de lectura por artículo.
4. RF-029: El sistema debe permitir filtrar visualmente por categorías de blog.
5. RF-030: El sistema debe incluir acción para leer más y acción de guardado/marcador.

### 2.8 Sección Contacto

1. RF-031: El sistema debe mostrar información de contacto: correo, teléfono, ubicación y disponibilidad.
2. RF-032: El sistema debe mostrar servicios profesionales disponibles.
3. RF-033: El sistema debe proporcionar formulario de contacto con campos de nombre, correo, empresa (opcional), presupuesto, asunto y mensaje.
4. RF-034: El sistema debe permitir envío del formulario de contacto.
5. RF-035: El sistema debe mostrar sección de preguntas frecuentes.
6. RF-036: El sistema debe ofrecer acción para programar llamada.

### 2.9 Enlaces externos

1. RF-037: El sistema debe mostrar enlaces a redes sociales profesionales.
2. RF-038: Los enlaces externos deben abrir en nueva pestaña de forma segura.

### 2.10 Responsividad y experiencia

1. RF-039: El sistema debe adaptarse a móvil, tablet y escritorio.
2. RF-040: El sistema debe mantener legibilidad y jerarquía visual en todos los tamaños de pantalla.
3. RF-041: El sistema debe incluir transiciones visuales suaves en interacciones principales.

## 3. Requerimientos funcionales de gestión de datos (alineados a modelos backend)

Los siguientes requerimientos están trazados a los modelos SQLAlchemy existentes y deben exponerse por API/CMS para que el frontend pueda consumir contenido dinámico.

### 3.1 Administración de usuario y perfil

1. RF-042: El sistema debe permitir crear, consultar, actualizar y eliminar usuario administrador.
2. RF-043: El sistema debe almacenar credenciales de acceso del administrador.
3. RF-044: El sistema debe administrar datos de perfil público: nombre, perfil profesional, descripción, imagen y ubicación.

Modelos asociados: User.

### 3.2 Logros

1. RF-045: El sistema debe permitir CRUD de logros profesionales.
2. RF-046: Cada logro debe contener título y subtítulo.

Modelos asociados: Achievement.

### 3.3 Servicios disponibles

1. RF-047: El sistema debe permitir CRUD de servicios profesionales ofrecidos.

Modelos asociados: AvailableService.

### 3.4 Categorías y publicaciones de blog

1. RF-048: El sistema debe permitir CRUD de categorías de blog.
2. RF-049: El sistema debe permitir CRUD de publicaciones de blog.
3. RF-050: Cada publicación debe estar asociada obligatoriamente a una categoría válida.
4. RF-051: Cada publicación debe almacenar título, descripción, imagen y fecha de publicación.

Modelos asociados: BlogCategory, Blog.

### 3.5 Información de contacto

1. RF-052: El sistema debe permitir CRUD de información de contacto.
2. RF-053: La información de contacto debe incluir correo, teléfono, ubicación y disponibilidad.

Modelos asociados: ContactInfo.

### 3.6 Experiencia profesional

1. RF-054: El sistema debe permitir CRUD de experiencias laborales.
2. RF-055: Cada experiencia debe incluir cargo, empresa, fecha de inicio y fecha de fin.

Modelos asociados: Experience.

### 3.7 Preguntas frecuentes

1. RF-056: El sistema debe permitir CRUD de preguntas frecuentes.
2. RF-057: Cada registro debe incluir pregunta y respuesta.

Modelos asociados: FrequentlyAskedQuestion.

### 3.8 Intereses

1. RF-058: El sistema debe permitir CRUD de intereses.

Modelos asociados: Interests.

### 3.9 Filosofía profesional

1. RF-059: El sistema debe permitir CRUD del bloque de filosofía profesional.
2. RF-060: Este bloque debe incluir texto de filosofía e imagen de apoyo.

Modelos asociados: MyPhilosophy.

### 3.10 Proyectos y tecnologías

1. RF-061: El sistema debe permitir CRUD de proyectos.
2. RF-062: Cada proyecto debe incluir título, descripción, imagen, año, tamaño de equipo, estado y bandera de destacado.
3. RF-063: El estado de proyecto debe aceptar únicamente valores definidos por catálogo (En desarrollo, Completado).
4. RF-064: El sistema debe permitir CRUD de tecnologías.
5. RF-065: El sistema debe permitir asociar múltiples tecnologías a múltiples proyectos.
6. RF-066: El sistema debe permitir consultar proyectos con sus tecnologías relacionadas.

Modelos asociados: Projects, Technologies, ProjectsTechnologies.

### 3.11 Redes sociales

1. RF-067: El sistema debe permitir CRUD de redes sociales.
2. RF-068: Cada red social debe incluir nombre, URL e ícono.

Modelos asociados: SocialNetworks.

## 4. Requerimientos funcionales no dependientes de base de datos

1. RF-069: El frontend debe usar una URL base de API configurable por variable de entorno para desacoplar ambientes.
2. RF-070: El sistema debe permitir renderizado de contenido estático de respaldo cuando la API no esté disponible.
3. RF-071: El sistema debe mostrar imágenes con fallback cuando falle la carga del recurso remoto.
4. RF-072: El sistema debe mantener una experiencia navegable sin autenticación para visitantes públicos.
5. RF-073: El sistema debe separar funcionalmente navegación de escritorio y navegación móvil.

## 5. Reglas funcionales de integridad de datos (derivadas de modelos)

1. RF-074: Todos los campos marcados como obligatorios en modelos backend deben ser obligatorios en operaciones de creación.
2. RF-075: Las longitudes máximas definidas en modelos backend deben respetarse en validación de entrada.
3. RF-076: No se debe permitir crear un blog con categoría inexistente.
4. RF-077: No se debe permitir registrar relación proyecto-tecnología con IDs inexistentes.
5. RF-078: Las respuestas de lectura deben exponer relaciones necesarias para renderizado del frontend (blog con categoría, proyecto con tecnologías).

## 6. Matriz de trazabilidad frontend-backend

1. Inicio y perfil público: User.
2. Sobre mí: Experience, MyPhilosophy, Achievement, Interests.
3. Proyectos: Projects, Technologies, ProjectsTechnologies.
4. Blog: Blog, BlogCategory.
5. Contacto: ContactInfo, AvailableService, FrequentlyAskedQuestion.
6. Navegación social: SocialNetworks.

## 7. Estado actual observado y requerimientos pendientes de implementación

1. RF-079: Integrar consumo real de API para reemplazar arreglos estáticos actuales del frontend.
2. RF-080: Implementar persistencia funcional para envío de formulario de contacto.
3. RF-081: Implementar lógica real de filtrado por categoría en blog.
4. RF-082: Implementar internacionalización real asociada al selector de idioma.
5. RF-083: Implementar descarga real de CV desde recurso configurable.

Estos requerimientos pendientes no contradicen los modelos backend; complementan la funcionalidad visible del frontend para llevar el sistema a operación completa.
