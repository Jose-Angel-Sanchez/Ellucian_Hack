# Ellucian Hack – Cursos y Contenido (Next.js + Supabase)

Gestión de cursos con autenticación Supabase, RLS y CRUD inline (crear, editar, eliminar) desde la misma vista. Incluye demo de video incrustado.

## Requisitos
- Node.js 18+
- Supabase Project (URL y anon key)
- Opcional (reclamar cursos huérfanos): Service Role Key

## Variables de entorno (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key
# Necesario para /api/courses/orphans/claim
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## Instalación y ejecución
```
npm i
npm run dev
# http://localhost:3000
```

## Base de datos y RLS
Ejecutar en Supabase SQL Editor:
- scripts/07-complete-rls-fix.sql

Resumen de políticas:
- courses:
  - SELECT: autenticados
  - INSERT: created_by = auth.uid()
  - UPDATE/DELETE: solo dueño (created_by = auth.uid())
- course_sections: CRUD permitido solo si el curso asociado es del usuario

Si tienes cursos antiguos sin owner:
```
UPDATE courses SET created_by = auth.uid() WHERE created_by IS NULL;
```

## Rutas principales
- / → Home. Botón “Ver Demo”
  - Clic: abre YouTube en modal
  - Mantener presionado: abre respaldo de Google Drive (sobre la misma página)
- /test-courses → Gestión de cursos (requiere login)
  - Crear curso (usa API de servidor)
  - Listado con edición y eliminación inline
  - Banner para “Reclamar” cursos huérfanos (si existen)

## CRUD de Cursos (UI)
- Crear: formulario “Crear Nuevo Curso”
- Editar inline: botón ✏️ → inputs → 💾 Guardar / ✖️ Cancelar
- Eliminar inline: botón 🗑️ (con confirmación)
- Reclamar huérfanos: aparece un banner si hay cursos con created_by NULL

## Endpoints (servidor)
- POST /api/courses/create
  - body: { title, category, level, duration }
  - Inserta con created_by = auth.uid() (vía cookies de sesión)
- PATCH /api/courses/[id]
  - body: campos a actualizar
  - Solo dueño
- DELETE /api/courses/[id]
  - Solo dueño
- POST /api/courses/orphans/claim
  - Requiere SUPABASE_SERVICE_ROLE_KEY
  - Restringido a emails @alumno.buap.mx por defecto
  - Asigna created_by = user.id a cursos con created_by NULL

Para cambiar la restricción de dominio, editar:
- app/api/courses/orphans/claim/route.ts

## Demo de Video en Home
- Modal responsivo incrustado
- Reproducción:
  - YouTube por defecto
  - Mantener presionado el botón “Ver Demo” → Google Drive (respaldo)

## Solución de problemas
- “User not authenticated”
  - Inicia sesión y recarga
  - Verifica que la vista esté envuelta por el AuthProvider/ClientWrapper
- “new row violates row-level security policy”
  - Ejecuta scripts/07-complete-rls-fix.sql
  - Asegura que `created_by` se envíe y coincida con `auth.uid()`
- No puedes editar/eliminar
  - No eres dueño del curso → usa el banner “Reclamar” o actualiza ownership vía SQL
- Reclamar no funciona
  - Falta SUPABASE_SERVICE_ROLE_KEY o tu email no es @alumno.buap.mx

## Estructura relevante
- components/courses/
  - courses-management.tsx (contenedor)
  - courses-list-minimal.tsx (lista con edición/eliminación inline)
  - course-form-minimal.tsx (formulario crear)
- app/api/courses/
  - create/route.ts (POST crear)
  - [id]/route.ts (PATCH/DELETE)
  - orphans/claim/route.ts (POST reclamar huérfanos)
- scripts/
  - 07-complete-rls-fix.sql (RLS completo cursos/secciones)

## Licencia
Uso interno sólo para demostración: Hack Puebla
