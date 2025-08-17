# 🔧 Guía de Configuración de Supabase

## Problema Resuelto ✅

El error `createClient is not a function` ha sido corregido. Ahora tienes dos opciones:

### Opción 1: Modo Demo (Inmediato)
- ✅ **Funciona ahora mismo**
- ✅ Componentes simplificados sin dependencia de Supabase
- ✅ Datos de ejemplo para demostrar funcionalidad
- 🚀 **Accede a:** `http://localhost:3000/test-courses`

### Opción 2: Configuración Completa con Supabase

#### 1. Crear proyecto en Supabase
```bash
# Visita: https://supabase.com
# 1. Crea una cuenta gratuita
# 2. Crea un nuevo proyecto
# 3. Anota la URL y la clave pública (anon key)
```

#### 2. Configurar variables de entorno
```bash
# Copia el archivo de ejemplo
cp .env.example .env.local

# Edita .env.local con tus datos reales:
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 3. Crear las tablas en Supabase
```sql
-- Ejecuta en el SQL Editor de Supabase:
-- Archivo: scripts/05-setup-courses-table.sql
```

#### 4. Cambiar a componentes completos
```tsx
// En courses-management-wrapper.tsx, cambiar:
import CoursesManagementSimplified from './courses-management-simplified'
// Por:
import CoursesManagement from './courses-management'
```

## Componentes Disponibles

### 🎯 Versión Simplificada (Actual)
- `CourseFormSimplified` - Formulario que simula creación
- `CoursesListSimplified` - Lista con datos de ejemplo
- `CoursesManagementSimplified` - Gestor completo modo demo

### 🚀 Versión Completa (Requiere Supabase)
- `CourseFormMinimal` - Formulario con base de datos real
- `CoursesListMinimal` - Lista conectada a Supabase
- `CoursesManagement` - Gestor con funcionalidad completa

## Rutas de Prueba

### Modo Demo (Funcionando)
- `/test-courses` - Página de prueba con versión simplificada

### Modo Producción (Requiere configuración)
- `/admin/courses` - Gestión completa (solo administradores)
- `/courses` - Vista pública de cursos

## Estado Actual ✅

1. ✅ Error de `createClient` corregido
2. ✅ Componentes simplificados funcionando
3. ✅ Página de prueba accesible
4. ✅ Interfaz completa disponible
5. ✅ Documentación de configuración

## Próximos Pasos

1. **Inmediato:** Prueba la funcionalidad en `/test-courses`
2. **Opcional:** Configura Supabase para funcionalidad completa
3. **Desarrollo:** Agrega gestión de secciones y contenido
