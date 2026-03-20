# Requerimientos Funcionales del Proyecto Portafolio

Este documento detalla los requerimientos funcionales del sistema, derivados del análisis del frontend y alineados con los modelos definidos en el backend.

## 1. Alcance funcional

El sistema debe cubrir dos frentes:

1. **Sitio público de portafolio** (frontend): Interfaz de presentación profesional.
2. **Gestión de contenido (CMS/API)**: Panel administrativo para gestionar la información del portafolio.

---

## 2. Requerimientos funcionales del sitio público (frontend)

### 2.1 Navegación y estructura general

| ID | Requerimiento |
|---|---|
| RF-001 | El sistema debe mostrar una aplicación de una sola página con secciones: Inicio, Sobre mí, Proyectos, Blog y Contacto. |
| RF-002 | El usuario debe poder cambiar de sección desde navegación de escritorio. |
| RF-003 | El usuario debe poder abrir y cerrar menú de navegación móvil. |
| RF-004 | Al seleccionar una opción del menú móvil, el sistema debe cerrar el panel lateral automáticamente. |
| RF-005 | El sistema debe resaltar visualmente la sección activa en la navegación. |

### 2.2 Tema y preferencias de usuario

| ID | Requerimiento |
|---|---|
| RF-006 | El sistema debe permitir alternar entre modo claro y modo oscuro. |
| RF-007 | El sistema debe persistir la preferencia de tema en almacenamiento local del navegador. |
| RF-008 | En primera carga, si no hay preferencia guardada, el sistema debe respetar la preferencia del sistema operativo. |

### 2.3 Cabecera y acciones globales

| ID | Requerimiento |
|---|---|
| RF-009 | El sistema debe mostrar cabecera fija en la parte superior. |
| RF-010 | El sistema debe incluir selector de idioma (Español/Inglés) en la cabecera. |
| RF-011 | El sistema debe incluir acción para descarga de CV. |

### 2.4 Sección Inicio

| ID | Requerimiento |
|---|---|
| RF-012 | El sistema debe mostrar datos de perfil profesional: nombre, rol, ubicación, resumen profesional y foto. |
| RF-013 | El sistema debe mostrar un listado de habilidades principales como etiquetas. |
| RF-014 | El sistema debe incluir llamados a la acción para ver proyectos y contactar. |
| RF-015 | El sistema debe mostrar estado de disponibilidad para proyectos. |

### 2.5 Sección Sobre mí

| ID | Requerimiento |
|---|---|
| RF-016 | El sistema debe mostrar línea de tiempo de experiencia profesional. |
| RF-017 | El sistema debe mostrar habilidades técnicas con nivel porcentual. |
| RF-018 | El sistema debe mostrar filosofía profesional. |
| RF-019 | El sistema debe mostrar logros destacados. |
| RF-020 | El sistema debe mostrar intereses personales/profesionales. |

### 2.6 Sección Proyectos

| ID | Requerimiento |
|---|---|
| RF-021 | El sistema debe listar proyectos destacados y no destacados. |
| RF-022 | El sistema debe mostrar por proyecto: título, descripción, imagen, tecnologías, estado, año y tamaño de equipo. |
| RF-023 | El sistema debe mostrar estado del proyecto (p. ej., En desarrollo o Completado) con estilo visual diferenciado. |
| RF-024 | El sistema debe permitir acceder a demo y repositorio de cada proyecto. |
| RF-025 | El sistema debe presentar proyectos destacados en formato de mayor jerarquía visual. |

### 2.7 Sección Blog

| ID | Requerimiento |
|---|---|
| RF-026 | El sistema debe listar artículos destacados y artículos generales. |
| RF-027 | El sistema debe mostrar por artículo: título, resumen, imagen, categoría y fecha. |
| RF-028 | El sistema debe mostrar tiempo estimado de lectura por artículo. |
| RF-029 | El sistema debe permitir filtrar visualmente por categorías de blog. |
| RF-030 | El sistema debe incluir acción para leer más y acción de guardado/marcador. |

