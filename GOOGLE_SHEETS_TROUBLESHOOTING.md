# 🔧 Solución de Problemas: Google Sheets

## Problema: "Curso no encontrado"

Si ves el mensaje "Curso no encontrado", verifica lo siguiente:

### 1. Verificar estructura de Google Sheets

Asegúrate de que tu hoja de Google Sheets tenga estas columnas exactas:

#### Hoja "Cursos"
- `id` (primera columna)
- `nombre` (segunda columna)
- `profesor_id` (tercera columna)
- `creado_en` (cuarta columna)

**Ejemplo:**
```
id              | nombre        | profesor_id | creado_en
curso_123       | Matemáticas   | prof_456    | 2024-01-15T10:00:00Z
```

#### Hoja "Alumnos"
- `id` (primera columna)
- `nombre` (segunda columna)
- `apellido` (tercera columna)
- `dni` (cuarta columna)
- `curso_id` (quinta columna)
- `creado_en` (sexta columna)

#### Hoja "Profesores"
- `id` (primera columna)
- `nombre` (segunda columna)
- `email` (tercera columna)
- `creado_en` (cuarta columna)

### 2. Verificar nombres de las hojas

Los nombres de las hojas deben ser **exactamente**:
- `Cursos` (con C mayúscula)
- `Alumnos` (con A mayúscula)
- `Profesores` (con P mayúscula)
- `Asistencias` (con A mayúscula)

### 3. Verificar permisos

- La hoja debe ser **pública** (Compartir → Cualquier persona con el enlace puede ver)
- O tener configurada una API Key válida

### 4. Verificar variables de entorno

En tu `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_SHEET_ID=tu_sheet_id_aqui
NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
```

### 5. Verificar en la consola del navegador

Abre la consola del navegador (F12) y busca:
- `📊 Datos de Google Sheets:` - Muestra cuántos cursos, profesores y alumnos se leyeron
- `🔍 Buscando curso:` - Muestra qué curso se está buscando y si se encontró
- `📄 Datos leídos de...` - Muestra los datos crudos leídos de Google Sheets

### 6. Verificar IDs

Los IDs deben ser consistentes:
- El `curso_id` en la hoja "Alumnos" debe coincidir con el `id` en la hoja "Cursos"
- El `profesor_id` en la hoja "Cursos" debe coincidir con el `id` en la hoja "Profesores"

## Problema: No puedo eliminar cursos

### 1. Verificar Google Apps Script

Asegúrate de que:
- El Apps Script esté desplegado correctamente
- La URL de `NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL` sea correcta
- El Apps Script tenga permisos para editar la hoja

### 2. Verificar que el Apps Script tenga la función de eliminación

El Apps Script debe tener soporte para `action=deleteByField`. Si usas una versión antigua, actualiza el código del Apps Script con la versión más reciente de `GOOGLE_APPS_SCRIPT.js`.

### 3. Verificar en la consola

Si hay errores al eliminar, aparecerán en la consola del navegador.

## Problema: Los datos no se actualizan

### 1. Invalidar caché

React Query cachea los datos. Para forzar una actualización:
- Recarga la página (F5)
- O espera unos segundos (la caché se invalida automáticamente después de ciertas operaciones)

### 2. Verificar que los datos se escribieron en Google Sheets

Abre tu Google Sheet y verifica que los datos estén ahí.

## Verificación rápida

1. Abre la consola del navegador (F12)
2. Ve a la pestaña "Console"
3. Busca mensajes que empiecen con `📊`, `🔍`, o `📄`
4. Verifica que los datos se estén leyendo correctamente

## Estructura de datos esperada

### Ejemplo de hoja "Cursos"
```
id              | nombre        | profesor_id | creado_en
curso_001       | Matemáticas   | prof_001    | 2024-01-15T10:00:00Z
curso_002       | Lengua        | prof_001    | 2024-01-16T10:00:00Z
```

### Ejemplo de hoja "Alumnos"
```
id              | nombre    | apellido | dni       | curso_id  | creado_en
alumno_001      | Juan      | Pérez    | 12345678  | curso_001 | 2024-01-17T10:00:00Z
alumno_002      | María     | García   | 87654321  | curso_001 | 2024-01-17T10:00:00Z
```

### Ejemplo de hoja "Profesores"
```
id              | nombre        | email                  | creado_en
prof_001        | Prof. López   | profesor@ejemplo.com   | 2024-01-10T10:00:00Z
```

## Contacto

Si después de verificar todo esto sigues teniendo problemas, revisa:
1. Los logs en la consola del navegador
2. Los logs en Google Apps Script (Ver → Ejecuciones)
3. La configuración de variables de entorno

