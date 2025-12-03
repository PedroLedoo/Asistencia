# 📋 Hoja "Asistencias" en Google Sheets

## Estructura de la Hoja

La hoja "Asistencias" debe tener estas columnas **exactamente en este orden**:

### Columnas

1. **id** - Identificador único de la asistencia
2. **alumno_id** - ID del alumno (debe coincidir con el `id` de la hoja "Alumnos")
3. **fecha** - Fecha de la asistencia (formato: YYYY-MM-DD, ej: 2024-01-15)
4. **estado** - Estado de la asistencia: `presente`, `ausente`, o `tarde`
5. **cargado_por** - ID del profesor que cargó la asistencia
6. **creado_en** - Fecha y hora de creación (formato ISO: 2024-01-15T10:00:00Z)

### Ejemplo de Datos

```
id                  | alumno_id   | fecha       | estado   | cargado_por | creado_en
asist_1234567890    | alumno_001  | 2024-01-15  | presente | prof_001    | 2024-01-15T10:00:00Z
asist_1234567891    | alumno_002  | 2024-01-15  | ausente  | prof_001    | 2024-01-15T10:00:00Z
asist_1234567892    | alumno_003  | 2024-01-15  | tarde    | prof_001    | 2024-01-15T10:00:00Z
```

## Cómo se Usa

### Al Guardar Asistencias

Cuando guardas asistencias desde la aplicación:

1. **Se eliminan las asistencias existentes** para los alumnos y fecha seleccionados (para evitar duplicados)
2. **Se crean nuevas asistencias** con los estados actualizados
3. **Cada asistencia tiene un ID único** generado automáticamente

### Formato de Fecha

- **fecha**: Debe estar en formato `YYYY-MM-DD` (ej: `2024-01-15`)
- **creado_en**: Debe estar en formato ISO 8601 (ej: `2024-01-15T10:00:00Z`)

### Estados Válidos

Solo se aceptan estos valores para `estado`:
- `presente` - El alumno asistió
- `ausente` - El alumno no asistió
- `tarde` - El alumno llegó tarde

## Relaciones

### Con la Hoja "Alumnos"

- El `alumno_id` en "Asistencias" debe coincidir con el `id` en "Alumnos"
- Si un alumno no existe en "Alumnos", la asistencia no se mostrará correctamente

### Con la Hoja "Profesores"

- El `cargado_por` debe coincidir con el `id` de un profesor en la hoja "Profesores"
- Esto permite saber quién cargó cada asistencia

## Ejemplo Completo

Supongamos que tienes:

**Hoja "Alumnos":**
```
id          | nombre  | apellido | dni       | curso_id  | creado_en
alumno_001  | Juan    | Pérez    | 12345678  | curso_001 | 2024-01-10T10:00:00Z
alumno_002  | María   | García   | 87654321  | curso_001 | 2024-01-10T10:00:00Z
```

**Hoja "Profesores":**
```
id          | nombre      | email              | creado_en
prof_001    | Prof. López | profesor@ejemplo.com | 2024-01-01T10:00:00Z
```

**Hoja "Asistencias" (después de guardar):**
```
id              | alumno_id  | fecha       | estado   | cargado_por | creado_en
asist_1705123456| alumno_001 | 2024-01-15  | presente | prof_001    | 2024-01-15T10:30:00Z
asist_1705123457| alumno_002 | 2024-01-15  | ausente  | prof_001    | 2024-01-15T10:30:00Z
```

## Notas Importantes

1. **No duplicar asistencias**: El sistema elimina automáticamente las asistencias existentes antes de crear nuevas para la misma fecha y alumno
2. **IDs únicos**: Cada asistencia debe tener un `id` único. El sistema los genera automáticamente
3. **Formato de fecha**: La fecha debe estar en formato `YYYY-MM-DD` (no usar barras `/` o puntos `.`)
4. **Mayúsculas/minúsculas**: Los estados son case-sensitive: `presente`, `ausente`, `tarde` (todo en minúsculas)

## Verificación

Para verificar que tus asistencias se están guardando correctamente:

1. Abre tu Google Sheet
2. Ve a la hoja "Asistencias"
3. Verifica que:
   - Los encabezados sean exactamente: `id`, `alumno_id`, `fecha`, `estado`, `cargado_por`, `creado_en`
   - Los `alumno_id` coincidan con IDs en la hoja "Alumnos"
   - Las fechas estén en formato `YYYY-MM-DD`
   - Los estados sean `presente`, `ausente`, o `tarde`

## Solución de Problemas

### Las asistencias no se guardan

1. Verifica que `NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL` esté configurada en `.env.local`
2. Verifica que el Apps Script tenga permisos para editar la hoja
3. Revisa la consola del navegador (F12) para ver errores

### Las asistencias no se muestran

1. Verifica que los `alumno_id` coincidan con los `id` en la hoja "Alumnos"
2. Verifica que las fechas estén en formato correcto (`YYYY-MM-DD`)
3. Verifica que la hoja "Asistencias" sea pública o tengas API Key configurada

### Estados incorrectos

1. Asegúrate de que los estados sean exactamente: `presente`, `ausente`, o `tarde` (todo en minúsculas)
2. No uses mayúsculas ni espacios adicionales