### 2.8 Sección Contacto

| ID | Requerimiento |
|---|---|
| RF-031 | El sistema debe mostrar información de contacto: correo, teléfono, ubicación y disponibilidad. |
| RF-032 | El sistema debe mostrar servicios profesionales disponibles. |
| RF-033 | El sistema debe proporcionar formulario de contacto con campos: nombre, correo, empresa (opcional), presupuesto, asunto y mensaje. |
| RF-034 | El sistema debe permitir envío del formulario de contacto. |
| RF-035 | El sistema debe mostrar sección de preguntas frecuentes. |
| RF-036 | El sistema debe ofrecer acción para programar llamada. |

### 2.9 Enlaces externos

| ID | Requerimiento |
|---|---|
| RF-037 | El sistema debe mostrar enlaces a redes sociales profesionales. |
| RF-038 | Los enlaces externos deben abrir en nueva pestaña de forma segura. |

### 2.10 Responsividad y experiencia

| ID | Requerimiento |
|---|---|
| RF-039 | El sistema debe adaptarse a móvil, tablet y escritorio. |
| RF-040 | El sistema debe mantener legibilidad y jerarquía visual en todos los tamaños de pantalla. |
| RF-041 | El sistema debe incluir transiciones visuales suaves en interacciones principales. |

---

## 3. Requerimientos funcionales de gestión de datos

Los siguientes requerimientos están alineados con los modelos SQLAlchemy y deben exponerse por API para que el frontend consuma contenido dinámico.

### 3.1 Administración de usuario y perfil

| ID | Requerimiento | Modelo |
|---|---|---|
| RF-042 | El sistema debe permitir CRUD de usuario administrador. | User |
| RF-043 | El sistema debe almacenar credenciales de acceso del administrador de forma segura (hash). | User |
| RF-044 | El sistema debe administrar datos de perfil público: nombre, perfil profesional, descripción, imagen y ubicación. | User |

### 3.2 Logros

| ID | Requerimiento | Modelo |
|---|---|---|
| RF-045 | El sistema debe permitir CRUD de logros profesionales. | Achievement |
| RF-046 | Cada logro debe contener título y subtítulo. | Achievement |

### 3.3 Servicios disponibles

| ID | Requerimiento | Modelo |
|---|---|---|
| RF-047 | El sistema debe permitir CRUD de servicios profesionales ofrecidos. | AvailableService |

### 3.4 Categorías y publicaciones de blog

| ID | Requerimiento | Modelo |
|---|---|---|
| RF-048 | El sistema debe permitir CRUD de categorías de blog. | BlogCategory |
| RF-049 | El sistema debe permitir CRUD de publicaciones de blog. | Blog |
| RF-050 | Cada publicación debe estar asociada obligatoriamente a una categoría válida. | Blog ↔ BlogCategory |
| RF-051 | Cada publicación debe contener: título, descripción, imagen y fecha de publicación. | Blog |

### 3.5 Información de contacto

| ID | Requerimiento | Modelo |
|---|---|---|
| RF-052 | El sistema debe permitir CRUD de información de contacto. | ContactInfo |
| RF-053 | La información de contacto debe incluir: correo, teléfono, ubicación y disponibilidad. | ContactInfo |

### 3.6 Experiencia profesional

| ID | Requerimiento | Modelo |
|---|---|---|
| RF-054 | El sistema debe permitir CRUD de experiencias laborales. | Experience |
| RF-055 | Cada experiencia debe incluir: cargo, empresa, fecha de inicio y fecha de fin. | Experience |

### 3.7 Preguntas frecuentes

| ID | Requerimiento | Modelo |
|---|---|---|
| RF-056 | El sistema debe permitir CRUD de FAQ. | FrequentlyAskedQuestion |
| RF-057 | Cada FAQ debe incluir: pregunta y respuesta. | FrequentlyAskedQuestion |

### 3.8 Intereses

| ID | Requerimiento | Modelo |
|---|---|---|
| RF-058 | El sistema debe permitir CRUD de intereses. | Interests |

### 3.9 Filosofía profesional

| ID | Requerimiento | Modelo |
|---|---|---|
| RF-059 | El sistema debe permitir CRUD del bloque de filosofía profesional. | MyPhilosophy |
| RF-060 | La filosofía debe incluir: texto descriptivo e imagen de apoyo. | MyPhilosophy |

### 3.10 Proyectos y tecnologías

| ID | Requerimiento | Modelo |
|---|---|---|
| RF-061 | El sistema debe permitir CRUD de proyectos. | Projects |
| RF-062 | Cada proyecto debe incluir: título, descripción, imagen, año, tamaño de equipo, estado y bandera de destacado. | Projects |
| RF-063 | El estado de proyecto debe aceptar únicamente valores predefinidos: "En desarrollo", "Completado". | Projects |
| RF-064 | El sistema debe permitir CRUD de tecnologías. | Technologies |
| RF-065 | El sistema debe permitir asociar múltiples tecnologías a múltiples proyectos. | ProjectsTechnologies |
| RF-066 | El sistema debe permitir consultar proyectos con sus tecnologías relacionadas. | Projects ↔ Technologies |

### 3.11 Redes sociales

| ID | Requerimiento | Modelo |
|---|---|---|
| RF-067 | El sistema debe permitir CRUD de redes sociales. | SocialNetworks |
| RF-068 | Cada red social debe incluir: nombre, URL e ícono. | SocialNetworks |

---

## 4. Requerimientos no dependientes de base de datos

| ID | Requerimiento |
|---|---|
| RF-069 | El frontend debe usar una URL base de API configurable por variable de entorno para desacoplar entornos. |
| RF-070 | El sistema debe mostrar contenido estático de respaldo cuando la API no esté disponible. |
| RF-071 | El sistema debe mostrar imágenes con fallback cuando falle la carga del recurso remoto. |
| RF-072 | El sistema debe mantener una experiencia navegable sin autenticación para visitantes públicos. |
| RF-073 | El sistema debe separar funcionalmente navegación de escritorio y navegación móvil. |

---

## 5. Reglas funcionales de integridad de datos

| ID | Regla |
|---|---|
| RF-074 | Todos los campos obligatorios en modelos backend deben serlo en operaciones de creación. |
| RF-075 | Las longitudes máximas definidas en modelos backend deben respetarse en validación de entrada. |
| RF-076 | No se permite crear un blog con categoría inexistente. |
| RF-077 | No se permite registrar relación proyecto-tecnología con IDs inexistentes. |
| RF-078 | Las respuestas de lectura deben exponer relaciones necesarias para renderizado (blog + categoría, proyecto + tecnologías). |

---

## 6. Matriz de trazabilidad frontend-backend

| Sección | Modelos asociados |
|---------|------------------|
| Inicio y perfil público | User |
| Sobre mí | Experience, MyPhilosophy, Achievement, Interests |
| Proyectos | Projects, Technologies, ProjectsTechnologies |
| Blog | Blog, BlogCategory |
| Contacto | ContactInfo, AvailableService, FrequentlyAskedQuestion |
| Redes sociales | SocialNetworks |

---

## 7. Requerimientos pendientes de implementación

Estos requerimientos están identificados como next-steps funcionales que complementan la operación completa:

| ID | Requerimiento | Prioridad |
|---|---|---|
| RF-079 | Integrar consumo real de API para reemplazar arreglos estáticos del frontend. | Alta |
| RF-080 | Implementar persistencia funcional para envío del formulario de contacto. | Alta |
| RF-081 | Implementar lógica real de filtrado por categoría en blog. | Media |
| RF-082 | Implementar internacionalización (i18n) real asociada al selector de idioma. | Media |
| RF-083 | Implementar descarga real de CV desde recurso configurable. | Media |

---

## Convenciones de nomenclatura

- **RF-XXX**: Requerimiento Funcional
- **ID**: Identificador único del requerimiento
- **Modelos**: Referencias a clases SQLAlchemy en `backend/models/`

---

**Última actualización:** Marzo 2026
